# Plan: Tags on list items (FR-004)

## Purpose

Satisfies FR-004.

## Goals

- Users can associate one or more tags (e.g. #decision, #ci) with a list item.
- Tags are stored with the content and persist with the file.
- Tags are displayed and can be edited or removed.

## Implementation

### Elements

- **Tag parsing and storage (backend)**: This backend must parse tags from list item content and store them with content when saving, so that tags persist with the file.
- **Tag input and display (frontend)**: This frontend must allow users to add, edit, and remove tags on list items and display tags, so that users can associate tags with list items and see them.

### Tasks

1. Add or run `parse_tags_decision_ci` unit test that verifies parsing of tags from list item content.
2. Ensure parser and serializer handle inline tags (e.g. `#decision`, `#ci`) in list item text and preserve them on save.
3. In the frontend, display tags on list items and provide a way to add, edit, or remove tags (e.g. inline in editor or tag chips).

## Validation

`parse_tags_decision_ci` unit test; Quickstart row 4.
