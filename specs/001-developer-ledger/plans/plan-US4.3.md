# Plan: Navigate to item from query results (US4.3)

## Purpose

Satisfies US4.3.

## Goals

- Query results shown → select item → navigate to item in file or open file.
- Selecting a result opens the file (if needed) and navigates to the item in the file.

## Implementation

### Elements

- **Query results navigation (frontend)**: On select, navigate to item in file or open file so user can jump to the item.

### Tasks

1. Add Quickstart row 5b: from query results, select item → navigate to item in file or open file.
2. In query results view, make each result selectable (e.g. clickable) and pass item reference (file + position or node id).
3. Implement navigation handler: open file if not open, then scroll/focus to the list item (e.g. by line or node).
4. Verify manually or via integration test that selection from results opens file and shows item in context.

## Validation

Manual or integration; Quickstart row 5b.
