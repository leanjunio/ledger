# Plan: Tag ≥5 items and see in query in <30 seconds (SC-003)

## Purpose

Satisfies SC-003.

## Goals

- User can tag at least 5 list items and see them in the query result in under 30 seconds.
- Time is from start of tagging/query flow to results displayed.
- Quickstart SC-003 is used for manual timed verification.

## Implementation

### Elements

- **Tagging UI**: Allow adding tags to multiple list items quickly so user can tag ≥5 items and run query in <30 seconds.
- **Query by tag (backend + UI)**: Return and display tagged items so user sees query results in <30 seconds.

### Tasks

1. Add Quickstart SC-003: time from query start to results displayed; document <30 s target.
2. Ensure tagging UX allows adding tags to ≥5 items with minimal steps (e.g. inline tag edit, no heavy dialogs).
3. Ensure query runs and displays results quickly so total flow (tag 5 + run query + see results) stays under 30 seconds.

## Validation

Manual timed check; Quickstart SC-003.
