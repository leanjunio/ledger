# Plan: Query for tag shows all items with context (US4.1)

## Purpose

Satisfies US4.1.

## Goals

- App with tagged items → run query for tag → view shows all items with context.
- Backend returns matching items with context (e.g. parent path); frontend shows them with context.

## Implementation

### Elements

- **Query by tag (backend)**: Accept tag and return matching list items with context so the view can show all items.
- **Query results view (frontend)**: Show all matching items with context (e.g. parent path).

### Tasks

1. Add test_query_by_tag that verifies filtering by tag and that results include context; add Quickstart row 5 (basic query).
2. Implement query command that accepts tag(s), returns matches with context (e.g. file path, parent path, item text).
3. Expose query to frontend via Tauri command.
4. Add query results view that lists all matching items with context (e.g. parent path or breadcrumb).

## Validation

test_query_by_tag; Quickstart row 5.
