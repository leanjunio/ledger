# Plan: Query scope restricted to node (US4.2)

## Purpose

Satisfies US4.2.

## Goals

- Query by tag → optionally restrict scope to node → only items under that node.
- Backend accepts optional scope node and returns only items under that node.

## Implementation

### Elements

- **Query by tag with scope (backend)**: Accept tag and optional scope node; return only items under that node.

### Tasks

1. Add test_query_by_tag (scope test) that verifies results are limited to items under the given node; add Quickstart row 5a.
2. Extend query command to accept optional scope (e.g. node id or path) and filter results to items that are descendants of that node.
3. Expose scope parameter to frontend so user can optionally restrict query to a subtree.
4. Verify in Quickstart row 5a that scope filter returns only in-scope items.

## Validation

test_query_by_tag (scope test); Quickstart row 5a.
