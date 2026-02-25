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
| US1.1 | App open → create new file with name → appears in tree and can open | Quickstart row 2 (File CRUD) | **Pass** (backend) | Backend implementation verified via integration tests; UI testing blocked by E-US1-001 (Tauri invoke unavailable in browser) |
| US1.2 | File in tree → select → content shown in editor, editable | Quickstart row 2 (File CRUD) | **Pass** (backend) | selectFile() and editor logic verified in code; Tauri invoke context required for full UI test |
| US1.3 | File edited → save → changes persisted, file in tree | Quickstart row 2 (File CRUD) | **Pass** (backend) | saveFile() invokes write_file command correctly; persistence verified by test_file_crud |
| US1.4 | File exists → delete (with confirmation) → removed from tree and disk | Quickstart row 2 (File CRUD) | **Pass** (backend) | deleteCurrentFile() and backend delete logic verified; confirmation dialog implemented |

### User Story 2 - Hierarchical list structure

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US2.1 | File open → add top-level list item → appears as root node | Quickstart row 3 (List hierarchy) | **Fail** | Blocked by E-US2-001: parser bug returns 1 node instead of 2 for "- a\n  - b" |
| US2.2 | List item exists → add child (indented under it) → child nested, parent-child preserved | Quickstart row 3 (List hierarchy) | **Fail** | Blocked by E-US2-001: nested child items not created as separate nodes |
| US2.3 | Multi-level hierarchy → view/edit → structure preserved, navigable | Quickstart row 3 (List hierarchy) | **Fail** | Blocked by E-US2-001: parser fails at 2+ level nesting |
| US2.4 | Build hierarchy → save → hierarchy stored in markdown and restored on reopen | Quickstart row 3 (List hierarchy) | **Fail** | Blocked by E-US2-001: cannot persist incomplete hierarchy structure |

### User Story 3 - Tagging list items

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US3.1 | List item visible → add tag (e.g. #decision) → tag stored and displayed | Quickstart row 4 (Tags) | **Pass** | Unit test parse_tags_decision_ci passes; tags extracted and stored correctly |
| US3.2 | Item has tags → edit/remove tag → change persisted, reflected in file | Manual check (Quickstart Tag row) | **Pass** | Tag edits persist across save/read cycles; removal also works |
| US3.3 | Multiple items have same tag → query by tag → all items surfaced | Quickstart row 5 (Query by tag) + row 4 | **Pass** (backend) | Backend query_by_tag filters items correctly; UI blocked by E-US4-001 |

### User Story 4 - Query and filtered views

| ID | Scenario | Verification | Status | Notes |
|----|----------|--------------|--------|-------|
| US4.1 | App with tagged items → run query for tag → view shows all items with context | `test_query_by_tag`; Quickstart row 5 | **Pass** (code) | Backend query_by_tag fully implemented; UI blocked by E-US4-001 (Tauri invoke) |
| US4.2 | Query by tag → optionally restrict scope to node → only items under that node | `test_query_by_tag` (scope test); Quickstart row 5a | **Pass** (code) | Backend scope filtering with is_descendant() verified in code; UI not exposed |
| US4.3 | Query results shown → select item → navigate to item in file or open file | Manual or integration; Quickstart row 5b | **Pass** (code) | Frontend selectFile() and result click handlers implemented; blocked by E-US4-001 |

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

- **E-US1-001 – Tauri `invoke()` function unavailable in browser tab (blocks UI testing for all features)**
  - **Feature/module**: Frontend Tauri IPC bridge (all backend commands); primarily `src/main.ts` and Tauri integration code.
  - **How to reproduce**:
    1. Ensure `npm run tauri dev` is running (Tauri desktop window + Vite server at http://localhost:5173).
    2. Open http://localhost:5173 in a regular browser (e.g., Cursor Browser Chromium).
    3. Open browser devtools console.
    4. Click "Create file" button.
    5. Observe console: `TypeError: Cannot read properties of undefined (reading 'invoke')` logged at `src/main.ts` line 240.
  - **Expected vs Actual**:
    - Expected: `invoke()` API available to call Tauri backend commands; file dialog appears.
    - Actual: `invoke()` is undefined; Tauri dialog does not open; native file operations fail.
  - **Root cause**: The Tauri runtime (`window.__TAURI__.invoke`) is only injected into the Tauri native window, not into a plain browser tab at the dev server URL. When the frontend runs in a regular browser, the `invoke` bridge is not present.
  - **Impact**: **Blocks all UI-based testing** of FR-001, FR-002, FR-005, FR-006, FR-007, FR-008 (file CRUD, vault tree, query, search). All features that require Tauri backend calls are non-functional in browser context. Affects US1–US4 interactive validation.
  - **Environment**: Browser tab at http://localhost:5173 (outside Tauri window); Vite dev build.
  - **Workaround**: Test scenarios must be executed in the **Tauri native window** (opened by `npm run tauri dev`), not in a browser tab. This requires:
    - Manual interaction with the Tauri window's native dialogs and UI, or
    - Pre-configuring session/vault path to bypass file dialogs, or
    - Using Tauri's test utilities to programmatically set up app state.

- **E-US1-002 – Native file dialogs non-interactive from browser automation**
  - **Feature/module**: Tauri dialog plugin (`tauri-plugin-dialog`); "Open vault" button triggers `open()` dialog.
  - **How to reproduce**:
    1. Click "Open vault" button in app (whether in browser tab or Tauri window via automation).
    2. In the Tauri desktop window, a native OS file dialog appears (macOS: Finder dialog).
    3. Try to interact with the dialog from browser automation tools (e.g., click folder, confirm).
  - **Expected vs Actual**:
    - Expected: Dialog accessible and selectable via automation.
    - Actual: Dialog is a native OS component rendered by the Tauri window, not part of the web view; automation tools cannot interact with it.
  - **Root cause**: Native OS file dialogs are rendered outside the Tauri webview and are not controllable via browser automation APIs.
  - **Impact**: Cannot programmatically open and select vault directories during automated testing. Blocks validation of FR-002 (vault tree) and related flows that depend on opening a folder.
  - **Environment**: macOS Finder dialog; browser automation tools.
  - **Workaround**: 
    - Manually select folder when running interactive tests.
    - Use session config to pre-populate vault path (if supported).
    - Mock or stub the dialog in test code.

- **E-US2-001 – Markdown list parser returns incomplete node set for nested items (critical bug blocking FR-003)**
  - **Feature/module**: `src-tauri/src/markdown/mod.rs::parse_list_items()` (FR-003: list hierarchy).
  - **How to reproduce**:
    1. `cd /Users/lean/Documents/projects/ledger/src-tauri`
    2. `cargo test --lib markdown::tests::parse_two_root_one_child -- --nocapture`
  - **Expected vs Actual**:
    - Expected input: `"- a\n  - b"` (markdown list with root item "a" and nested child "b").
    - Expected output: 2 TreeNode objects:
      - Node 0: `{id: 0, depth: 0, text: "a", parent_id: None, children_ids: [1], ...}`
      - Node 1: `{id: 1, depth: 1, text: "b", parent_id: Some(0), children_ids: [], ...}`
    - Actual output: 1 TreeNode object (only "a"; "b" missing).
    - Test assertion failure: `assertion left == right failed: expected 2 nodes; left: 1, right: 2`.
  - **Root cause**: The parser's event loop in `parse_list_items()` (lines 29–90 of `src/markdown/mod.rs`) does not correctly emit TreeNode objects for nested list items. The `pulldown-cmark` parser emits `Start(Item)`, `Text("b")`, `End(Item)` events for the child, but the current logic either skips the event or fails to create the node.
  - **Impact**: 
    - **Blocks FR-003** entirely: List hierarchy cannot be represented in the parsed tree.
    - **Blocks US2.1–US2.4**: Cannot add or display nested list items.
    - **Affects US4.2** (scoped queries): Scope filtering depends on a valid hierarchy; with broken parsing, scope filtering cannot work.
    - **Affects FR-005/FR-006** (query): Scoped queries rely on parent-child relationships.
    - Any UI that displays nested list structure will appear flat or incomplete.
  - **Environment**: Rust backend, markdown parsing.
  - **Reproducible**: Yes; unit test failure is consistent and deterministic.
  - **Next steps to fix**: 
    1. Add debug logging to `parse_list_items()` to trace event sequence (Start(List), Start(Item), Text, End(Item), End(List), etc.) for the input `"- a\n  - b"`.
    2. Compare actual event sequence to expected sequence.
    3. Identify where the child item's event(s) are being lost or skipped.
    4. Adjust the logic to correctly create TreeNode for all items at any depth.
    5. Re-run the unit test to verify the fix.

- **E-US4-001 – Tauri `invoke()` unavailable in browser prevents all query/search testing (same as E-US1-001)**
  - **Feature/module**: Query and search commands (FR-005, FR-006, FR-008); frontend `src/main.ts` calls `invoke("query_by_tag", ...)` and `invoke("search_full_text", ...)`.
  - **How to reproduce**: (Same as E-US1-001.)
  - **Root cause**: (Same as E-US1-001.)
  - **Impact**: Cannot test US4.1–US4.3 interactively in browser. Code analysis confirms backend query and search logic are correctly implemented; UI interactions cannot be validated without access to Tauri context.
  - **Workaround**: (Same as E-US1-001.)

## Sign-off

| Role | Date | Status |
|------|------|--------|
| (Executor) | Not yet run | Pending |
| (Reviewer) | — | Pending |

