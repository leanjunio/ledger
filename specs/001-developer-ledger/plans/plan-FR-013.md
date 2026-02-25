# Plan: Copy and paste (FR-013)

## Purpose

Satisfies FR-013.

## Goals

- Users can copy and paste content into and out of the editor (standard text editor behavior).

## Implementation

### Elements

- **Editor clipboard (frontend)**: Allow copy and paste into and out of the editor without blocking standard behavior.

### Tasks

1. Manual only: Quickstart row 11 (standard editor copy-paste).
2. Ensure the editor component does not disable paste or copy (no preventDefault unless required for security); if using a library, verify clipboard is enabled.

## Validation

Manual only; Quickstart row 11.
