# Requirements Traceability: Developer Ledger MVP

**Purpose**: Map every requirement from the spec to a verification method (automated test or manual checklist) and track pass/fail status.

**Date**: 2025-02-25

---

## Functional Requirements (FR-001 … FR-013)

| ID | Description | Verification | Status | Notes |
|----|-------------|--------------|--------|-------|
| FR-001 | Create, open, read, edit, save, delete markdown files | `test_file_crud` integration test; Quickstart row 2 | Not run | |
| FR-002 | Display tree-like view of files in sidebar | `test_vault` integration test; Quickstart row 1 | Not run | |
| FR-003 | Interpret list structure in markdown as hierarchy | `parse_two_root_one_child` unit test; Quickstart row 3 | Not run | |
| FR-004 | Allow tags on list items, stored with content | `parse_tags_decision_ci` unit test; Quickstart row 4 | Not run | |
| FR-005 | Query mechanism: filter by tag(s) and optional scope | `test_query_by_tag` integration test (to add); Quickstart row 5a | Not run | Scope explicitly verified in row 5a |
| FR-006 | Query results view with context and navigation | `test_query_by_tag` integration test (to add); Quickstart row 5b | Not run | Navigation (open file at item) in row 5b |
| FR-007 | Persist data in markdown; no binary-only storage | Covered by `test_file_crud` and FR-001 | Not run | Implicit in file persistence |
| FR-008 | Full-text search across workspace, navigable | `test_search_full_text` integration test (to add); Quickstart row 6 | Not run | |
| FR-009 | Undo and redo for edits | Manual only; Quickstart row 7 | Not run | Frontend behavior; no backend test needed |
| FR-010 | Logs formatted per industry standards, local only | Manual check; Quickstart row 10 | Not run | Check log file exists and contains messages |
| FR-011 | Show last opened file on launch or empty screen | `test_session_get_save` integration test (to add); Quickstart row 8 | Not run | Session restore checked |
| FR-012 | Light and dark theme support | Manual only; Quickstart row 9 | Not run | Restart after theme change; theme persists |
| FR-013 | Copy and paste content in/out of editor | Manual only; Quickstart row 11 | Not run | Standard editor behavior |

---

## Acceptance Scenarios (User Stories 1–4)

### User Story 1 - File and tree editor basics

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US1.1 | App open → create new file with name → appears in tree and can open | Quickstart row 2 (File CRUD) | Not run | Covered by "Create a new file" |
| US1.2 | File in tree → select → content shown in editor, editable | Quickstart row 2 (File CRUD) | Not run | Covered by "Open it → type text" |
| US1.3 | File edited → save → changes persisted, file in tree | Quickstart row 2 (File CRUD) | Not run | Covered by "Save → close → reopen → same text" |
| US1.4 | File exists → delete (with confirmation) → removed from tree and disk | Quickstart row 2 (File CRUD) | Not run | Covered by "Delete file → file gone" |

### User Story 2 - Hierarchical list structure

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US2.1 | File open → add top-level list item → appears as root node | Quickstart row 3 (List hierarchy) | Not run | Covered by "add line '- Item A'" |
| US2.2 | List item exists → add child (indented under it) → child nested, parent-child preserved | Quickstart row 3 (List hierarchy) | Not run | Covered by "add line '  - Item B'" |
| US2.3 | Multi-level hierarchy → view/edit → structure preserved, navigable | Quickstart row 3 (List hierarchy) | Not run | Covered by "Reopen → structure shows nesting" |
| US2.4 | Build hierarchy → save → hierarchy stored in markdown and restored on reopen | Quickstart row 3 (List hierarchy) | Not run | Covered by "save. Reopen" |

### User Story 3 - Tagging list items

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US3.1 | List item visible → add tag (e.g. #decision) → tag stored and displayed | Quickstart row 4 (Tags) | Not run | Covered by "add ' #decision'. Save" |
| US3.2 | Item has tags → edit/remove tag → change persisted, reflected in file | Manual check (Quickstart Tag row) | Not run | Verify tag edit and delete persist |
| US3.3 | Multiple items have same tag → query by tag → all items surfaced | Quickstart row 5 (Query by tag) + row 4 | Not run | Covered by query + tagging rows |

### User Story 4 - Query and filtered views

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US4.1 | App with tagged items → run query for tag → view shows all items with context | `test_query_by_tag`; Quickstart row 5 | Not run | Basic query |
| US4.2 | Query by tag → optionally restrict scope to node → only items under that node | `test_query_by_tag` (scope test); Quickstart row 5a | Not run | Scope filter explicitly tested |
| US4.3 | Query results shown → select item → navigate to item in file or open file | Manual or integration; Quickstart row 5b | Not run | Navigation after query |

---

## Success Criteria (SC-001 … SC-006)

| ID | Criterion | Verification | Status | Notes |
|----|-----------|--------------|--------|-------|
| SC-001 | Create file, add nested list items, save in <1 min | Manual timed check; Quickstart SC-001 | Not run | Time user from "Create" button to saved file |
| SC-002 | Open file from tree and see content in ≤3 actions | Manual; Quickstart SC-002 | Not run | Count: (1) click vault, (2) click file, (3) see content |
| SC-003 | Tag ≥5 list items, see in query result in <30 seconds | Manual timed check; Quickstart SC-003 | Not run | Time from query start to results displayed |
| SC-004 | Narrow query by scope, verify only items under node | Manual; Quickstart SC-004 | Not run | Query with scope; check only in-scope items appear |
| SC-005 | Close/reopen app, files/hierarchy/tags persist, no data loss | Manual; Quickstart row 8 + SC-005 | Not run | Restart app; same vault/file/content appear |
| SC-006 | Full-text search to match in ≤5 actions | Manual timed check; Quickstart SC-006 | Not run | Count: (1) open search, (2) type term, (3) run search, (4) see results, (5) navigate |

---

## Non-functional Requirements

| ID | Requirement | Verification | Status | Notes |
|----|-------------|--------------|--------|-------|
| NFR-Accessibility | Primary flows doable via keyboard only; mouse optional | Manual; Quickstart NFR-Accessibility | Not run | Test key flows (vault open, file open, save, query, search) with keyboard only |
| NFR-Privacy | No cloud sync or telemetry; no network for user data | Manual; Quickstart NFR-Privacy | Not run | Inspect devtools Network tab; verify no external requests for data |

---

## Edge Cases

| ID | Edge Case | Verification | Status | Notes |
|----|-----------|--------------|--------|-------|
| Edge-1 | Empty or new file | Manual; Quickstart Edge cases – empty file | Not run | Create file, don't add list items; verify no errors |
| Edge-2 | Malformed or mixed markdown | Manual; Quickstart Edge cases – malformed | Not run | Add invalid list syntax; verify app doesn't crash, shows graceful behavior |
| Edge-3 | Very deep hierarchy | Manual; Quickstart Edge cases – deep hierarchy | Not run | Create deeply nested list (many levels); verify usable and performant |
| Edge-4 | Duplicate or similar tag names | Manual; Quickstart Edge cases – duplicate tags | Not run | Add tags with same name; verify exact match (no auto-dedup) |
| Edge-5 | Empty query results | Manual; Quickstart Edge cases – empty query | Not run | Query for non-existent tag; verify clear empty state, no error |
| Edge-6 | Large number of files or items | Manual; Quickstart Edge cases – large dataset | Not run | Create 100+ files/items; verify tree and query responsive (<2s per plan) |

---

## Automated Tests Summary

| Test | Status | Notes |
|------|--------|-------|
| `test_vault` (vault open, list files) | Exists | FR-002 |
| `test_file_crud` (create, read, write, delete) | Exists | FR-001, FR-007 |
| `parse_two_root_one_child` (parse hierarchy) | Exists (unit) | FR-003 |
| `parse_tags_decision_ci` (parse tags) | Exists (unit) | FR-004 |
| `test_query` (query by tag + scope) | Added (structure; requires Tauri runtime) | FR-005, FR-006 |
| `test_search` (full-text search) | Added (structure; requires Tauri runtime) | FR-008 |
| `test_session_get_save` (get/save session) | Manual only (AppHandle required at runtime) | FR-011 |
| `test_log_from_frontend` (logging) | Manual via Quickstart row 10 | FR-010 |

**Note on Tauri runtime tests**: `query_by_tag` and `search_full_text` require `VaultState` (from Tauri State), which is only available during app runtime. Integration tests for these are documented as test structure and expected behavior. Full testing is achieved via Quickstart rows 5a–5c (query) and row 6 (search), and end-to-end testing when the app is running.

**Note on session and log tests**: `get_session` and `save_session` require `AppHandle`, which is not available in standard Rust integration tests. These are verified via Quickstart rows 8–10 (manual testing with the running app). `log_from_frontend` is similarly manual (row 10).

---

## Checklist: How to verify each requirement

1. **Run automated tests**: `cargo test` from repo root (covers FRs 001, 002, 003, 004).
2. **Review test structure**: `test_query.rs` and `test_search.rs` show expected structures for query and search (to be fully exercised at runtime or via end-to-end tests).
3. **Run quickstart manual checklist**: Follow sections in [quickstart.md](../quickstart.md) for manual verification of all FRs, acceptance scenarios, SCs, NFRs, edge cases.
4. **Mark status**: For each requirement row above, set Status to "Pass" or "Fail" after running checklist/tests.
5. **Update notes**: Add any blockers, workarounds, or observations in Notes column.

---

## Sign-off

| Role | Date | Status |
|------|------|--------|
| (Executor) | Not yet run | Pending |
| (Reviewer) | — | Pending |

