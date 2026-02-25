# Implementation Plan: Developer Ledger MVP

**Branch**: `001-developer-ledger` | **Date**: 2025-02-24 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-developer-ledger/spec.md`

**Executor**: Read [execution-principles.md](./execution-principles.md) first. This plan assumes no prior knowledge; every phase has Purpose, Goals, Implementation, and Validation.

---

## Purpose

This document is the **implementation plan** for the Developer Ledger MVP. It tells the executor exactly what to build, in what order, and how to check that each part is correct. The plan is driven by the feature spec (`spec.md`); each phase traces to specific functional requirements (FRs) or user stories so the executor can validate at every step.

---

## Goals (when the full plan is done)

- A **desktop application** runs on the user's machine (Windows, macOS, or Linux) and opens one **vault** (folder) at a time.
- The user can **create, open, edit, save, and delete** markdown files inside that vault and see a **file tree** (list of files) on the side.
- Each file can contain a **hierarchy of list items** (bulleted lines, with nesting). The user can attach **tags** (e.g. `#decision`) to list items.
- The user can **query** by tag (and optional scope) and **search** full text across all files; results are navigable.
- **Undo/redo**, **session restore** (last vault and file), **light/dark theme**, and **local-only** data and logs are implemented as in the spec.

All of the above must be verifiable using the Validation sections in this plan and the checklist in quickstart.md.

---

## Glossary (define before use)

The executor must not guess what these terms mean. Use only these definitions.

| Term | Definition |
|------|------------|
| **Vault** | A single folder on disk that the user selects. All markdown files for "the workspace" live under this folder. The app supports exactly one vault open at a time. |
| **Markdown** | Plain-text format. For Ledger, the only structure we rely on is **lists**: lines starting with `-` or `*`, optionally indented with spaces to show parent/child. Each such line is a **list item**. |
| **List item** | One bullet line in a markdown file. It has depth (indentation level), text (the rest of the line), and zero or more **tags** (e.g. `#decision`). |
| **Tag** | A token in list item text: `#` followed by letters/numbers/hyphens (e.g. `#decision`, `#ci`). Used to filter items in the query feature. Stored only inline in the file text. |
| **File tree** | UI list of all markdown files in the current vault. User can click a file to open it in the editor. |
| **Query** | User asks: "Show all list items that have tag X (and optionally under node Y)." Result is a list of matches with context; user can click to open the file and go to that item. |
| **Search** | User types text; app finds that text (or fuzzy match) in file contents across the vault and shows matches; user can jump to the location. |
| **Tauri** | A framework to build desktop apps: the **backend** is Rust (runs on the machine), the **frontend** is HTML/JS/TypeScript (what the user sees). They talk via **commands** (frontend calls Rust functions). This project uses **Tauri v2** only. |
| **FR** | Functional requirement in spec.md (e.g. FR-001). Implementation must satisfy these. |
| **Spec** | The file `spec.md` in this folder. It is the single source of truth for *what* the product must do. |

---

## Wrong sources for tech or product decisions

Do **not** use Tauri v1 docs, random blogs, or other apps' behavior as the source of truth. Use only:

- This folder's docs (spec.md, plan.md, research.md, data-model.md, contracts, execution-principles.md).
- Official Tauri v2 docs: https://v2.tauri.app/
- Official Rust and TypeScript docs for the versions stated in Technical Context.
- Crate/package docs for the **exact** crates and versions named in research.md.

See [execution-principles.md](./execution-principles.md) for the full "Wrong sources" list.

---

## Technical Context

Filled so the executor does not have to guess versions or stack.

| Field | Value | Meaning for executor |
|-------|--------|----------------------|
| **Language/Version** | Rust stable 1.75+; TypeScript ES2020+ | Use at least these versions. Install Rust via rustup.rs, Node LTS for TypeScript. |
| **Primary dependencies** | Tauri 2.x; see research.md for crates (pulldown-cmark, fuzzy-matcher, tracing) | Do not substitute other markdown or search libs unless research.md is updated. |
| **Storage** | Local filesystem only | No database, no cloud. Files are normal files in the vault folder. |
| **Testing** | `cargo test` (Rust); frontend test runner if added (e.g. Vitest) | Run tests after each phase that adds code. |
| **Target platform** | Desktop (Windows, macOS, Linux) via Tauri | No web, no mobile. |
| **Project type** | desktop-app | One Tauri app: Rust backend + TypeScript frontend. |
| **Performance goals** | Tree and query responsive for hundreds of items; search results in &lt;2s | If the UI or search is slow, it is a bug to fix. |
| **Constraints** | Local-only; offline; logs on user device only; keyboard-primary input | No telemetry, no network for data. |

---

## Constitution Check

Before starting implementation, confirm alignment with `.specify/memory/constitution.md`:

- **Code quality**: Use consistent naming and structure; use linters/formatters as configured.
- **Testing standards**: Where the spec or constitution require tests, write/run tests and ensure they fail before implementation and pass after.
- **User experience consistency**: Use the terminology from the spec (vault, list item, tag, query) and match the described behavior.
- **Performance**: Do not regress the performance goals above without documenting why.
- **Technical decision governance**: No exceptions without documenting in Complexity Tracking below.

If any of these are violated during implementation, stop and fix before adding new features.

---

## Project structure (where files go)

Documentation for this feature:

```text
specs/001-developer-ledger/
├── execution-principles.md   # How to execute (read first)
├── plan.md                   # This file
├── research.md               # Exact tech choices and wrong sources
├── data-model.md             # Entities and validation
├── quickstart.md             # Setup, build, run, validation checklist
├── contracts/                # Tauri command API
│   └── tauri-commands.md
└── tasks.md                  # Generated task list (from /speckit.tasks)
```

Source code (repository root):

```text
src-tauri/                    # Rust backend
├── src/
│   ├── lib.rs
│   ├── main.rs
│   ├── commands/             # Tauri commands (vault, file, search, query)
│   ├── fs/                   # Vault and file I/O
│   ├── markdown/             # Parse list hierarchy and tags
│   └── search/               # Full-text and tag query
├── Cargo.toml
└── tauri.conf.json

src/                          # TypeScript frontend (UI, editor, tree, query view)
...

tests/
├── integration/              # Rust integration tests
└── ...
```

The executor must create or modify only under these paths. Do not add new top-level projects or move backend/frontend to different roots unless the plan is updated.

---

## Phases (one thing per phase)

Each phase has exactly one purpose. Complete Validation for a phase before starting the next.

---

### Phase 0: Research and technical choices

**Purpose**: Lock in exact libraries and versions so the executor does not guess. Every "TBD" or "e.g." in the plan is resolved in research.md.

**Goals**:

- [ ] research.md exists and lists exact crate/package names and versions (or version ranges) for: markdown parsing, search/fuzzy, logging, frontend build.
- [ ] research.md includes a "Wrong sources" section (or references execution-principles.md).
- [ ] No step in later phases says "use a markdown library" without naming the library and version from research.md.

**Implementation**:

1. Open `research.md` in this folder.
2. For each section (markdown, search, logging, frontend, session), confirm that the **exact** crate or package name is written (e.g. `pulldown-cmark` 0.9, `tracing` 0.1, `fuzzy-matcher` or alternative from research).
3. If any line says "TBD" or "or similar," replace it with one concrete choice and add one sentence rationale. Save research.md.
4. Add at the top of research.md a line: "When looking up libraries, use only the official docs for these exact crate/package names and versions. Do not use Tauri v1 docs or random tutorials. See execution-principles.md."

**Validation**:

- Search research.md for "TBD" and "or similar"; there must be zero results.
- For each library named (pulldown-cmark, tracing, fuzzy-matcher, etc.), open docs.rs (Rust) or the official package page and confirm the version exists. If the version in research.md does not exist, update research.md to a valid version and re-run this validation.

---

### Phase 1: Scaffold Tauri project

**Purpose**: Create a runnable desktop app skeleton (Rust backend + TypeScript frontend) so that later phases only add code, not project structure.

**Goals**:

- [ ] From repo root, `npm run tauri dev` (or equivalent) starts a window.
- [ ] The project has exactly one backend (`src-tauri/`) and one frontend (`src/` or path given by Tauri template).
- [ ] Spec and plan paths (specs/001-developer-ledger/) are unchanged; no code in the spec folder.

**Implementation**:

1. From repository root, ensure Rust is installed: `rustup update stable` and `cargo --version`.
2. Ensure Node.js LTS is installed: `node --version` (v18 or higher).
3. Follow **only** the official Tauri v2 "Create a new project" steps: https://v2.tauri.app/start/create-project/ . Use the template that gives Rust + TypeScript (Vite). If the repo already has `src-tauri/` and a frontend folder, skip creation and go to step 4.
4. Install dependencies: from repo root run `npm install` (or the command from the Tauri template).
5. Run the app: `npm run tauri dev`. A desktop window must open. Close the window after confirming.
6. Run Rust tests: `cargo test` (from repo root or src-tauri). Tests may be empty; the command must succeed.

**Validation**:

- From repo root: `npm run tauri dev` → window opens. (Manual check.)
- From repo root: `cargo test` → exits with code 0.
- Directory `src-tauri/src/` exists. Directory for frontend (e.g. `src/`) exists. No files under `specs/001-developer-ledger/` were modified except as allowed by other phases.

---

### Phase 2: Vault open and file list

**Purpose**: Implement "open a folder (vault) and list markdown files." Satisfies FR-002 (tree-like view of files) and the vault concept from the spec.

**Goals**:

- [ ] User can trigger "open vault" (e.g. menu or button); a folder picker opens; after selecting a folder, the app knows the vault root path and the list of `.md` file paths under it.
- [ ] A Tauri command `open_vault(path: string)` exists and returns `{ root_path, file_paths }` or an error. Contract: see contracts/tauri-commands.md.
- [ ] Session can persist and load `last_vault_path` (research.md and FR-011). Optional in this phase: show last vault on startup; if implemented, it must load from the same config file described in research.md.

**Implementation**:

1. In Rust (src-tauri): Implement `open_vault(path: String)` that (a) checks path is a directory, (b) recursively or iteratively finds all files with extension `.md` under path, (c) returns root_path and list of relative or absolute paths. Use only standard library or a crate already in Cargo.toml; if you need a crate, add the one from research.md (e.g. no extra crate for list_dir). Register the command in Tauri so the frontend can invoke it.
2. In the frontend: Add a way for the user to choose a folder (e.g. use Tauri's dialog or the command that returns a path). Call `open_vault` with that path. Store `root_path` and `file_paths` in frontend state (or context).
3. (Optional) Implement session load/save: config file path per research.md (e.g. app data dir + `config.json`). `get_session` returns last_vault_path; `save_session` writes it. Call `get_session` on app start; if last_vault_path exists and the folder exists, call `open_vault(last_vault_path)` and show the file list; otherwise show empty screen or folder picker.
4. Write one integration test in Rust: given a temp dir with two `.md` files, `open_vault(temp_dir)` returns root_path and two paths. Run `cargo test` and ensure it passes.

**Validation**:

- **Contract**: Open contracts/tauri-commands.md. Confirm `open_vault` is implemented with the exact args and return shape (path string → `{ root_path, file_paths[] }` or error). No extra required args.
- **Spec**: FR-002 says the system must display a tree-like view of files. After this phase, the app must show the list of file paths (even as a simple list). Manual test: open vault → select folder with at least one .md file → list of files appears.
- **Test**: `cargo test` includes a test that opens a vault (temp dir with .md files) and asserts on the returned paths. Test passes.

---

### Phase 3: File CRUD (create, read, write, delete)

**Purpose**: Implement create, open, read, edit, save, and delete for markdown files inside the vault. Satisfies FR-001, FR-007.

**Goals**:

- [ ] Commands exist: `list_files`, `read_file`, `write_file`, `create_file`, `delete_file` with signatures and behavior as in contracts/tauri-commands.md.
- [ ] User can create a new file, open it (see content in editor), edit content, save (content persisted to disk), and delete a file (with confirmation). File tree updates after create/delete.
- [ ] All paths are under the current vault root; no writes outside the vault.

**Implementation**:

1. Implement in Rust: `list_files()` (return paths for current vault), `read_file(path)`, `write_file(path, content)`, `create_file(path)` (empty file), `delete_file(path)`. Paths must be validated to be under vault root. Register all as Tauri commands.
2. In the frontend: (a) When user selects a file from the tree, call `read_file(path)` and show content in the editor. (b) When user saves, call `write_file(path, content)` with current editor content. (c) When user creates a new file, ask for name, call `create_file`, refresh file list. (d) When user deletes, confirm then call `delete_file`, refresh file list.
3. Add integration tests: create_file then read_file returns empty string; write_file then read_file returns written content; delete_file then read_file fails. Run `cargo test`.

**Validation**:

- **Contract**: contracts/tauri-commands.md File CRUD table: every command listed there is implemented and matches arg/return types.
- **Spec**: FR-001 (create, open, read, edit, save, delete); FR-007 (persist in markdown/plain text). Manual: create file → type text → save → close → reopen → same text. Delete file → file gone from tree and from disk.
- **Tests**: `cargo test` passes including the new file CRUD tests.

---

### Phase 4: List hierarchy and tags (parse and display)

**Purpose**: Parse markdown content into a list of list items (tree) with depth, text, and tags. Display or expose this so the UI can show hierarchy and tags. Satisfies FR-003, FR-004.

**Goals**:

- [ ] A command or function `parse_file(path, content)` returns a list of tree nodes (id, depth, text, tags, parent_id, children_ids) as in data-model.md and contracts.
- [ ] Parser uses the exact crate from research.md (e.g. pulldown-cmark). Tags are extracted from list item text by the rule in data-model.md (e.g. `#[\w-]+`).
- [ ] Frontend can display or use this tree (e.g. outline view or inline in editor). List structure is preserved on save (content is still markdown with the same list syntax).

**Implementation**:

1. Add the markdown parsing crate from research.md to Cargo.toml (exact version). Implement a module that takes a string (file content) and returns a vec of tree nodes. Each node: id (e.g. line index or generated), depth (from indentation), text (full line without the bullet), tags (extract #word), parent_id and children_ids derived from depth. Document the list syntax (e.g. `-` or `*`, 2 or 4 spaces per level) in a comment.
2. Expose this via Tauri command `parse_file(path, content)` returning `{ nodes: TreeNode[] }` as in contracts.
3. Frontend: when a file is open, call `parse_file` with current content. Use the result to render an outline or to show tags. On save, write back the raw editor content (do not regenerate markdown from nodes so that non-list content is preserved).
4. Unit test: given a string with 2 root items and 1 child under the first, parser returns 3 nodes with correct depth and parent_id/children_ids. Unit test: a line with `#decision` and `#ci` yields tags `["decision","ci"]`. Run `cargo test`.

**Validation**:

- **Data model**: data-model.md "Tree node (list item)" — attributes id, depth, text, tags, parent_id, children_ids are all present in the parsed output. Tags are strings without the `#`.
- **Spec**: FR-003 (interpret list structure as hierarchy), FR-004 (tags associated with list item, stored with content). Manual: open file with nested list and tags → outline or structure reflects nesting; tags appear somewhere (e.g. in query later).
- **Tests**: Parser tests pass; `cargo test` passes.

---

### Phase 5: Query by tag and scope

**Purpose**: User can run a query "show all list items with tag X (optionally under node Y)." Results show file path, parent path, and node; user can navigate to item. Satisfies FR-005, FR-006.

**Goals**:

- [ ] Command `query_by_tag(tag_names, scope_node_id?, paths?)` exists and returns `QueryResultItem[]` as in contracts. Search is across all files in vault (or paths if provided).
- [ ] Frontend: user can enter a tag (e.g. `decision`); results list shows matching items with context; clicking an item opens the file and scrolls or focuses that item (or documents that "navigate" is a follow-up).
- [ ] Scope filter: if scope is given, only items under that node are returned.

**Implementation**:

1. In Rust: For each file in vault (or in paths), get content (read from disk or accept content from frontend), parse to nodes, collect nodes whose `tags` contain any of `tag_names`. If scope_node_id is set, filter to nodes that are descendants of that node. Build QueryResultItem (file_path, parent_path, node). Return list. Implement as `query_by_tag` Tauri command.
2. Frontend: Add a query UI (input for tag, optional scope). On submit, call `query_by_tag`. Display results; on item click, call `read_file` for that file_path and set editor content; optionally pass node id to scroll (if implemented).
3. Integration test: create two files with list items and tags; call `query_by_tag(["decision"])`; assert results include both items. Add test for scope filter. Run `cargo test`.

**Validation**:

- **Contract**: contracts/tauri-commands.md parsing and query table — `query_by_tag` args and return type match.
- **Spec**: FR-005 (query by tag and scope), FR-006 (view with context and navigate). Manual: add items with `#decision` in two files → query "decision" → both appear; click one → file opens.
- **Tests**: Query tests pass.

---

### Phase 6: Full-text and fuzzy search

**Purpose**: User can search for text across all files; results are navigable. Fuzzy matching optional. Satisfies FR-008.

**Goals**:

- [ ] Command `search_full_text(query, paths?, fuzzy?)` returns `SearchMatch[]` (file_path, snippet or line, offset if applicable) as in contracts.
- [ ] Search runs over vault files (or paths). If fuzzy is true, use the crate from research.md for fuzzy matching.
- [ ] Frontend: search input; on submit call command; show results; click result to open file at that location (or at top of file if offset not implemented).

**Implementation**:

1. In Rust: Implement search by scanning file contents (or use the approach in research.md). For each file, find matches (substring or fuzzy); build SearchMatch. Limit results (e.g. first 100) to keep UI responsive. Add `search_full_text` Tauri command.
2. Frontend: Search bar or panel; call `search_full_text`; display file_path and snippet; on click open file (and optionally set cursor/scroll to offset).
3. Test: create file with known text; call `search_full_text("known")`; assert at least one match with that file_path. Run `cargo test`.

**Validation**:

- **Contract**: `search_full_text` in contracts matches implementation.
- **Spec**: FR-008 (full-text search across workspace, navigable). Manual: search for a word that exists in one file → result shown → click → file opens.
- **Tests**: Search test passes.

---

### Phase 7: Undo/redo, session, theme, logging

**Purpose**: Implement remaining spec requirements: undo/redo in editor (FR-009), session restore (FR-011), light/dark theme (FR-012), and local logging (FR-010). Copy-paste (FR-013) is standard editor behavior; ensure it is not disabled.

**Goals**:

- [ ] Undo/redo: user can undo and redo edits in the current file; history is per file; on save, state is written to disk (no undo across save required by spec).
- [ ] Session: on launch, if last_vault_path and last_file_path exist and are valid, open that vault and that file; otherwise empty screen or vault picker (FR-011).
- [ ] Theme: user can select light or dark (or follow system); preference persisted in session config (FR-012).
- [ ] Logging: Rust uses tracing; logs go to local file (and optionally stdout) in the path from research.md; frontend errors can be sent via `log_from_frontend` (FR-010).
- [ ] Copy-paste: editor allows paste from clipboard and copy to clipboard (FR-013).

**Implementation**:

1. Undo/redo: In frontend, maintain a history stack (e.g. array of document states or diffs) for the current file. On each edit, push state before applying edit. Undo: pop and restore previous state. Redo: re-apply. Clear or truncate history on file close if desired. Do not send every keystroke to Rust; only on save call `write_file`.
2. Session: Already partially done in Phase 2. Ensure `get_session` / `save_session` include last_file_path and theme. On startup, load session; if last_vault_path and last_file_path are set and paths exist, open vault and open that file.
3. Theme: Add UI to choose light/dark/system. Store in session config. Apply CSS or class to root element. Load theme from session on startup.
4. Logging: In Rust, use `tracing`; configure subscriber to write to file in app data dir (see research.md). Add `log_from_frontend(level, message, payload?)` command; in handler, emit a tracing event. Ensure no logs are sent over the network.
5. Editor: Ensure the editor component does not disable paste or copy (no preventDefault on paste/copy unless required for security). If using a library, check its docs for clipboard.

**Validation**:

- **Spec**: FR-009 (undo/redo), FR-011 (last opened file or empty), FR-012 (light/dark), FR-010 (logs local), FR-013 (copy-paste). Manual: edit → undo → content reverts; close app → reopen → same vault and file open; switch theme → restart → theme persists; trigger an error or log → check log file exists under app data; copy from app and paste into notepad → same text.
- **Tests**: Any new tests for session or logging run and pass.

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| (none)    | —          | —                                    |

If any constitution or spec exception is made during implementation, add a row here and document the rationale.
