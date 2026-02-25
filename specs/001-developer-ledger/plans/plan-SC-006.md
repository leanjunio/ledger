# Plan: Full-text search to match in ≤5 actions (SC-006)

## Purpose

Satisfies SC-006.

## Goals

- User can complete full-text search to a match in at most 5 actions.
- Actions: (1) open search, (2) type term, (3) run search, (4) see results, (5) navigate to match.
- Quickstart SC-006 used for manual timed/count verification.

## Implementation

### Elements

- **Search UI**: Expose open-search, type term, run search, see results, and navigate to match in ≤5 actions.
- **Search backend**: Return full-text matches so user can complete search-to-match in ≤5 actions.

### Tasks

1. Add Quickstart SC-006: count actions to reach a search match; verify ≤5.
2. Ensure search is openable in one action (shortcut or button), type and run minimal, results and navigation clear.
3. Ensure search backend returns matches quickly so the full flow fits in 5 actions.

## Validation

Manual timed check; Quickstart SC-006.
