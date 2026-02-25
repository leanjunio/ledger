# Plan: Select file, content in editor (US1.2)

## Purpose

Satisfies US1.2.

## Goals

- File in tree → user selects it.
- Content is shown in editor and is editable.

## Implementation

### Elements

- **read_file (backend)**: Return file content for a given path.
- **Editor (frontend)**: Load content when file is selected and allow editing.

### Tasks

1. Verify via Quickstart row 2 (File CRUD): open file → content shown in editor, editable (e.g. "Open it → type text").
2. Implement read_file (or equivalent) on backend; return file content for path in vault.
3. In frontend, on file selection from tree, call read_file and display content in editor; wire editor so typing updates state/content.

## Validation

Quickstart row 2 (File CRUD).
