# Plan: Sidebar file tree (FR-002)

## Purpose

Satisfies FR-002.

## Goals

- System displays a tree-like view of files (e.g. sidebar) that reflects the current set of files.
- User can select a file in the tree to open it.
- Tree updates when files are added or removed.

## Implementation

### Elements

- **Vault / file list (backend)**: This backend must list files in the current vault and expose the list via Tauri API, so that a tree-like view can reflect the current set of files.
- **Sidebar file tree (frontend)**: This frontend must display a tree-like view of files in the sidebar and allow selection to open a file, so that FR-002 is satisfied.

### Tasks

1. Add or run `test_vault` integration test that verifies vault open and listing files.
2. Implement backend API to list files in the current vault (e.g. Tauri command or state).
3. In the frontend, add sidebar component that displays files in a tree-like structure.
4. Wire selection in the tree to open the selected file in the editor.

## Validation

`test_vault` integration test; Quickstart row 1.
