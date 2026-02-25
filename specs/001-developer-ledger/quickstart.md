# Quickstart: Developer Ledger

**Branch**: `001-developer-ledger`  
**Executor**: Read [execution-principles.md](./execution-principles.md) and [plan.md](./plan.md) first. This document gives step-by-step setup, build, run, and a final validation checklist. No step requires guessing; if a command fails, stop and fix before continuing.

---

## Purpose

Quickstart allows an executor with no prior setup to (1) install the exact tools needed, (2) get the project to build and run, and (3) verify that the MVP meets the spec by following a fixed checklist. Use this after implementing the plan phases to confirm everything works.

---

## Goals

- [ ] The executor can run the app from a clean clone (after installing prerequisites).
- [ ] Build succeeds with one command; run (dev) succeeds with one command.
- [ ] The validation checklist at the end maps to spec FRs and user stories; every item can be checked manually or by test.

---

## Prerequisites (install in this order)

Do not skip. The executor must have these before running any project commands.

1. **Rust**  
   - Go to https://rustup.rs  
   - Follow the official install steps for your OS.  
   - Close and reopen the terminal, then run: `rustup update stable` and `cargo --version`.  
   - Expected: a version number (e.g. 1.75 or higher). If not, do not proceed; fix the Rust install.

2. **Node.js**  
   - Install Node.js LTS (v18 or higher). Use the official installer from https://nodejs.org or your OS package manager.  
   - Run: `node --version` and `npm --version`.  
   - Expected: v18.x or higher and npm 9+. If not, fix the Node install.

3. **Tauri system dependencies**  
   - Open https://v2.tauri.app/start/prerequisites/  
   - Follow the section for your OS (Windows, macOS, or Linux). Install every listed dependency (e.g. Visual Studio Build Tools on Windows, Xcode CLI on macOS, build-essential and webkit on Linux).  
   - Do not use Tauri v1 prerequisite pages; use only v2.

4. **Git and repo**  
   - Ensure the repo is cloned and you are on the correct branch (e.g. `001-developer-ledger`).  
   - From repo root run: `git status`. Expected: clean or list of modified files; no "not a git repository" error.

---

## Implementation: Setup (step by step)

Execute in order. Use the repository root as the current directory unless stated otherwise.

1. Open a terminal. Navigate to the repository root (the folder that contains `specs/` and, after scaffold, `src-tauri/`).

2. Run: `rustup update stable`  
   - Expected: "stable unchanged" or an update message. Exit code 0.  
   - If error: fix Rust install (see Prerequisites).

3. Run: `cargo --version`  
   - Expected: `cargo 1.xx.x`.  
   - If error: Rust is not in PATH; fix PATH or reinstall.

4. Run: `node --version`  
   - Expected: v18.x or higher.  
   - If error: fix Node install.

5. If the project is not yet scaffolded (no `src-tauri` folder):  
   - Run: `npm create tauri-app@latest`  
   - Follow the prompts. Choose: project name (e.g. ledger), package manager (npm/pnpm/yarn), template: **TypeScript** (or the one that gives Rust + TypeScript + Vite).  
   - Do **not** choose a template that says "Tauri 1" or "v1."  
   - After creation, enter the new project folder if the script created a subfolder; that folder becomes the "repo root" for the rest of the steps. If the repo already had a structure, merge the Tauri template into the repo root as needed so that `src-tauri/` and the frontend folder (e.g. `src/`) are in the repo root.

6. Run: `npm install` (or `pnpm install` / `yarn` if the project uses that).  
   - Expected: dependencies installed; no "ENOENT" or "module not found" for critical packages.  
   - If error: fix the message (e.g. Node version, network); do not guess.

7. Run: `npm run tauri build` (or `pnpm tauri build`).  
   - Expected: Build completes; you see "Finished" or similar. Exit code 0.  
   - If error: read the first error line. Common: missing Tauri prerequisites (go back to Prerequisites step 3), or Rust/Node version. Fix and re-run.

8. Run: `npm run tauri dev` (or `pnpm tauri dev`).  
   - Expected: A desktop window opens with the app (may be empty or template content).  
   - Close the window. In the terminal you should see the process exit.  
   - If the window does not open: check Tauri docs for your OS; check that no firewall is blocking; check the terminal for error messages.

9. Run: `cargo test` (from repo root or from `src-tauri/`).  
   - Expected: "test result: ok" or "running 0 tests" if no tests yet. Exit code 0.  
   - If error: fix the failing test or compile error; do not proceed with a red test suite.

---

## Validation (MVP checklist)

For full coverage and pass/fail tracking, see [requirements-traceability.md](checklists/requirements-traceability.md).

After implementing all plan phases, run through this list. Each item must pass. If an item fails, treat it as a bug and fix before release.

### Functional requirements (core features)

| # | What to check | How to check | Spec reference |
|---|----------------|--------------|----------------|
| 1 | Vault opens and file tree shows files | Open app → use "Open vault" or equivalent → select a folder that contains at least one .md file → the sidebar (or main area) shows the list of .md files. | FR-002 |
| 2 | File CRUD | Create a new file (e.g. "test.md") → it appears in the tree. Open it → type some text → Save → close and reopen the file → same text. Delete the file (with confirmation) → file disappears from tree and from disk. | FR-001 |
| 3 | List hierarchy | Open a file → add a line "- Item A" → add a line "  - Item B" (indented under A) → save. Reopen file or re-parse → structure shows two items with A as parent of B. | FR-003 |
| 4 | Tags | In a list item line add " #decision". Save. Run a tag query for "decision" (or open query view and filter by #decision) → that item appears in results. | FR-004 |
| 5a | Query by tag (basic) | With at least two list items in one or two files that have #decision, run query for tag "decision" → results show both items with file path and context. | FR-005 |
| 5b | Query by scope | Create a file with nested items; tag some under parent A and some under parent B. Run query for tag, then restrict scope to parent A → only items under A appear. | FR-005 (scope) |
| 5c | Query result navigation | In query results, select an item → file opens and item is visible or focused (scrolls to it or highlights it). | FR-006 |
| 6 | Full-text search | In any open file, ensure the word "ledger" appears. Open search → type "ledger" → run search → at least one result; click it → file opens at or near that word. | FR-008 |
| 7 | Undo/redo | In the editor type "a", "b", "c". Trigger Undo (e.g. Ctrl+Z) twice → "c" and "b" disappear. Trigger Redo twice → "b" and "c" reappear. | FR-009 |
| 8 | Session restore | Open a vault and a file. Close the app completely. Reopen the app → the same vault and file open (or the app shows the vault picker if the path was deleted). | FR-011 |
| 9 | Theme | Change theme to Dark (or Light). Close and reopen the app → theme is still Dark (or Light). | FR-012 |
| 10 | Logs local | Trigger any action that logs (e.g. open vault, or call log_from_frontend from frontend). Find the log file (path in research.md: app data dir + logs). Open the file → the log message appears. No logs sent to the internet. | FR-010 |
| 11 | Copy-paste | In the editor, type "test". Select all and Copy. Open Notepad (or another app) and Paste → "test" appears. Paste into the Ledger editor again → "test" appears. | FR-013 |

### Acceptance Scenarios (User Stories 1–4)

| US | Scenario | How to check | Status |
|----|----------|--------------|--------|
| US1.1 | Create new file with name → appears in tree, can open | Checklist row 2 (create file) | |
| US1.2 | Select file in tree → content shown in editor, editable | Checklist row 2 (open file, type text) | |
| US1.3 | Edit file → save → changes persist, file remains in tree | Checklist row 2 (save, reopen, same text) | |
| US1.4 | File exists → delete with confirmation → removed from tree and disk | Checklist row 2 (delete, file gone) | |
| US2.1 | File open → add top-level list item → appears as root node | Checklist row 3 (add "- Item A") | |
| US2.2 | List item exists → add child (indented) → child nested, parent-child preserved | Checklist row 3 (add "  - Item B") | |
| US2.3 | Multi-level hierarchy → view/edit → structure preserved, navigable | Checklist row 3 (reopen, structure shows nesting) | |
| US2.4 | Build hierarchy → save → restored on reopen | Checklist row 3 (full cycle) | |
| US3.1 | List item visible → add tag → tag stored and displayed | Checklist row 4 (add "#decision", save) | |
| US3.2 | Item has tags → edit/remove tag → change persisted | Manual: edit tag in a list item, save, reopen file → tag change persists | |
| US3.3 | Multiple items have same tag → query by tag → all items surfaced | Checklist row 5a (query "decision", see both items) | |
| US4.1 | App with tagged items → run query for tag → view shows all items with context | Checklist row 5a (query, see path and context) | |
| US4.2 | Query by tag → optionally restrict scope to node → only items under that node | Checklist row 5b (scope filter) | |
| US4.3 | Query results shown → select item → navigate to item in file | Checklist row 5c (query result navigation) | |

### Success Criteria (SC-001 … SC-006)

Measure time and action count where specified.

| SC | Criterion | How to check | Target | Status |
|----|-----------|--------------|--------|--------|
| SC-001 | Create file, add nested list items, save | Start timer → click "New file" → type name → add line "- Item A" → add line "  - Item B" → save. Stop timer. | <1 min | |
| SC-002 | Open file from tree and see content | Count actions: (1) click vault folder picker, (2) select folder, (3) see file tree, (4) click file → content appears. Verify ≤3 actions after tree is shown. | ≤3 actions | |
| SC-003 | Tag ≥5 list items, see in query in <30 seconds | Create/open file with ≥5 list items at different levels. Add tags: "#tag1 #tag2" etc to each. Start timer → click "Query" → select tag "tag1" → results show all 5 items. Stop timer. | <30 sec | |
| SC-004 | Narrow query by scope, only items under node appear | Create hierarchy: "Project A" with items under it and separate items outside. Query by scope: restrict to "Project A" → only items under A appear, not others. | Verifiable | |
| SC-005 | Close/reopen app, files/hierarchy/tags persist without data loss | Open vault and file with list items + tags. Close app (Cmd+Q or equivalent). Reopen app → same vault and file open, content unchanged. | No data loss | |
| SC-006 | Full-text search to match in ≤5 actions | Start timer → click "Search" → type query term → see results → click result → file opens at match. Count: up to 5 actions. Stop timer. | ≤5 actions | |

### Non-functional Requirements

| NFR | Requirement | How to check | Status |
|-----|-------------|--------------|--------|
| Accessibility | Primary flows doable via keyboard only | Open vault (keyboard only), open file (keyboard only), save (Ctrl+S), query (keyboard nav), search (keyboard nav). Mouse not required for core flows. | |
| Privacy | No cloud sync or telemetry; no network for user data | Open devtools Network tab (or use network monitor). Perform: open vault, create/edit/save file, query, search, close app. Inspect Network tab → no requests to external domains for user data. (Tauri framework requests are OK; user data must stay local.) | |

### Edge Cases

| Edge Case | How to check | Expected behavior | Status |
|-----------|--------------|-------------------|--------|
| Empty or new file | Create a file, don't add any list items. Open and save it. | App does not crash; file appears in tree; no errors shown. | |
| Malformed or mixed markdown | Open a file and add mixed content: some lines with "- item", some without bullets, some with invalid indentation (e.g. "   - item" with 3 spaces instead of 2). | Parser handles gracefully: valid list items are parsed, invalid lines shown as plain content. No crash. | |
| Very deep hierarchy | Create a file with deeply nested list items (10+ levels). Try to view, edit, save. | Navigation remains usable (scroll, expand/collapse if supported). No crash. Performance acceptable (edit/save <2s). | |
| Duplicate or similar tag names | Add tags "#decision" and "#decisions" to different items. Query for "#decision" → only exact matches appear. | Tag matching is exact; no auto-dedup. Results show only "#decision" items, not "#decisions". | |
| Empty query results | Query for a tag that does not exist in any file (e.g. "#nonexistent"). | Query returns empty result set with clear indication (e.g. "No results found" message). No error shown. | |
| Large number of files or items | Create vault with 100+ .md files or one file with 100+ list items. Open vault, open query, run search. | Tree and query remain responsive. Search results appear in <2 sec (per plan). No freezing or timeout. | |

---

## Validation section (how to use this checklist)

- **Purpose of validation**: Ensure the implementation matches the spec. The executor (or a reviewer) must run every row in the table above and mark it pass or fail.
- **If all pass**: The MVP meets the listed FRs for the scope of this plan. You can proceed to further testing or release.
- **If any fail**: Note the row number and the spec reference. Fix the implementation so that the check passes, then re-run that row. Do not mark as done until all rows pass.
- **Automated tests**: Where the plan or data model or contracts define tests (e.g. cargo test for vault, file CRUD, parse, query, search), those tests must also pass. The table above is the manual checklist; the automated tests are the continuous validation during development.

---

## Project layout (reference)

- `specs/001-developer-ledger/` — This folder. Contains execution-principles.md, plan.md, research.md, data-model.md, quickstart.md, contracts/, and (after /speckit.tasks) tasks.md.
- `src-tauri/` — Rust backend. Entry: src-tauri/src/lib.rs and main.rs; commands in src-tauri/src/commands/ (or similar).
- `src/` (or frontend folder from template) — TypeScript frontend. UI, editor, file tree, query view, search.
- `tests/` — Integration tests (e.g. Rust integration tests for vault, parse, query).

Do not create new top-level folders (e.g. "backend", "frontend" as separate roots) unless the plan is updated.
