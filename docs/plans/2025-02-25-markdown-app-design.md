# Lightweight markdown app — design

**Date:** 2025-02-25  
**Status:** Approved

## Summary

A lightweight desktop markdown application with CRUD for markdown files. Local-only: the app reads and writes files in a folder the user chooses. Desktop shell is Tauri 2; frontend is Svelte. In-app editing with list view and editor + live preview. Nested folders supported via a sidebar tree. All user stories and flows are covered by E2E tests.

---

## 1. Architecture and tech stack

- **Shell:** Tauri 2. Single window; no tray or background process. App exits when the window closes.
- **Backend:** Rust. Tauri commands perform all file system access: read directory tree, read/write/delete `.md` files, resolve paths. The frontend never touches the filesystem directly.
- **Frontend:** Svelte. Single-page UI; no router. State is local component state plus a small store for "current folder root" and "current file path" so the sidebar and editor stay in sync.
- **Folder choice:** On first launch (or when "Open folder" is used), the app shows a native folder picker. The chosen path is stored in Tauri app data so the same folder opens next time unless the user picks another.
- **Scope:** Only `.md` files are listed and editable. Other files in the folder are ignored. No sync, no accounts, no plugins — local CRUD and editing only.

---

## 2. Core components and screens

- **Layout:** Single window. Left: sidebar (folder tree). Center/right: main area — either a file list for the selected folder, or an editor + preview when a file is open. No separate screens; one layout with conditional content.
- **Sidebar:** Tree of the chosen root folder and its subfolders (directories only). Clicking a folder selects it and shows its `.md` files in the main area. Expand/collapse per folder. Navigation only; no editing in the tree.
- **Main area — list view:** When a folder is selected and no file is open: list (or simple grid) of `.md` files in that folder. Each row: filename, optional last modified. Actions: New file, Open (click row), Delete (with confirmation). Subfolders are not listed here; user switches folder in the sidebar.
- **Main area — editor view:** When a file is open: left = text area (raw markdown), right = live preview (rendered HTML). Resizable split or fixed ratio. Toolbar: Save, Delete, Back (close editor, return to list). Explicit Save for now; auto-save can be added later.
- **Top bar:** "Open folder" (re-run folder picker, reload tree), and optionally the current root path. No menus unless added later.

---

## 3. Data flow

- **Root path:** On load, frontend calls a Tauri command (e.g. `get_saved_root`) to read the last-used folder from app config. If none, UI shows "Open folder" only. When the user picks a folder, frontend invokes a command that stores the path and returns it; frontend then requests the tree for that path.
- **Tree:** Frontend calls something like `list_directory_tree(root_path)`. Rust returns a structure of folder names and paths. Frontend keeps this in a Svelte store and drives the sidebar.
- **File list:** When the user selects a folder in the tree, frontend calls `list_markdown_files(folder_path)`. Rust returns `.md` filenames (and optionally metadata). Frontend stores this and renders the list. Clicking a file sets "current file path" and triggers a read.
- **Read file:** Frontend calls `read_file(path)`. Rust returns file contents as a string. Frontend puts it in the editor state and shows editor + preview.
- **Write file:** On Save, frontend calls `write_file(path, content)`. Rust overwrites the file. On success, frontend clears "dirty" state; on error, show a message and keep editor content.
- **Create file:** "New file" calls `create_file(parent_folder_path, filename)` or equivalent. Rust creates the file. Frontend adds it to the file list and can open it.
- **Delete file/folder:** `delete_file(path)` or `delete_folder(path)`. Rust removes it. Frontend removes it from tree/list and, if the deleted file was open, closes the editor and returns to list.

All paths are full paths from the frontend; Rust validates they lie under the chosen root and only touches `.md` for file ops. No polling; frontend refreshes list/tree after create/delete or after "Open folder."

---

## 4. Error handling

- **Path safety:** Rust treats the user-chosen root as the only allowed base. For every command that takes a path, resolve it against the root and reject if it escapes or isn’t under the root. Return a clear error so the frontend can show a message.
- **Missing or moved files:** If the saved root no longer exists, return an error; frontend shows a message and "Open folder." If an open file was deleted or moved, show "File not found" or "File was moved," keep content in the editor, and offer "Save as" or close.
- **Permissions:** If the OS denies read/write, Rust returns an error; frontend shows it and does not clear editor or list state.
- **Create/delete conflicts:** On create failure (e.g. name exists, invalid characters), return an error and show it. On delete failure, show the error and leave the file in the list.
- **No generic crash:** Rust commands return `Result`; frontend handles errors and shows user-facing messages; never assume success without checking the response.

---

## 5. Testing

- **E2E (required):** Every user story and main flow is covered by an end-to-end test. Tests run against the real Tauri app (or a test build) with a temp directory as the chosen folder. Flows: open folder and see tree; select folder and see file list; create new file and see it in the list; open file and see editor + preview; edit content and save; delete file and see it removed; delete or create folder and see tree update; open folder when none saved; handle invalid or missing root. Use Tauri’s E2E harness or Playwright so tests drive the running app and assert on UI and file system outcomes.
- **Rust:** Unit tests for path resolution and for `list_directory_tree` / `list_markdown_files` with temp dirs and fixture files.
- **Frontend (Svelte):** Component tests with mocked Tauri `invoke` for sidebar, file list, and editor.
- **Relationship:** User stories and acceptance criteria are the source of truth; each story has at least one E2E test. New flows get a corresponding E2E test before or with implementation.

---

## Design summary

| Area | Choice |
|------|--------|
| App type | Desktop (Tauri 2), one window |
| Frontend | Svelte, single-page, minimal deps |
| Storage | Local folder only; user picks path, stored in app config |
| Structure | Nested folders (tree in sidebar); CRUD in current folder |
| Editing | In-app: list + text area + live markdown preview |
| Lightweight | Fast startup, small install, simple UI, no accounts/sync |
| Data flow | All file I/O via Tauri commands (Rust); path validation under root |
| Errors | Path safety in Rust; missing/perms/conflicts surfaced in UI |
| Testing | All user stories and flows covered by E2E tests; Rust unit tests; Svelte component tests with mocked invoke |
