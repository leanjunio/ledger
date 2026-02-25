# ADR-0007: Session Persistence in App Data Directory with Config.json

## Status

Accepted

## Context

When the user closes the app, they should be able to reopen it and resume where they left off: the same vault and the same file should open. Additionally, the user may prefer a light or dark theme, and that preference should persist across restarts. Session data must be stored on the user's machine only (no cloud) and must not be part of the vault itself (session is app state, not user data).

## Decision

Session data is persisted in a single JSON file located in the Tauri app data directory. The path is resolved via `app.path().app_data_dir()` (provided by Tauri's path resolver), and the file name is `config.json`. On macOS, this typically resolves to `~/Library/Application Support/ledger/config.json`; on Linux, `~/.config/ledger/config.json`; on Windows, `%APPDATA%/ledger/config.json`.

The file format is:

```json
{
  "last_vault_path": "/path/to/vault",
  "last_file_path": "notes/project.md",
  "theme": "light"
}
```

All three fields are optional (may be `null` or omitted). When the frontend calls `save_session`, it passes only the fields it wants to update. The backend loads the existing file (if it exists), merges in the provided fields, and writes the result. This approach avoids wiping other session fields when only one field changes.

On app startup, the frontend calls `get_session`. The backend reads the file (or returns an empty `SessionData` if the file does not exist). The frontend then loads the vault and file if they exist and are valid; otherwise, it shows the vault picker or an empty screen.

## Consequences

- **Session survives restarts:** The user's last vault and file are restored automatically. This matches Obsidian and other contemporary editors.
- **Per-machine session:** Session is stored in the app data directory, which is per machine. If the user opens the app on a different computer, they start fresh. This is acceptable for a personal tool.
- **Merge semantics:** By merging on save, the frontend can update one field without clobbering others. If theme is saved, last_vault_path is preserved.
- **Theme not wired in frontend:** The backend supports theme in the contract; the session command reads and writes it. However, the frontend (in `src/main.ts`) does not currently call `save_session` with theme or apply the loaded theme to the UI. This is incomplete and should be addressed in a future update.
- **Directory creation:** The app data directory is created if it does not exist. If the user's home directory is not writable, session persistence will fail, and the app will start without session data. This is acceptable for MVP.
- **No encryption:** Session data is stored in plain JSON. The last vault path and theme are not sensitive, but if the user wants to protect them, they should encrypt the app data directory (OS-level).

## References

- `src-tauri/src/commands/session.rs` (get_session, save_session, SessionData struct)
- `src/main.ts` (loadSession on DOMContentLoaded, save_session calls)
- Tauri v2 docs: https://v2.tauri.app/plugin/path/ (path resolver)
- `specs/001-developer-ledger/research.md` (session file format and location)
