# Plan: Query results view (FR-006)

## Purpose

Satisfies FR-006.

## Goals

- Query results are presented in a view that shows matching items with enough context to locate them in the hierarchy.
- User can open or navigate to the item in the file from the results view.

## Implementation

### Elements

- **Query results (frontend)**: This frontend must present query results in a view with enough context to locate each item in the hierarchy and support navigation to the item in the file, so that FR-006 is satisfied.
- **Query API with context (backend)**: This backend must return matching list items with context (e.g. parent path, file) so that the results view can show context and support navigation to the item.

### Tasks

1. Ensure query API returns each matching item with context (e.g. file path, parent path or breadcrumb) so results view can display context.
2. Add query results view in the frontend that lists matching items with context (e.g. parent path).
3. Add navigation handler so that selecting a result opens the file and navigates to that item (e.g. scroll to line or focus node).

## Validation

`test_query_by_tag` integration test (to add); Quickstart row 5b.
