# Plan: Large number of files or items (Edge-6)

## Purpose

Satisfies Edge-6.

## Goals

- Tree and query remain responsive when there are many files or list items (e.g. 100+).
- Target: responsive within &lt;2s per plan/spec expectation where applicable.

## Implementation

### Elements

- **Vault and query (backend)**: List files and run query efficiently so large datasets do not block.
- **Tree and query UI (frontend)**: Render and update tree and query results so UI stays responsive for large datasets.

### Tasks

1. Manual: Quickstart Edge cases – large dataset (create 100+ files/items; verify tree and query responsive &lt;2s per plan).
2. Backend: avoid loading full content for all files at once where possible; limit or paginate query results if needed.
3. Frontend: virtualize or limit rendering if needed so tree and result list remain responsive.

## Validation

Manual; Quickstart Edge cases – large dataset.
