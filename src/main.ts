import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import "./style.css";

type AppState = {
  rootPath: string | null;
  filePaths: string[];
  selectedPath: string | null;
};

const state: AppState = {
  rootPath: null,
  filePaths: [],
  selectedPath: null,
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
      state.selectedPath = path;
      renderFileTree();
      renderEditor();
    });
    li.appendChild(a);
    list.appendChild(li);
  }
}

function renderEditor() {
  const editorArea = getEl<HTMLDivElement>("editor-area");
  editorArea.innerHTML = "";
  const p = document.createElement("p");
  p.className = "placeholder";
  p.textContent = state.selectedPath
    ? "Select a file or open a vault to get started."
    : "Open a vault to get started.";
  editorArea.appendChild(p);
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

function setupUi() {
  getEl<HTMLButtonElement>("open-vault-btn").addEventListener("click", openVault);
}

document.addEventListener("DOMContentLoaded", () => {
  setupUi();
  loadSession();
});
