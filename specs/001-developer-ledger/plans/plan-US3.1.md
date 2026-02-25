# Plan: Add tag to list item (US3.1)

## Purpose

Satisfies US3.1.

## Goals

- List item visible → add tag (e.g. #decision) → tag stored and displayed.
- Parser extracts and stores tags with item; UI displays tags on list items.

## Implementation

### Elements

- **Tag parser (backend)**: Parse tags from list item content so tags are stored with the item.
- **Tag display (frontend)**: Display tags on list items so user sees e.g. #decision.

### Tasks

1. Add Quickstart row 4 (Tags) step: add ' #decision' to item, save → tag stored and displayed.
2. In list/tag parser, recognize #word tokens in item text and attach as tags to the item node.
3. In list/outline or editor view, render tags (e.g. #decision) next to or on the list item.
4. Ensure saved markdown includes tag text so round-trip preserves tags.

## Validation

Quickstart row 4 (Tags).
