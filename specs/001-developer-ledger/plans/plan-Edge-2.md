# Plan: Malformed or mixed markdown (Edge-2)

## Purpose

Satisfies Edge-2.

## Goals

- Malformed or mixed markdown does not crash the app.
- Graceful behavior (e.g. partial list, raw text, or clear fallback) is shown.
- Quickstart Edge cases – malformed used for manual verification.

## Implementation

### Elements

- **Parser resilience**: Handle malformed or mixed markdown without crash; show graceful behavior (e.g. partial list or raw).

### Tasks

1. Add Quickstart Edge cases – malformed: add invalid list syntax; verify app does not crash, shows graceful behavior.
2. Ensure parser handles invalid or mixed markdown (e.g. non-list lines, bad indent) without panic.
3. Define and implement fallback (e.g. show raw, or partial list) so user sees predictable behavior.

## Validation

Manual; Quickstart Edge cases – malformed.
