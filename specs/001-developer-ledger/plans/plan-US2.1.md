# Plan: Top-level list item as root node (US2.1)

## Purpose

Satisfies US2.1.

## Goals

- File open → add top-level list item → appears as root node.
- List parser treats top-level lines as root nodes; outline view shows them as roots.

## Implementation

### Elements

- **List parser (backend)**: Parse markdown list lines so top-level items are root nodes and structure is preserved.
- **List/outline view (frontend)**: Display hierarchy and allow adding top-level list items that appear as root nodes.

### Tasks

1. Add or extend Quickstart row 3 (List hierarchy) step: add line '- Item A' and verify it appears as root node.
2. Ensure list parser interprets lines with no or minimal leading indent as root nodes.
3. In list/outline view, render root nodes and support inserting new top-level list items.
4. Wire editor so new top-level list line is parsed and displayed as root node.

## Validation

Quickstart row 3 (List hierarchy).
