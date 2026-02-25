# Plan: File CRUD (FR-001)

## Purpose

Satisfies FR-001.

## Goals

- Users can create, open, read, edit, save, and delete markdown files.
- New files appear in the side tree and can be opened for editing.
- Edited content persists on save and remains available in the tree.
- Deleted files are removed from the tree and from storage (with confirmation).

## Implementation

### Elements

- **File CRUD (backend)**: This backend must create, read, update, and delete markdown files on disk and expose these operations via Tauri API, so that users can create, open, read, edit, save, and delete markdown files.
- **Editor UI (frontend)**: This frontend must provide create, open, edit, save, and delete actions and an editor area so that users can create, open, read, edit, save, and delete markdown files.

### Tasks

1. Add or run `test_file_crud` integration test that verifies create, read, write, and delete of markdown files.
2. Implement Tauri commands (or equivalent) for create, read, update, and delete of markdown files in the vault.
3. In the frontend, add sidebar/actions for create file, open file (select from tree), save, and delete (with confirmation).
4. In the frontend, add editor area that loads file content, allows editing, and triggers save.

## Validation

`test_file_crud` integration test; Quickstart row 2.
