# Plan: Keyboard-only primary flows (NFR-Accessibility)

## Purpose

Satisfies NFR-Accessibility.

## Goals

- Primary flows (vault open, file open, save, query, search) are doable via keyboard only; mouse is optional.
- Focus order and shortcuts support keyboard-only use.
- Quickstart NFR-Accessibility used to test key flows with keyboard only.

## Implementation

### Elements

- **Keyboard navigation (UI)**: Support vault open, file open, save, query, and search using keyboard only so primary flows do not require mouse.
- **Focus management**: Ensure logical focus order and shortcuts so mouse is optional for primary flows.

### Tasks

1. Add Quickstart NFR-Accessibility: test vault open, file open, save, query, search with keyboard only.
2. Ensure vault open, file selection, save, query invocation, and search invocation have keyboard triggers (shortcuts or tab + Enter).
3. Ensure focus moves logically between sidebar, editor, and panels so keyboard-only flow is complete.

## Validation

Manual; Quickstart NFR-Accessibility.
