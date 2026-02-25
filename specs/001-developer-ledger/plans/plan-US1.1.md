# Plan: Create new file (US1.1)

## Purpose

Satisfies US1.1.

## Goals

- App open → user can create a new file with a name.
- New file appears in tree and can be opened.

## Implementation

### Elements

- **File CRUD (backend)**: Create file on disk and expose create via API.
- **File tree and create UI (frontend)**: Provide create-new-file action and refresh tree; allow opening the new file.

### Tasks

1. Verify via Quickstart row 2 (File CRUD): create a new file → appears in tree and can open.
2. Implement create file on backend (e.g. Tauri command or file service); ensure file is created on disk in vault.
3. In frontend, add create-new-file action (e.g. button or menu); after create, refresh file list and optionally open the new file.

## Validation

Quickstart row 2 (File CRUD).
