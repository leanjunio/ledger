import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./style.css";

type AppState = {
  rootPath: string | null;
  filePaths: string[];
  selectedPath: string | null;
  editorContent: string;
};

const state: AppState = {
  rootPath: null,
  filePaths: [],
  selectedPath: null,
  editorContent: "",
};

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Element #${id} not found`);
  return el as T;
}

function renderFileTree() {
  const list = getEl<HTMLUListElement>("file-list");
  list.innerHTML = "";
  if (state.filePaths.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No .md files";
    li.className = "empty";
    list.appendChild(li);
    return;
  }
  for (const path of state.filePaths) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = path.split("/").pop() ?? path;
    a.dataset.path = path;
    a.className = state.selectedPath === path ? "selected" : "";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      selectFile(path);
    });
    li.appendChild(a);
    list.appendChild(li);
  }
}

async function selectFile(path: string) {
  state.selectedPath = path;
  renderFileTree();
  try {
    const content = await invoke<string>("read_file", { path });
    state.editorContent = content ?? "";
  } catch (err) {
    state.editorContent = "";
    console.error(err);
  }
  renderEditor();
  await updateOutline();
  await invoke("save_session", { last_file_path: path });
}

type TreeNode = {
  id: number;
  depth: number;
  text: string;
  tags: string[];
  parent_id: number | null;
  children_ids: number[];
};

async function updateOutline() {
  const outlineEl = getEl<HTMLDivElement>("outline");
  if (!state.selectedPath || !state.editorContent) {
    outlineEl.innerHTML = "";
    return;
  }
  try {
    const result = await invoke<{ nodes: TreeNode[] }>("parse_file", {
      path: state.selectedPath,
      content: state.editorContent,
    });
    outlineEl.innerHTML = "";
    for (const node of result.nodes) {
      const div = document.createElement("div");
      div.className = "node";
      div.style.setProperty("--depth", String(node.depth));
      const textSpan = document.createElement("span");
      textSpan.textContent = node.text || "(empty)";
      div.appendChild(textSpan);
      if (node.tags.length > 0) {
        const tagSpan = document.createElement("span");
        tagSpan.className = "tags";
        tagSpan.textContent = " " + node.tags.map((t) => "#" + t).join(" ");
        div.appendChild(tagSpan);
      }
      outlineEl.appendChild(div);
    }
  } catch {
    outlineEl.innerHTML = "";
  }
}

function renderEditor() {
  const editorArea = getEl<HTMLDivElement>("editor-area");
  editorArea.innerHTML = "";
  if (!state.selectedPath) {
    const p = document.createElement("p");
    p.className = "placeholder";
    p.textContent = "Select a file or open a vault to get started.";
    editorArea.appendChild(p);
    return;
  }
  const toolbar = document.createElement("div");
  toolbar.className = "editor-toolbar";
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Save";
  saveBtn.addEventListener("click", saveFile);
  toolbar.appendChild(saveBtn);
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete file";
  deleteBtn.className = "danger";
  deleteBtn.addEventListener("click", deleteCurrentFile);
  toolbar.appendChild(deleteBtn);
  editorArea.appendChild(toolbar);
  const textarea = document.createElement("textarea");
  textarea.id = "editor-text";
  textarea.className = "editor-text";
  textarea.value = state.editorContent;
  textarea.placeholder = "Markdown content...";
  textarea.addEventListener("input", () => {
    state.editorContent = textarea.value;
    debouncedUpdateOutline();
  });
  editorArea.appendChild(textarea);
}

let outlineDebounce: ReturnType<typeof setTimeout> | null = null;
function debouncedUpdateOutline() {
  if (outlineDebounce) clearTimeout(outlineDebounce);
  outlineDebounce = setTimeout(() => {
    outlineDebounce = null;
    updateOutline();
  }, 300);
}

async function saveFile() {
  if (!state.selectedPath) return;
  try {
    await invoke("write_file", {
      path: state.selectedPath,
      content: state.editorContent,
    });
  } catch (err) {
    console.error(err);
    alert(String(err));
  }
}

async function deleteCurrentFile() {
  if (!state.selectedPath) return;
  if (!confirm(`Delete "${state.selectedPath}"?`)) return;
  try {
    await invoke("delete_file", { path: state.selectedPath });
    state.selectedPath = null;
    state.editorContent = "";
    await refreshFileList();
    renderFileTree();
    renderEditor();
  } catch (err) {
    console.error(err);
    alert(String(err));
  }
}

async function refreshFileList() {
  try {
    const paths = await invoke<string[]>("list_files");
    state.filePaths = paths ?? [];
  } catch {
    state.filePaths = [];
  }
}

async function createFile() {
  const name = window.prompt("File name (e.g. note.md):");
  if (!name || !name.trim()) return;
  let path = name.trim();
  if (!path.endsWith(".md")) path += ".md";
  try {
    await invoke("create_file", { path });
    await refreshFileList();
    renderFileTree();
    selectFile(path);
  } catch (err) {
    console.error(err);
    alert(String(err));
  }
}

async function openVault() {
  const selected = await open({
    directory: true,
    multiple: false,
  });
  if (selected === null || typeof selected !== "string") return;
  try {
    const result = await invoke<{ root_path: string; file_paths: string[] }>("open_vault", {
      path: selected,
    });
    state.rootPath = result.root_path;
    state.filePaths = result.file_paths;
    state.selectedPath = null;
    state.editorContent = "";
    await invoke("save_session", {
      last_vault_path: result.root_path,
    });
    renderFileTree();
    renderEditor();
  } catch (err) {
    console.error(err);
    alert(String(err));
  }
}

async function loadSession() {
  try {
    const session = await invoke<{
      last_vault_path?: string;
      last_file_path?: string;
    }>("get_session");
    if (session.last_vault_path) {
      try {
        const result = await invoke<{ root_path: string; file_paths: string[] }>("open_vault", {
          path: session.last_vault_path,
        });
        state.rootPath = result.root_path;
        state.filePaths = result.file_paths;
        if (session.last_file_path && state.filePaths.includes(session.last_file_path)) {
          state.selectedPath = session.last_file_path;
          const content = await invoke<string>("read_file", { path: session.last_file_path });
          state.editorContent = content ?? "";
        }
      } catch {
        // vault path invalid
      }
    }
  } catch {
    // no session
  }
  renderFileTree();
  renderEditor();
}

type QueryResultItem = {
  file_path: string;
  parent_path: string | null;
  node: TreeNode;
};

async function runQuery() {
  const tag = (getEl<HTMLInputElement>("query-input").value || "").trim();
  if (!tag) return;
  try {
    const items = await invoke<QueryResultItem[]>("query_by_tag", {
      tag_names: [tag],
    });
    showResults(
      "Query: #" + tag,
      items.map((item) => ({
        filePath: item.file_path,
        label: `${item.file_path}${item.parent_path ? " · " + item.parent_path : ""}: ${item.node.text.slice(0, 50)}...`,
      })),
    );
  } catch (err) {
    console.error(err);
    alert(String(err));
  }
}

type SearchMatchItem = {
  file_path: string;
  snippet_or_line: string;
};

async function runSearch() {
  const q = (getEl<HTMLInputElement>("search-input").value || "").trim();
  if (!q) return;
  try {
    const matches = await invoke<SearchMatchItem[]>("search_full_text", {
      query: q,
      fuzzy: false,
    });
    showResults(
      "Search: " + q,
      matches.map((m) => ({
        filePath: m.file_path,
        label: m.file_path + ": " + m.snippet_or_line.slice(0, 60) + (m.snippet_or_line.length > 60 ? "..." : ""),
      })),
    );
  } catch (err) {
    console.error(err);
    alert(String(err));
  }
}

function showResults(title: string, entries: { filePath: string; label: string }[]) {
  const panel = getEl<HTMLDivElement>("results-panel");
  const titleEl = getEl<HTMLSpanElement>("results-title");
  const list = getEl<HTMLUListElement>("results-list");
  titleEl.textContent = title;
  list.innerHTML = "";
  for (const e of entries) {
    const li = document.createElement("li");
    li.textContent = e.label;
    li.dataset.path = e.filePath;
    li.addEventListener("click", () => {
      selectFile(e.filePath);
      panel.classList.add("hidden");
    });
    list.appendChild(li);
  }
  panel.classList.remove("hidden");
}

function setupUi() {
  getEl<HTMLButtonElement>("open-vault-btn").addEventListener("click", openVault);
  getEl<HTMLButtonElement>("create-file-btn").addEventListener("click", createFile);
  getEl<HTMLButtonElement>("query-btn").addEventListener("click", runQuery);
  getEl<HTMLButtonElement>("search-btn").addEventListener("click", runSearch);
  getEl<HTMLButtonElement>("close-results").addEventListener("click", () => {
    getEl<HTMLDivElement>("results-panel").classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupUi();
  loadSession();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    saveFile();
  }
});
