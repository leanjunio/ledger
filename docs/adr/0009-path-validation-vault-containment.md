# ADR-0009: Path Validation and Vault Containment

## Status

Accepted

## Context

File operations (read, write, create, delete) must be restricted to the active vault. An attacker or bug must not allow the app to read or write arbitrary paths on the user's filesystem. The backend must validate that all file operations stay under the vault root directory.

## Decision

The backend enforces path containment in `src-tauri/src/commands/file.rs` using multiple layers:

1. **No path traversal:** Any path containing `".."` is immediately rejected with an error.

2. **Canonicalization:** For all file operations (read, write, create, delete), the backend:
   - Gets the vault root path from `VaultState` (which is set when the vault is opened).
   - Joins the requested path with the vault root.
   - Canonicalizes the full path (resolves symlinks, removes `.` and `..`, makes it absolute).
   - Checks that the canonicalized path starts with the canonicalized vault root.
   - If the path is outside the vault, returns an error.

3. **Vault root function:** The `vault_root()` helper extracts the root path from state and returns an error if no vault is open. All file commands use this.

4. **Open vault validation:** When the user calls `open_vault(path)`, the backend validates that the provided path is an existing directory and is readable.

5. **Relative paths:** File paths are stored as relative to the vault root where possible (in the in-memory `file_paths` list). When the path is used for an operation, it is joined with the vault root and canonicalized.

## Consequences

- **Security:** The app cannot read or write files outside the vault, even if the user provides a malicious path. This protects the system from accidental or malicious file operations.
- **Trust boundary:** The filesystem is considered the source of truth. The vault is whatever directory the user selected; all operations stay under that tree.
- **Performance:** Canonicalization is a system call for each operation. For typical file operations (one per user action), this is negligible. For batch operations (hypothetical future feature), canonicalization could be cached per vault open.
- **Symlinks:** If the vault or a subdirectory contains a symlink pointing outside the vault, canonicalization will follow the symlink and reject the path (if the resolved target is outside the vault root). This is the secure default. Users who want to include external paths must request that feature explicitly.
- **No cross-vault access:** Even if two vaults are adjacent on the filesystem, the app cannot access one from inside the other (unless the user opens a new vault).

## References

- `src-tauri/src/commands/file.rs` (vault_root, resolve_under_vault, path validation in all file operations)
- `src-tauri/src/commands/vault.rs` (open_vault validation)
- Rust std::path::Path docs: https://doc.rust-lang.org/std/path/struct.Path.html (canonicalize method)
