# Plan: Multi-level hierarchy view and edit (US2.3)

## Purpose

Satisfies US2.3.

## Goals

- Multi-level hierarchy → view/edit → structure preserved, navigable.
- Parser round-trips multi-level nesting; outline view shows and allows editing with navigation.

## Implementation

### Elements

- **List parser (backend)**: Preserve multi-level nesting when parsing and serializing so structure is round-tripped.
- **List/outline view (frontend)**: Show multi-level hierarchy and support navigation/editing so structure remains visible and navigable.

### Tasks

1. Add Quickstart row 3 (List hierarchy) step: create multi-level list, reopen → structure shows nesting.
2. In list parser, support arbitrary depth; serialize with consistent indentation so structure is preserved.
3. In list/outline view, render multi-level tree and support expand/collapse or scroll so hierarchy is navigable.
4. Allow in-place edit at any level without losing sibling or child structure.

## Validation

Quickstart row 3 (List hierarchy).
