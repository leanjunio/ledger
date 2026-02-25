# Plan: Query by tag and scope (FR-005)

## Purpose

Satisfies FR-005.

## Goals

- System provides a query mechanism that filters list items by tag(s).
- Query can optionally be restricted by scope (a chosen node in the hierarchy).
- Only matching items (and optionally under the chosen node) are returned.

## Implementation

### Elements

- **Query by tag (backend)**: This backend must accept tag(s) and optional scope (node) and return matching list items from the current vault, so that the query mechanism filters by tag(s) and optional scope.
- **Query UI (frontend)**: This frontend must provide a way to run a query by tag(s) and optional scope and trigger the backend query, so that users can filter list items by tag(s) and scope.

### Tasks

1. Add `test_query_by_tag` integration test that verifies filtering by tag(s) and optional scope.
2. Implement query command or API that accepts tag(s) and optional scope (node id or path), and returns matching list items from the current vault.
3. Expose query to frontend via Tauri command or equivalent.
4. In the frontend, add query UI (e.g. input for tag(s) and optional scope selector) that invokes the backend and receives results.

## Validation

`test_query_by_tag` integration test (to add); Quickstart row 5a.
