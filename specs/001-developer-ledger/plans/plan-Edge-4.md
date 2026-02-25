# Plan: Duplicate or similar tag names (Edge-4)

## Purpose

Satisfies Edge-4.

## Goals

- Tags are matched by exact name; no automatic deduplication required for MVP.
- Adding tags with the same name behaves as specified (exact match).

## Implementation

### Elements

- **Tag matching (backend)**: Match tags by exact name; do not auto-deduplicate or fuzzy-match tag names for MVP.

### Tasks

1. Manual: Quickstart Edge cases – duplicate tags (add tags with same name; verify exact match, no auto-dedup).
2. In query and display, use exact string match for tag names; do not merge or deduplicate identical tags.

## Validation

Manual; Quickstart Edge cases – duplicate tags.
