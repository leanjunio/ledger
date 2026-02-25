# ADR-0004: Data Model and Persistence: Files on Disk, List Items and Tags Derived, Session in App Data

## Status

Accepted

## Context

The specification requires that all user data be stored as plain markdown files (not opaque binary or database). List items and tags are derived from the markdown text, not stored separately. The app must also persist session state (last opened vault and file, theme preference) so the user can resume where they left off.

## Decision

**Files:** All markdown files live under the vault directory as normal `.md` files on the user's filesystem. The backend reads and writes files using Rust's `std::fs`. The file content is raw UTF-8 text; the app makes no assumptions about the file format beyond that it is plain text. Non-list markdown content (headings, code blocks, etc.) is left untouched; the parser extracts only list structure.

**List items and tags:** These are not persisted as separate entities. When the app needs to know about list items or tags, it parses the file content in memory:

- The `parse_file` command reads markdown content and returns a `Vec<TreeNode>` (computed on demand).
- The `query_by_tag` command reads each file in the vault, parses it, and filters nodes by tag (computed on demand).

There is no separate "tag index" or database table. This keeps the vault simple and portable; a user can open their vault in another markdown editor and see plain list syntax.

**Session:** Session data is stored in a single JSON file in the Tauri app data directory. The file name is `config.json`; the structure is:

```json
{
  "last_vault_path": "/path/to/vault",
  "last_file_path": "notes/project.md",
  "theme": "dark"
}
```

When the user saves session (e.g., after opening a vault or after closing the editor), the backend merges the provided fields into the existing file. This allows the frontend to update only the fields it changed without wiping other session data. If the session file does not exist, it is created on first save. On app startup, the frontend calls `get_session` to load the persisted state.

## Consequences

- **Portability:** The vault is a plain folder with `.md` files. Users can version control it, back it up, or open it in other editors. No lock-in or proprietary format.
- **No migrations:** Because there is no schema, there are no schema migrations when the app evolves. If list item structure changes, old files still parse (they just may not have new fields).
- **Parse-on-demand:** Every query and every parse operation reads files from disk and parses them. For large vaults, this can be slow (no caching or index). This is acceptable for MVP; a future version could add an in-memory cache or persistent index.
- **Session per machine:** Session data is per app instance, not per vault. If the user opens the app on a different machine, the session will not carry over. The session file is in the app data directory, which is OS-specific; on macOS it is `~/Library/Application Support/...`, on Linux it is `~/.config/...`.
- **Theme persistence incomplete:** The backend supports theme in the session contract (`SessionData { theme }`), and `save_session` writes it; however, the frontend does not currently read or write theme to session (see `src/main.ts`). This is a gap to close in a future update.

## References

- `src-tauri/src/commands/file.rs` (read, write, create, delete)
- `src-tauri/src/commands/session.rs` (session load/save)
- `src-tauri/src/markdown/mod.rs` (parse on demand)
- `specs/001-developer-ledger/data-model.md` (entity definitions and persistence summary)
