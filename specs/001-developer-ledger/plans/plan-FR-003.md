# Plan: List hierarchy (FR-003)

## Purpose

Satisfies FR-003.

## Goals

- System interprets list structure in markdown as a hierarchy (parent/child).
- Hierarchy is preserved on edit and save.
- Multi-level hierarchy is viewable and navigable (e.g. expand/collapse or indentation).

## Implementation

### Elements

- **List hierarchy parser (backend)**: This backend must interpret list structure in markdown as parent/child hierarchy and preserve it on parse and serialization, so that hierarchy is preserved on edit and save.
- **Editor hierarchy (frontend)**: This frontend must display and allow editing of list items as a hierarchy (e.g. indentation, expand/collapse) so that list structure is interpreted as hierarchy and preserved.

### Tasks

1. Add or run `parse_two_root_one_child` unit test that verifies parsing of list structure into hierarchy (e.g. two roots, one child).
2. Implement parser that converts markdown list syntax to a hierarchy (parent/child) and serializes back to markdown.
3. In the frontend, display list items as a hierarchy (e.g. indentation or outline) and preserve structure when editing and saving.

## Validation

`parse_two_root_one_child` unit test; Quickstart row 3.
