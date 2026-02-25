# Plan: Light and dark theme (FR-012)

## Purpose

Satisfies FR-012.

## Goals

- User can select light or dark theme (or follow system).
- Theme preference persists (e.g. after restart).

## Implementation

### Elements

- **Theme (frontend)**: Offer light/dark/system theme; persist in session; apply on load and after change.

### Tasks

1. Manual only: Quickstart row 9 (restart after theme change; theme persists).
2. Add UI to choose light/dark/system; store preference in session config.
3. Apply CSS or class to root so theme is visible; load theme from session on startup.

## Validation

Manual only; Quickstart row 9.
