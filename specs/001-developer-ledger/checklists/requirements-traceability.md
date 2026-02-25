# Requirements Traceability: Developer Ledger MVP

**Purpose**: Map every requirement from the spec to a verification method (automated test or manual checklist) and track pass/fail status.

**Date**: 2025-02-25

---

## Functional Requirements (FR-001 … FR-013)

| ID | Description | Verification | Status | Notes |
|----|-------------|--------------|--------|-------|
| FR-001 | Create, open, read, edit, save, delete markdown files | `test_file_crud` integration test; Quickstart row 2 | Not run | |
| FR-002 | Display tree-like view of files in sidebar | `test_vault` integration test; Quickstart row 1 | Not run | |
| FR-003 | Interpret list structure in markdown as hierarchy | `parse_two_root_one_child` unit test; Quickstart row 3 | **Fail** | Unit test fails: expected 2 nodes, got 1 (parser returns single node for "- a\\n  - b") |
| FR-004 | Allow tags on list items, stored with content | `parse_tags_decision_ci` unit test; Quickstart row 4 | **Pass** | Unit test passes |
| FR-005 | Query mechanism: filter by tag(s) and optional scope | `test_query_by_tag` integration test (to add); Quickstart row 5a | Not run | Scope explicitly verified in row 5a |
| FR-006 | Query results view with context and navigation | `test_query_by_tag` integration test (to add); Quickstart row 5b | Not run | Navigation (open file at item) in row 5b |
| FR-007 | Persist data in markdown; no binary-only storage | Covered by `test_file_crud` and FR-001 | Not run | Implicit in file persistence |
| FR-008 | Full-text search across workspace, navigable | `test_search_full_text` integration test (to add); Quickstart row 6 | Not run | |
| FR-009 | Undo and redo for edits | Manual only; Quickstart row 7 | Not run | Frontend behavior; no backend test needed |
| FR-010 | Logs formatted per industry standards, local only | Manual check; Quickstart row 10 | Not run | Check log file exists and contains messages |
| FR-011 | Show last opened file on launch or empty screen | `test_session_get_save` integration test (to add); Quickstart row 8 | Not run | Session restore checked |
| FR-012 | Light and dark theme support | Manual only; Quickstart row 9 | **Pass** (UI) | Theme dropdown works in browser (System/Light/Dark); persistence not checked |
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
| `parse_two_root_one_child` (parse hierarchy) | **Fails** (unit) | FR-003; expected 2 nodes, got 1 |
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

## Validation run (2025-02-25)

- **App run**: `npm run tauri dev` started; Vite at http://localhost:5173; desktop window and browser tab both load the UI.
- **UI (browser)**: Open vault, Create file, Tag query (+ Query), Search (+ Search), Theme (System/Light/Dark) are present. Theme change to Dark works. Main area shows "No .md files" and "Select a file or open a vault to get started."
- **Backend flows**: Open vault, Create file, Query, and Search require the Tauri backend (native dialogs / vault state). In a browser tab alone they were not fully validated; use the **desktop window** for manual Quickstart rows 1, 2, 5a–5c, 6.
- **`cargo test` (from `src-tauri/`)**: `parse_two_root_one_child` **FAILED** (expected 2 nodes, got 1). `parse_tags_decision_ci` **PASSED**. Integration tests in `tests/integration/` (e.g. `test_vault`, `test_file_crud`) are not run by `cargo test`; no top-level `tests/*.rs` binary wires them.
- **Where the app stands**: FR-004 (tags parse) and FR-012 (theme UI) pass. FR-003 (list hierarchy parse) fails at unit level. Vault, file CRUD, query, search, session, undo/redo, copy-paste, logs, and edge cases need manual run in the desktop app and/or integration test wiring.

---

## Known errors (2025-02-25 run)

- **E-001 – List hierarchy unit test fails (FR-003, `parse_list_items`)**
  - **Feature/module**: Hierarchical list structure (FR-003, US2.1–US2.4); Rust module `src-tauri/src/markdown/mod.rs` (`parse_list_items`).
  - **How to reproduce**:
    1. `cd src-tauri`
    2. `cargo test --lib markdown::tests::parse_two_root_one_child`
  - **Expected**: The test case `"- a\n  - b"` produces **two** nodes: one root (`depth = 0`, `parent_id = None`) and one child (`depth = 1`, `parent_id = Some(0)`), with the parent’s `children_ids = [1]`.
  - **Actual**: Test output shows `assertion left == right failed: expected 2 nodes; left: 1, right: 2`. Only one node is returned, so the child item is not represented as a separate node.
  - **Impact**: List hierarchy parsing is currently incorrect at unit-test level; any feature that relies on `parse_list_items` for building parent/child structure (e.g. tree view of list items, scoped queries) may misrepresent nested items.

- **E-002 – Frontend Tauri invoke errors when running UI in a plain browser (no Tauri context)**
  - **Feature/module**: All frontend actions that call Tauri commands (vault open, file create, query, search); TypeScript entry `src/main.ts` (lines around 240 and 260) and related Tauri integration code.
  - **Environment**: Vite dev server opened in a regular browser (e.g. Cursor Browser Chromium) at `http://localhost:5173`, **outside** the Tauri desktop window.
  - **How to reproduce**:
    1. From repo root: `npm run dev` (or `npm run tauri dev`, which also starts Vite).
    2. In a normal browser (not the Tauri window), open `http://localhost:5173`.
    3. Open browser devtools console.
    4. Click controls that trigger Tauri calls, such as `Open vault` or `Create file` (which show a `prompt` for file name), or run query/search.
  - **Observed console messages** (examples):
    - `TypeError: Cannot read properties of undefined (reading 'invoke')` (logged from `src/main.ts` lines ~240 and ~260).
    - `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'invoke')` (from a built chunk `chunk-G7S6KQDI.js`).
    - Environment-specific warnings in Cursor Browser:  
      - `[CursorBrowser] Dialog suppressed: prompt - File name (e.g. note.md): (returning: )`  
      - `[CursorBrowser] Dialog suppressed: alert - TypeError: Cannot read properties of undefined (reading 'invoke')`
  - **Root cause**: When the frontend runs in a plain browser, the Tauri runtime (e.g. `window.__TAURI__` or injected `invoke`) is not present, so calls to `invoke` fail. Dialog handling in the Cursor Browser also suppresses `prompt`/`alert`, which hides some UI feedback.
  - **Impact**: In a non-Tauri browser context, FR-001/FR-002/FR-005/FR-006/FR-007/FR-008 cannot be validated because backend commands do not run. These flows must be exercised in the **Tauri desktop window**.

- **E-003 – `cargo test` expectations vs. actual test wiring**
  - **Feature/module**: Automated validation for FR-001 (file CRUD) and FR-002 (vault tree) via integration tests.
  - **Checklist expectation**: This document currently says to run `cargo test` from the repo root (L123), and the FR table lists `test_file_crud` and `test_vault` as existing integration tests.
  - **Actual behavior**:
    - Running `cargo test` from the repo root fails with `could not find Cargo.toml`; tests must be run from `src-tauri`.
    - Running `cargo test` from `src-tauri` executes only the two unit tests in `src/lib.rs` (`parse_two_root_one_child`, `parse_tags_decision_ci`). The integration tests under `src-tauri/tests/integration/` (`test_file_crud.rs`, `test_vault.rs`, `test_query.rs`, `test_search.rs`) are not wired via a top-level `tests/*.rs` file and therefore are not executed by default.
  - **Impact**: As of this run, FR-001 and FR-002 are **not** covered by automated tests in the default `cargo test` invocation; they must be verified manually via the Quickstart checklist until integration tests are wired into the Cargo test harness.

## Sign-off

| Role | Date | Status |
|------|------|--------|
| (Executor) | Not yet run | Pending |
| (Reviewer) | — | Pending |

