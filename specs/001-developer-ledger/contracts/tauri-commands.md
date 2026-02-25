# Contract: Tauri commands (frontend ↔ backend)

**Branch**: `001-developer-ledger` | **Date**: 2025-02-24  
**Executor**: Read [execution-principles.md](../execution-principles.md) first. This file is the **only** source of truth for the names, arguments, and return shapes of the commands the frontend can call on the Rust backend. Implement exactly these; do not add or remove required parameters without updating this file and the plan.

---

## Purpose

The frontend (TypeScript) and the backend (Rust) communicate by **commands**. The frontend invokes a command by name with arguments; the backend runs the corresponding Rust function and returns a value (or an error). This document defines every command: name, arguments (with types), return value (or error), and in one sentence what it does. The executor must implement each command so that the frontend can depend on this contract.

---

## Goals

- [ ] Every command listed below exists in the Rust code and is registered with Tauri.
- [ ] Argument names and types match (e.g. if the contract says `path: string`, the Rust function accepts a string path; Tauri serializes/deserializes JSON).
- [ ] Return shapes match (e.g. `open_vault` returns an object with `root_path` and `file_paths`, not a different structure).
- [ ] Validation section at the end tells the executor how to verify each command (test or manual step).

---

## Conventions

- **Command name**: Exactly as written here, in `snake_case`. The frontend will call e.g. `invoke('open_vault', { path: '/some/dir' })`.
- **Arguments**: Passed as one object in JSON. Names are case-sensitive. Optional arguments can be omitted.
- **Return**: JSON-serializable. If the backend returns a Rust `Result`, Tauri sends either the Ok value or an error to the frontend. The frontend must handle errors.
- **Async**: Commands that do file I/O or heavy work should be `async` in Rust so the UI does not freeze.

---

## Vault and session

| Command       | Args (all required unless marked ?) | Returns | Description |
|---------------|--------------------------------------|---------|-------------|
| `open_vault`  | `path: string` (folder path)         | `{ root_path: string, file_paths: string[] }` or error | Open the vault at `path`. Return the root path and the list of .md file paths under it. |
| `get_session` | (none)                               | `{ last_vault_path?: string, last_file_path?: string, theme?: string }` | Read the session config file and return saved values. |
| `save_session`| `last_vault_path?: string`, `last_file_path?: string`, `theme?: string` (one object) | `null` or error | Write the given values to the session config file. |

**Validation**: (1) From frontend, call `open_vault` with a path to a folder that contains at least one .md file. Assert the return has `root_path` and `file_paths` and `file_paths.length >= 1`. (2) Call `save_session` with theme "dark"; call `get_session`; assert theme is "dark".

---

## File CRUD

| Command       | Args | Returns | Description |
|---------------|------|---------|-------------|
| `list_files`  | (none) | `string[]` (array of paths) | List all .md file paths in the current vault. Vault must already be open (state in backend or passed implicitly). |
| `read_file`   | `path: string` | `string` (file content) or error | Read the file at `path`. Path must be under vault root. |
| `write_file`  | `path: string`, `content: string` | `null` or error | Write `content` to `path`. Create or overwrite. Path must be under vault root. |
| `create_file` | `path: string` | `null` or error | Create an empty file at `path`. Path must be under vault root. |
| `delete_file` | `path: string` | `null` or error | Delete the file at `path`. Path must be under vault root. |

**Validation**: (1) create_file("test.md"); read_file("test.md") must return "" or empty string. (2) write_file("test.md", "hello"); read_file("test.md") must return "hello". (3) delete_file("test.md"); read_file("test.md") must return an error. Write these as integration tests and run `cargo test`.

---

## Parsing and query

| Command          | Args | Returns | Description |
|------------------|------|---------|-------------|
| `parse_file`     | `path: string`, `content: string` | `{ nodes: TreeNode[] }` | Parse `content` as markdown and return the list of tree nodes (list items with id, depth, text, tags, parent_id, children_ids). See Types below. |
| `query_by_tag`   | `tag_names: string[]`, `scope_node_id?: string`, `paths?: string[]` | `QueryResultItem[]` or error | Find all list items in the vault (or in `paths` if provided) that have at least one of the given tags. If `scope_node_id` is set, only return items that are descendants of that node. Each result is a QueryResultItem. |
| `search_full_text` | `query: string`, `paths?: string[]`, `fuzzy?: boolean` | `SearchMatch[]` | Search for `query` in file contents (in vault or in `paths`). If `fuzzy` is true, use fuzzy matching. Return list of SearchMatch. |

**Validation**: (1) parse_file("", "- a\n  - b") must return nodes with depth 0 and 1, and the second node’s parent_id must equal the first node’s id. (2) Create two files with one list item each containing #decision; query_by_tag(["decision"]) must return two QueryResultItem. (3) write_file("x.md", "hello world"); search_full_text("hello") must return at least one match with file_path containing "x.md" and snippet containing "hello".

---

## Logging

| Command            | Args | Returns | Description |
|--------------------|------|---------|-------------|
| `log_from_frontend`| `level: string`, `message: string`, `payload?: object` | `null` | The frontend sends a log or error to the backend. The backend writes it to the same log file (tracing) so all logs are in one place. |

**Validation**: Call log_from_frontend("error", "test message"); open the app log file (see research.md for path); assert the file contains "test message" or the payload.

---

## Types (exact shape for frontend)

The backend must return JSON that matches these shapes. Field names are case-sensitive.

**TreeNode** (one list item from the parser):

```json
{
  "id": "<string or number>",
  "depth": 0,
  "text": "Item text #decision",
  "tags": ["decision"],
  "parent_id": null,
  "children_ids": []
}
```

- `id`: Unique within one parse. String or number.
- `depth`: Integer, 0 = root.
- `text`: Full line text including tags.
- `tags`: Array of tag names without `#`.
- `parent_id`: null for root, else parent’s id.
- `children_ids`: Array of child ids.

**QueryResultItem** (one row in query results):

```json
{
  "file_path": "notes/project.md",
  "parent_path": "Project A > Task 1",
  "node": { "<TreeNode>" }
}
```

- `parent_path` can be null if not implemented.

**SearchMatch** (one search hit):

```json
{
  "file_path": "notes/project.md",
  "snippet_or_line": "the line containing the match",
  "start_offset": 0,
  "end_offset": 5
}
```

- `start_offset` and `end_offset` are optional (e.g. character offsets in the file or line).

---

## Validation summary (executor checklist)

- [ ] Every command in the tables above is implemented in Rust and registered in the Tauri app (e.g. in the command list passed to `tauri::generate_handler!` or equivalent).
- [ ] open_vault: test with a temp dir; assert root_path and file_paths.
- [ ] get_session / save_session: test round-trip for theme or last_vault_path.
- [ ] list_files, read_file, write_file, create_file, delete_file: tests as in File CRUD validation.
- [ ] parse_file: test with known markdown; assert nodes shape and parent/child.
- [ ] query_by_tag: test with two files with #decision; assert two results.
- [ ] search_full_text: test with known content; assert match returned.
- [ ] log_from_frontend: manual or test that log file contains the message.

If any check fails, the implementation does not meet the contract; fix before proceeding.
