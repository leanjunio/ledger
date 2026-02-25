# ADR-0002: Vault and In-Memory Backend State

## Status

Accepted

## Context

The application manages a single vault (folder) at a time. The app must know the vault root directory and the list of markdown files under it to support file listing, CRUD operations, tag queries, and full-text search. The specification defines a vault as a single folder; all user data lives under that folder. The backend needs to keep track of this state across commands so that file operations know where to write or read.

## Decision

The backend holds one **active vault** in memory using a `VaultState` struct located in `src-tauri/src/commands/vault.rs`. The struct contains:

```rust
#[derive(Default)]
pub struct VaultState {
    pub root_path: Option<String>,
    pub file_paths: Vec<String>,
}
```

The `VaultState` is wrapped in a `Mutex` and managed by Tauri's state injection system. Any command that needs vault access receives the state via `State<'_, Mutex<VaultState>>`. When the user opens a vault with `open_vault(path)`, the backend:

1. Validates the path is an existing directory.
2. Canonicalizes the path to prevent escapes.
3. Recursively collects all `.md` file paths under the vault root using `collect_md_paths`.
4. Updates the in-memory `VaultState` with the root path and file list.
5. Returns the result to the frontend.

When the user creates or deletes a file, the backend updates `file_paths` in the state. No database is used; the file list is computed from the filesystem on vault open and kept in memory.

## Consequences

- **Speed:** File listing is fast (no disk round-trip). In-memory state allows quick checks in commands.
- **Staleness:** If the user adds or removes `.md` files outside the app (e.g., via the filesystem), the in-memory list is stale until the vault is reopened. This is acceptable for a personal tool where the user is the only actor.
- **Simplicity:** No database schema, no migrations, no external service. The application code is portable and can run anywhere Rust and Tauri dependencies are available.
- **Limitations:** Only one vault is open at a time. Switching vaults requires calling `open_vault` again. Multiple instances of the app do not share state; each instance has its own in-memory vault.
- **Thread safety:** The `Mutex` ensures thread-safe access to the state. Commands access the state serially via Tauri's event loop.

## References

- `src-tauri/src/commands/vault.rs` (`VaultState`, `open_vault`, `collect_md_paths`)
- `src-tauri/src/lib.rs` (state injection and command registration)
- `specs/001-developer-ledger/plan.md` (Phase 2: Vault open and file list)
