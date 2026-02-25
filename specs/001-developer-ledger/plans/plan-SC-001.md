# Plan: Create file and nested list in <1 min (SC-001)

## Purpose

Satisfies SC-001.

## Goals

- User can create a file and add nested list items in under 1 minute.
- Save completes within that time so the flow is achievable as a timed success criterion.
- Quickstart SC-001 can be used to time from "Create" button to saved file.

## Implementation

### Elements

- **Quick create and list (UI)**: Expose create-file and list-editing so user can create a file and add nested list items in minimal steps.
- **Save pipeline (backend)**: Persist list changes so save completes and user can finish the flow in under 1 minute.

### Tasks

1. Add Quickstart SC-001 step: time user from "Create" button to saved file with nested list items; document <1 min target.
2. Ensure create-file flow is minimal (e.g. single action or short dialog).
3. Ensure list-editing allows adding root and nested items with minimal actions.
4. Ensure save is one action and completes quickly so total time stays under 1 minute.

## Validation

Manual timed check; Quickstart SC-001.
