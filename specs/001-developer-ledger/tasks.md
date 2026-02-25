# Tasks: Developer Ledger MVP

**Input**: Design documents from `specs/001-developer-ledger/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tauri-commands.md, quickstart.md

**Tests**: Included per constitution (Testing standards) and plan (TDD/spec-driven validation). Each phase that adds backend logic has a corresponding test task; run tests before marking the phase complete.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently. Paths follow plan.md: Rust in `src-tauri/`, frontend in `src/`, integration tests in `tests/`.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story from spec.md (US1=File and tree, US2=Hierarchy, US3=Tagging, US4=Query)
- Include exact file paths in descriptions

## Path Conventions

- **Backend (Rust)**: `src-tauri/src/` — commands in `src-tauri/src/commands/`, fs in `src-tauri/src/fs/`, markdown in `src-tauri/src/markdown/`, search in `src-tauri/src/search/`
- **Frontend**: `src/` (or frontend folder from Tauri template)
- **Tests**: `tests/integration/` for Rust integration tests; contract validation via same tests (command shape)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and research lock-in so the executor does not guess libraries or versions.

- [ ] T001 Resolve all TBDs in research.md: replace every "TBD" or "or similar" with exact crate/package name and version; add "Wrong sources" reminder at top of research.md per plan Phase 0
- [ ] T002 Scaffold Tauri project from repo root: run official Tauri v2 create flow (Rust + TypeScript/Vite), or confirm existing src-tauri/ and src/ exist; ensure npm run tauri dev opens a window (see plan Phase 1)
- [ ] T003 Add Rust dependencies to src-tauri/Cargo.toml per research.md: pulldown-cmark (0.9.x), fuzzy-matcher (0.1.x), tracing, tracing-subscriber, serde_json if not present
- [ ] T004 [P] Configure Rust linting and formatting in src-tauri/ (e.g. rustfmt.toml or CI); run cargo fmt and cargo clippy from src-tauri/
- [ ] T005 [P] Configure frontend lint/format in src/ (e.g. ESLint, Prettier) if the Tauri template did not; ensure npm run build succeeds from repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Vault open and session so any user story can assume "a vault is open" and "session can be read/saved." MUST complete before user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Implement open_vault(path) in src-tauri/src/commands/ (or commands/vault.rs): validate path is directory, collect all .md paths under it, return { root_path, file_paths }; register command in src-tauri/src/lib.rs
- [ ] T007 Implement get_session and save_session in src-tauri/src/commands/ (or commands/session.rs): read/write JSON config in app data dir per research.md; use Tauri path resolver for app data path; register both commands
- [ ] T008 Store current vault root_path and file_paths in backend state (e.g. AppState in src-tauri/src/lib.rs or managed state) so list_files and file CRUD can use it
- [ ] T009 Add integration test in tests/integration/: create temp dir with two .md files, call open_vault(temp_dir), assert root_path and file_paths length 2; run cargo test
- [ ] T010 In frontend src/: add UI to trigger "Open vault" (e.g. menu or button), use Tauri dialog or invoke to get folder path, call invoke('open_vault', { path }), store root_path and file_paths in frontend state
- [ ] T011 In frontend src/: render file tree (sidebar or main area) from file_paths; on file click call read_file (implement stub or T012) and show content in editor area; ensure "last opened file or empty screen" works per FR-011 (load session on startup, open last vault/file if valid)

**Checkpoint**: Open vault → file list appears; session save/load works. Run cargo test; manual: open vault, see files.

---

## Phase 3: User Story 1 - File and tree editor basics (Priority: P1) 🎯 MVP

**Goal**: User can create, open, edit, save, and delete markdown files and see a tree of files on the side (FR-001, FR-002, FR-007).

**Independent Test**: Create a new file, add content, save; file appears in tree; open it again and edit. Delete a file with confirmation; it disappears from tree and disk.

### Tests for User Story 1

- [ ] T012 [P] [US1] Add integration test in tests/integration/test_file_crud.rs (or .ts): create_file("t.md"), read_file("t.md") returns empty string; write_file("t.md", "hi"), read_file("t.md") returns "hi"; delete_file("t.md"), read_file("t.md") errors; run cargo test

### Implementation for User Story 1

- [ ] T013 Implement list_files in src-tauri/src/commands/: return current vault's file_paths from state; register command
- [ ] T014 Implement read_file(path) in src-tauri/src/commands/: validate path under vault root, read file, return content string; register command
- [ ] T015 Implement write_file(path, content) in src-tauri/src/commands/: validate path under vault root, write content; register command
- [ ] T016 Implement create_file(path) in src-tauri/src/commands/: create empty file at path under vault; register command
- [ ] T017 Implement delete_file(path) in src-tauri/src/commands/: validate path under vault root, delete file; register command
- [ ] T018 [US1] In frontend src/: wire file tree so clicking a path calls invoke('read_file', { path }) and displays content in editor; add Save button that calls invoke('write_file', { path, content }) with current editor content
- [ ] T019 [US1] In frontend src/: add Create file (e.g. prompt for name), call create_file, refresh file list (list_files or re-open vault); add Delete file with confirmation, call delete_file, refresh file list
- [ ] T020 [US1] Run cargo test; manually verify create/open/edit/save/delete and tree update (quickstart validation rows 1–2)

**Checkpoint**: User Story 1 complete. File CRUD and tree work; tests pass.

---

## Phase 4: User Story 2 - Hierarchical list structure (Priority: P2)

**Goal**: Single markdown file is parsed into a hierarchy of list items (depth, parent/child); structure is preserved and navigable (FR-003).

**Independent Test**: Open a file, add "- Item A" and "  - Item B"; save; reopen or re-parse; hierarchy shows two items with A as parent of B.

### Tests for User Story 2

- [ ] T021 [P] [US2] Add unit test in src-tauri/src/markdown/ or tests/: parse content "- a\n  - b" → two nodes, depth 0 and 1, second's parent_id equals first's id; parse line with "#decision" → one node with tags containing "decision"; run cargo test

### Implementation for User Story 2

- [ ] T022 [US2] Add markdown parsing module in src-tauri/src/markdown/mod.rs: use pulldown-cmark per research.md, walk events to build list of tree nodes (id, depth, text, tags, parent_id, children_ids); extract tags from text with pattern #[\w-]+
- [ ] T023 [US2] Implement parse_file(path, content) command in src-tauri/src/commands/: call parser with content, return { nodes: TreeNode[] }; register command; ensure TreeNode shape matches contracts/tauri-commands.md
- [ ] T024 [US2] In frontend src/: when a file is open, call invoke('parse_file', { path, content }) with current editor content; render outline or hierarchy (e.g. indent by depth, expand/collapse); on save, write back raw editor content (do not regenerate markdown from nodes)
- [ ] T025 [US2] Run cargo test; manually verify nested list and structure preserved (quickstart validation row 3)

**Checkpoint**: User Story 2 complete. List hierarchy parses and displays; save preserves structure.

---

## Phase 5: User Story 3 - Tagging list items (Priority: P3)

**Goal**: User can attach tags (e.g. #decision) to list items; tags are stored inline and displayed (FR-004).

**Independent Test**: Add #decision to a list item line, save; tag appears in UI; reopen file, tag still in text and in parsed nodes.

### Tests for User Story 3

- [ ] T026 [P] [US3] Add test: parse "- Do it #decision #ci" → one node with tags ["decision","ci"]; run cargo test

### Implementation for User Story 3

- [ ] T027 [US3] Ensure parser in src-tauri/src/markdown/ extracts tags into node.tags (already in T022; if not, add); no separate tag storage
- [ ] T028 [US3] In frontend src/: display tags in hierarchy/outline (e.g. badge or inline next to list item text); ensure editing list item text (including #tag) persists on save via write_file
- [ ] T029 [US3] Run cargo test; manually verify add/edit/remove tag in list item and persistence (quickstart validation row 4)

**Checkpoint**: User Story 3 complete. Tags visible and persisted in file content.

---

## Phase 6: User Story 4 - Query and filtered views (Priority: P4)

**Goal**: User can query by tag (and optional scope), see results with context, and navigate to item; user can full-text search across vault and navigate to match (FR-005, FR-006, FR-008).

**Independent Test**: Two files with items tagged #decision; query "decision" → both appear; click one → file opens. Search "hello" in a file that contains it → match shown; click → file opens.

### Tests for User Story 4

- [ ] T030 [P] [US4] Add integration test: create two files each with one list item containing #decision; invoke query_by_tag(["decision"]) → two QueryResultItem; run cargo test
- [ ] T031 [P] [US4] Add integration test: write_file("x.md", "hello world"); search_full_text("hello") → at least one SearchMatch with file_path containing x.md and snippet containing "hello"; run cargo test

### Implementation for User Story 4

- [ ] T032 [US4] Implement query_by_tag(tag_names, scope_node_id?, paths?) in src-tauri/src/commands/ (or search/): for each file in vault (or paths), read content, parse to nodes, filter nodes with at least one tag in tag_names; if scope set, filter to descendants; return QueryResultItem[] (file_path, parent_path, node); register command
- [ ] T033 [US4] Implement search_full_text(query, paths?, fuzzy?) in src-tauri/src/commands/ (or search/): scan file contents, substring match (and fuzzy if true per research.md); return SearchMatch[]; limit results (e.g. 100); register command
- [ ] T034 [US4] In frontend src/: add Query view (input for tag, optional scope); on submit call query_by_tag; display results (file_path, parent_path, node text); on item click call read_file(file_path) and open in editor, optionally scroll/focus to node
- [ ] T035 [US4] In frontend src/: add Search UI (input for text, optional fuzzy); on submit call search_full_text; display matches; on click open file (and optional offset); run cargo test; manually verify query and search (quickstart validation rows 5–6)

**Checkpoint**: User Story 4 complete. Query by tag and full-text search work; navigate to item.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Undo/redo, session restore, theme, logging, copy-paste per FR-009, FR-010, FR-011, FR-012, FR-013.

- [ ] T036 Implement undo/redo in frontend src/: history stack (e.g. array of document states or diffs) for current file; Undo/Redo buttons or shortcuts; clear or keep history on file close per plan; no backend call per keystroke
- [ ] T037 Ensure session restore on startup: load get_session; if last_vault_path and last_file_path valid, call open_vault and read_file; else show empty screen or vault picker (FR-011)
- [ ] T038 [P] Add theme UI in frontend src/: light/dark/system; store in save_session; load from get_session on startup; apply CSS/class to root (FR-012)
- [ ] T039 Configure tracing in src-tauri/src/main.rs or lib.rs: tracing-subscriber, log file in app data dir per research.md; add log_from_frontend(level, message, payload?) command that emits tracing event; ensure no remote logging (FR-010)
- [ ] T040 Ensure editor in frontend src/ allows copy and paste (no preventDefault on paste/copy); verify with quickstart validation row 11 (FR-013)
- [ ] T041 Run full quickstart.md validation checklist (rows 1–11); fix any failing row; run cargo test

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start first.
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2 — MVP.
- **Phase 4 (US2)**: Depends on Phase 2; can start after Phase 3 (uses read_file/write_file).
- **Phase 5 (US3)**: Depends on Phase 4 (parser with tags).
- **Phase 6 (US4)**: Depends on Phase 2 and parser (Phase 4); uses file_paths and parse.
- **Phase 7 (Polish)**: Depends on Phase 2 for session; rest can follow Phase 6.

### User Story Dependencies

- **US1 (P1)**: After Foundational only. No dependency on US2–US4.
- **US2 (P2)**: After Foundational and US1 (needs open file and editor). Parser can be built in parallel with frontend hierarchy UI once commands exist.
- **US3 (P3)**: After US2 (tags are part of parser output and display).
- **US4 (P4)**: After US2/US3 (query needs parsed nodes with tags); search only needs file read.

### Within Each User Story

- Test task(s) before or with implementation; tests must pass before checkpoint.
- Backend commands before frontend that calls them.
- Run cargo test after backend tasks; manual check after frontend tasks.

### Parallel Opportunities

- T004, T005 (Setup lint/format) can run in parallel.
- T012, T021, T026, T030, T031 (test tasks) can be written in parallel with implementation in same phase.
- T022 (parser) and T024 (frontend outline) can be done in parallel after T023 (parse_file command) exists.
- T036, T038, T039, T040 (Polish) can be done in parallel except T037 (session) which ties to T007/T011.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete Phase 3 (US1 — File and tree).
4. **STOP and VALIDATE**: quickstart rows 1–2; cargo test.
5. Deploy/demo if ready.

### Incremental Delivery

1. Setup + Foundational → vault and file list work.
2. US1 → File CRUD and tree (MVP).
3. US2 → Hierarchy parse and display.
4. US3 → Tags display and persist.
5. US4 → Query and search.
6. Polish → Undo, theme, logging, copy-paste.
7. Run full quickstart validation.

### Parallel Team Strategy

- One developer: follow phase order.
- Multiple: after Foundational, Dev A = US1, Dev B = US2 (parser + outline), then US3/US4 and Polish.

---

## Notes

- Every task has a checkbox, task ID (T001–T041), and [Story] label where applicable; file paths are in the description.
- [P] = parallelizable within the phase (different files or test files).
- Validate after each phase using plan Validation and quickstart checklist.
- Constitution: tests required; run cargo test and ensure tests fail before implementation then pass after where TDD is applied.
