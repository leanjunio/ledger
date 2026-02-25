# Plan: Undo and redo (FR-009)

## Purpose

Satisfies FR-009.

## Goals

- Undo and redo for edits in the current file.
- Behavior consistent with standard editor expectations (e.g. Obsidian-like).

## Implementation

### Elements

- **Editor undo/redo (frontend)**: Maintain undo/redo history for the current file and handle Undo/Redo so edits are reversible.

### Tasks

1. Add Quickstart row 7 step: In the editor type "a", "b", "c"; Undo twice then Redo twice and verify content.
2. Implement history stack (e.g. array of document states or diffs) for the current file in the frontend.
3. Add Undo/Redo buttons or shortcuts; clear or keep history on file close per design.
4. Ensure no backend call per keystroke (undo/redo is frontend-only).

## Validation

Manual only; Quickstart row 7.
