# Plan: Session restore (FR-011)

## Purpose

Satisfies FR-011.

## Goals

- On launch, show the user's last opened file when available.
- When there is no previous session or workspace, show an empty screen (or vault picker).

## Implementation

### Elements

- **Session persistence (backend)**: Get and save session (last_vault_path, last_file_path) in app data.
- **Session restore (frontend)**: On launch load session and open last vault/file when valid, or show empty screen/vault picker.

### Tasks

1. Add or document `test_session_get_save` integration test (to add); verify via Quickstart row 8.
2. In backend, implement get_session and save_session (e.g. app data config file) with last_vault_path and last_file_path.
3. On frontend launch, call get_session; if paths are valid, open vault and file; otherwise show empty screen or vault picker.
4. On vault open and file open/save, call save_session so next launch can restore.

## Validation

`test_session_get_save` integration test (to add); Quickstart row 8.
