# Plan: Query by tag surfaces all matching items (US3.3)

## Purpose

Satisfies US3.3.

## Goals

- Multiple items have same tag → query by tag → all items surfaced.
- Backend returns all list items matching the tag; frontend shows them in query results.

## Implementation

### Elements

- **Query by tag (backend)**: Return all list items matching a tag so multiple items with same tag are surfaced.
- **Query results view (frontend)**: Show items matching the tag so all items with that tag are surfaced.

### Tasks

1. Add or use Quickstart row 5 (Query by tag) + row 4: tag multiple items with same tag, run query → all shown.
2. Implement query command or function that accepts a tag and returns all list items (across open/file or vault) that have that tag.
3. Expose query to frontend (e.g. Tauri command).
4. Add query results view that displays all returned items so user sees every item with the tag.

## Validation

Quickstart row 5 (Query by tag) + row 4.
