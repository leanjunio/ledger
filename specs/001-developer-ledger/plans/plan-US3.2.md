# Plan: Edit and remove tag (US3.2)

## Purpose

Satisfies US3.2.

## Goals

- Item has tags → edit/remove tag → change persisted, reflected in file.
- Tag changes are persisted in markdown; UI allows editing and removing tags.

## Implementation

### Elements

- **Tag persistence (backend)**: Persist tag changes in markdown so edit/remove is reflected in file.
- **Tag editor (frontend)**: Allow editing and removing tags so changes are persisted and reflected in file.

### Tasks

1. Add Manual check (Quickstart Tag row): verify tag edit and delete persist.
2. In backend, ensure serialization writes updated tag set to list item content so file reflects edits/removals.
3. In frontend, provide control to edit tag text or remove a tag from an item.
4. On save, persist updated content; on reopen, verify tag edit/remove is reflected in file.

## Validation

Manual check (Quickstart Tag row).
