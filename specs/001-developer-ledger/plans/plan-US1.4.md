# Plan: Delete file with confirmation (US1.4)

## Purpose

Satisfies US1.4.

## Goals

- File exists → user deletes (with confirmation).
- File is removed from tree and from disk.

## Implementation

### Elements

- **delete_file (backend)**: Remove file from disk and expose delete via API.
- **Delete UI (frontend)**: Confirm delete then call delete and refresh tree.

### Tasks

1. Verify via Quickstart row 2 (File CRUD): delete file → file gone from tree and disk.
2. Implement delete_file (or equivalent) on backend; remove file at path in vault.
3. In frontend, add delete action (e.g. from context menu or button); show confirmation dialog; on confirm call delete and refresh file tree.

## Validation

Quickstart row 2 (File CRUD).
