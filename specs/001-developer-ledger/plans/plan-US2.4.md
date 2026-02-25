# Plan: Hierarchy save and restore (US2.4)

## Purpose

Satisfies US2.4.

## Goals

- Build hierarchy → save → hierarchy stored in markdown and restored on reopen.
- Serializer writes hierarchy to markdown; parser restores it on load; save flow persists to disk.

## Implementation

### Elements

- **List parser/serializer (backend)**: Serialize list hierarchy to markdown and parse on load so hierarchy is stored and restored on reopen.
- **Save flow (frontend)**: Trigger save so hierarchy is written to disk and restored on reopen.

### Tasks

1. Add Quickstart row 3 (List hierarchy) step: build hierarchy, save, reopen → same structure.
2. Implement or extend list serializer to emit markdown list lines with correct indentation from in-memory tree.
3. On file load, parse markdown into hierarchy so restored content matches saved structure.
4. Ensure editor save triggers write of current content (including hierarchy) to file; verify reopen shows same hierarchy.

## Validation

Quickstart row 3 (List hierarchy).
