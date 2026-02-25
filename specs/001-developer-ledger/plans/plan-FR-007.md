# Plan: Markdown-only persistence (FR-007)

## Purpose

Satisfies FR-007.

## Goals

- All data is persisted in markdown (or editable text); no opaque binary-only storage for hierarchy or tags.
- File CRUD and save flows keep content as text/markdown.

## Implementation

### Elements

- **Markdown persistence (backend)**: This backend must persist all file data as markdown (or editable text) only, with no opaque binary-only storage for hierarchy or tags, so that FR-007 is satisfied.
- **Editor content (frontend)**: This frontend must edit and save content as text/markdown only and not introduce binary-only storage, so that all data remains in markdown.

### Tasks

1. Ensure `test_file_crud` (and FR-001) cover persistence as markdown; no binary-only storage.
2. In backend, ensure all file writes are plain text/markdown; do not introduce binary formats for hierarchy or tags.
3. In frontend, ensure editor and save path write only text/markdown content.

## Validation

Covered by `test_file_crud` and FR-001.
