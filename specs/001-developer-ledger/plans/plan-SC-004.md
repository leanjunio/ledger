# Plan: Narrow query by scope (SC-004)

## Purpose

Satisfies SC-004.

## Goals

- User can narrow a query by scope (restrict to a node).
- Only items under the selected node appear in results.
- Verification is manual via Quickstart SC-004.

## Implementation

### Elements

- **Scope filter (backend)**: Restrict query to items under the selected node so only in-scope items are returned.
- **Query results (scope)**: Display only in-scope items so user can verify that scope narrows results correctly.

### Tasks

1. Add Quickstart SC-004: run query with scope; verify only items under node appear.
2. Implement or verify scope parameter in query command; filter items by parent path or node id.
3. Ensure query results view shows only in-scope items when scope is set so verification is clear.

## Validation

Manual; Quickstart SC-004.
