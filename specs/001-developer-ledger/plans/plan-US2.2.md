# Plan: Child list item nested under parent (US2.2)

## Purpose

Satisfies US2.2.

## Goals

- List item exists → add child (indented under it) → child nested, parent-child preserved.
- Parser interprets indentation as parent-child; editor allows indented lines under an item.

## Implementation

### Elements

- **List parser (backend)**: Interpret indentation so indented lines become children of the previous less-indented item; preserve parent-child relationship.
- **Editor list view (frontend)**: Allow adding indented lines under an item so the child appears nested and parent-child is preserved.

### Tasks

1. Add or extend Quickstart row 3 (List hierarchy) step: add line '  - Item B' under Item A and verify child nested, parent-child preserved.
2. In list parser, assign children to parent by indent level (e.g. 2 spaces = one level down).
3. In editor list view, support inserting indented list lines under a selected or current item.
4. Ensure serialization preserves indent so parent-child is round-tripped.

## Validation

Quickstart row 3 (List hierarchy).
