# ADR-0003: Frontend–Backend Boundary via Tauri Commands and Contract

## Status

Accepted

## Context

The frontend (TypeScript/Vite) and the backend (Rust/Tauri) need a clear, versioned API so that changes to one side do not accidentally break the other. The specification requires file CRUD, vault operations, markdown parsing, queries, search, session management, and logging—all of which span the frontend-backend boundary. A formal contract prevents duplicate logic and keeps the frontend thin.

## Decision

All frontend-backend communication goes through **Tauri's invoke system**. The frontend calls commands by name with arguments as JSON; the backend processes the request and returns a result (or error). The contract for all commands is defined in a single source of truth: `specs/001-developer-ledger/contracts/tauri-commands.md`. This document lists every command, its arguments (with types), its return shape, and one sentence of purpose.

Implemented commands (registered in `src-tauri/src/lib.rs`):

| Command | Purpose |
|---------|---------|
| `open_vault` | Open a vault (folder) and return root path and file list |
| `get_session`, `save_session` | Persist and load session data (last vault, last file, theme) |
| `list_files`, `read_file`, `write_file`, `create_file`, `delete_file` | File CRUD under vault root |
| `parse_file` | Parse markdown content into a tree of list items with tags |
| `query_by_tag` | Find all list items with given tags, optionally scoped to a node |
| `search_full_text` | Full-text search across vault files |
| `log_from_frontend` | Frontend sends a log message to the backend for unified logging |

Commands that need the vault receive `State<'_, Mutex<VaultState>>`; session commands receive `AppHandle` for path resolution. Command handlers are async (via `#[tauri::command]`).

## Consequences

- **Clear API boundary:** The contract doc is the source of truth. Frontend developers know what commands exist and what shapes to expect. Backend developers implement to the contract, not to guesses.
- **Thin frontend:** The frontend has no markdown parsing, no vault logic, no session file logic—all of that lives in the backend. The frontend is pure UI: render state, invoke commands, handle responses.
- **Versioning:** The contract can be versioned if commands change. New commands can be added without breaking old ones.
- **Testability:** Commands can be tested directly without the UI. Integration tests can invoke commands and assert on return shapes, validating the contract.
- **Coupling:** The API is synchronous (invoke waits for the backend response). Long-running operations (e.g., searching a huge vault) will block the UI until the backend responds. For MVP, this is acceptable; future optimization could use async patterns or workers.

## References

- `specs/001-developer-ledger/contracts/tauri-commands.md` (API contract, shapes, validation)
- `src-tauri/src/lib.rs` (command registration)
- `src-tauri/src/commands/` (all command modules: vault, file, parse, query, search, session, log)
- `src/main.ts` (frontend invoke calls)
