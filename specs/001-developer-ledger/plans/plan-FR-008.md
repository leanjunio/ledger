# Plan: Full-text search (FR-008)

## Purpose

Satisfies FR-008.

## Goals

- Full-text search within file content across the workspace (fuzzy-finding capability across all files).
- Results are navigable to the matching location, consistent with editor expectations (e.g. Obsidian-like).

## Implementation

### Elements

- **Full-text search (backend)**: Run search across vault file content and return matches with file path and position.
- **Search UI (frontend)**: Expose search input and results list; allow user to navigate to match in file.

### Tasks

1. Add integration test `test_search_full_text` that verifies search across workspace and navigable results (or document expected behavior for Tauri runtime).
2. Implement search command that accepts query, scans vault file content, returns matches (file path, line/offset or snippet).
3. Expose search to frontend via Tauri command.
4. Add search UI (input + run); display results with context.
5. Add navigation handler so user can click a result and open file at or near the match.

## Validation

`test_search_full_text` integration test (to add); Quickstart row 6.
