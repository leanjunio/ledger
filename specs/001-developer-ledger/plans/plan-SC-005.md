# Plan: Persist across close/reopen, no data loss (SC-005)

## Purpose

Satisfies SC-005.

## Goals

- After close/reopen, same vault, files, hierarchy, and tags are present; no data loss.
- Session restore (e.g. last opened file) aligns with Quickstart row 8.
- Quickstart row 8 + SC-005 used for manual verification.

## Implementation

### Elements

- **Session persistence**: Save and restore last opened file and vault so reopen shows same context.
- **File and vault persistence**: Persist all files, hierarchy, and tags to disk so close/reopen has no data loss.

### Tasks

1. Add or reference Quickstart row 8 + SC-005: restart app; verify same vault, file, content, hierarchy, tags.
2. Ensure session (last vault/file) is saved on close and restored on launch.
3. Ensure all file content, list structure, and tags are written to markdown and re-read on reopen.

## Validation

Manual; Quickstart row 8 + SC-005.
