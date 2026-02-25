# Plan: Save and persist (US1.3)

## Purpose

Satisfies US1.3.

## Goals

- File edited → user saves.
- Changes are persisted and file remains in tree.

## Implementation

### Elements

- **write_file (backend)**: Persist file content to disk.
- **Editor save (frontend)**: Trigger save and keep tree in sync with persisted file.

### Tasks

1. Verify via Quickstart row 2 (File CRUD): save → close → reopen → same text (changes persisted, file in tree).
2. Implement write_file (or equivalent) on backend; write content to path in vault.
3. In frontend, add save action (e.g. button or shortcut); on save call write_file; ensure tree still shows the file and does not need full refresh if not required.

## Validation

Quickstart row 2 (File CRUD).
