# Plan: Open file and see content in ≤3 actions (SC-002)

## Purpose

Satisfies SC-002.

## Goals

- User can open a file from the tree and see its content in at most 3 actions.
- Actions are counted as: (1) click vault or focus tree, (2) click file, (3) see content.
- Quickstart SC-002 documents the count and pass condition.

## Implementation

### Elements

- **Sidebar file tree**: Show vault files and allow opening with one or two clicks so user can reach a file in ≤3 actions.
- **Editor load**: Open and render file content on selection so user sees content within ≤3 actions from start.

### Tasks

1. Add Quickstart SC-002: count (1) click vault, (2) click file, (3) see content; verify ≤3 actions.
2. Ensure sidebar tree lists files with at most one expand if needed; file open on single click or double-click as chosen.
3. Ensure editor loads and renders file content immediately on file selection so "see content" is the third action.

## Validation

Manual; Quickstart SC-002.
