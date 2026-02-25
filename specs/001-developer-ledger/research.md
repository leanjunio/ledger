# Research: Developer Ledger MVP

**Branch**: `001-developer-ledger` | **Date**: 2025-02-24  
**Executor**: Read [execution-principles.md](./execution-principles.md) first. This document locks in exact technology choices so you do not substitute other libraries or versions without updating this file.

---

## Purpose

Research answers "which exact library or version do we use?" for every technical choice that the implementation plan depends on. The executor must **not** guess: if the plan says "use the markdown parser," the executor looks here and uses the **exact** crate name and version range below. When looking up how to use a library, use **only** the official docs for that exact crate/package and version. Do **not** use Tauri v1 docs, random blog posts, or Stack Overflow as the source of truth. See execution-principles.md "Wrong sources."

---

## Goals (when research is complete)

- [ ] Every "TBD" or "or similar" in the plan or this file is replaced with one concrete choice and a version (or range).
- [ ] Each section below has: Decision (what we use), Version (exact or range), Where to read (official link), and What NOT to use.
- [ ] An executor who follows this file can implement without choosing between multiple equivalent options.

---

## Wrong sources (do not use for implementation decisions)

- **Tauri v1** documentation (v1.tauri.app or any guide that says "Tauri 1.x"). This project is **Tauri v2** only. Using v1 APIs will cause build or runtime errors.
- **Random tutorials or blog posts** for "how to parse markdown in Rust" or "how to do fuzzy search." They may use different crates or old APIs. Use only the official docs for the crates listed in this file.
- **Other note-taking apps** (Obsidian, Notion, etc.) as the source of truth for behavior. The only source of truth for *what* Ledger does is spec.md. "Obsidian-like" in the spec means only what is written in the spec (e.g. file tree, search across files); do not copy Obsidian's internal design.
- **AI-generated code** that is not checked line-by-line against this research, the data model, and the contracts. If you use generated code, verify every function and type against contracts/tauri-commands.md and data-model.md.

**Authorized sources**: Official docs for the exact crate/package and version below. Tauri: https://v2.tauri.app/ only. Rust: https://doc.rust-lang.org/ and https://docs.rs/ for the crate name and version in this file.

---

## 1. Markdown parsing (list hierarchy and tags)

**Purpose**: We need to turn the raw text of a markdown file into a list of "list items" (bullets) with depth, text, and tags. The executor must use one specific Rust crate so behavior is consistent.

**Decision**: Use the **pulldown-cmark** crate. It parses markdown and emits events (e.g. "start list," "list item," "text"). We walk these events to build a tree of list items. We do **not** use a different markdown crate (e.g. comrak) unless this file is updated.

**Version**: `pulldown-cmark` version **0.9** or the latest 0.9.x on https://docs.rs . Check Cargo.toml: use the same major.minor so the API matches the docs.

**What we use it for**: (1) Detect list items (lines starting with `-` or `*`) and their indentation level (depth). (2) Get the raw text of each list item line. (3) From that text, extract tags by a regex or string scan: pattern `#[\w-]+` (hash followed by word characters or hyphens). Tags are stored without the `#` in the data model (e.g. `#decision` → tag name `decision`).

**Where to read**: https://docs.rs/pulldown-cmark/0.9.0 (or your exact version). Use the "Event" and "Tag" types and the "Parser" to iterate over events. Do not use a different markdown library’s API and assume it’s the same.

**What NOT to use**: comrak (different API and heavier); custom regex-only parsing for the whole file (brittle for nested lists). Do not assume CommonMark or GitHub Flavored Markdown rules beyond what the spec says (lists and inline #tags).

**Validation**: After implementation, a unit test: input string with two root list items and one nested item under the first must produce three nodes with correct depth and parent/child. A line containing `#decision` and `#ci` must produce tags `["decision", "ci"]`.

---

## 2. Full-text and fuzzy search

**Purpose**: User can type a search string and find it (or a fuzzy match) in file contents across the vault. The executor needs one concrete way to do substring and fuzzy matching in Rust.

**Decision**: For **substring** search: use Rust standard library or a simple loop over lines (no extra crate required). For **fuzzy** matching (e.g. "fnd" matches "find"): use the **fuzzy-matcher** crate (or **skim** if you need a different API; see below). We do **not** build a persistent search index for MVP; we scan file contents on each search. Limit the number of results (e.g. 100 or 200) so the UI stays responsive.

**Version**: **fuzzy-matcher** crate, version **0.1** or latest 0.1.x on https://docs.rs . If that crate is unmaintained at implementation time, use **skim** (skim crate) and document the switch here.

**What we use it for**: (1) Substring: find all lines (or byte ranges) where `query` appears in file content. (2) Fuzzy: score each line with the fuzzy matcher; return lines above a score threshold, sorted by score. Return type must match contracts/tauri-commands.md: SearchMatch with file_path, snippet_or_line, and optional start_offset/end_offset.

**Where to read**: https://docs.rs/fuzzy-matcher/ (or skim). Use the exact function names and types from the docs for the version in Cargo.toml.

**What NOT to use**: Tantivy or other full-text search engines for MVP (overkill). Do not use a different fuzzy crate without updating this section and the plan.

**Validation**: Integration test: create a file with the line "hello world"; search "hello" → at least one match with that file path and a snippet containing "hello". Fuzzy: search "hlowrld" or similar may match "hello world" if the crate supports it; document expected behavior in a test.

---

## 3. Tag query (filter list items by tag and scope)

**Purpose**: No separate database. We get "all list items with tag X" by parsing file contents and collecting nodes that have that tag. The executor must not add a separate tag index or database unless the plan and this file are updated.

**Decision**: On each query, (1) get the list of file paths (all vault files or the `paths` argument). (2) For each path, read file content (or use in-memory content if the frontend already has it). (3) Parse content with the markdown parser (same as section 1). (4) Walk the resulting tree nodes and keep only those whose `tags` array contains at least one of the requested tag names. (5) If scope_node_id is set, keep only nodes that are descendants of that node (parent_id chain). (6) Build QueryResultItem for each: file_path, parent_path (e.g. "Project A > Task 1"), node. Return the list. No caching or index for MVP.

**Version**: No extra crate; use the same parser as section 1 and standard Rust data structures.

**Where to read**: data-model.md for Query and View; contracts/tauri-commands.md for query_by_tag signature and return type.

**What NOT to use**: A separate SQLite or tag database. A persistent search index for tags. Do not assume tags are stored anywhere except inline in list item text.

**Validation**: Two files, each with one list item containing `#decision`. query_by_tag(["decision"]) must return two items. If scope is set to a node that has no descendants with that tag, result must be empty or only those under that node per data-model.

---

## 4. Undo / redo

**Purpose**: User can undo and redo edits in the current file. The spec says "match Obsidian-like behavior"; we interpret that as a per-file history stack, no round-trip to the backend on every keystroke.

**Decision**: Implement undo/redo **only in the frontend** (TypeScript). Keep a history stack: e.g. array of document states (full text or diffs). On each user edit, push the previous state onto the stack, then apply the edit. Undo: pop and restore previous state. Redo: keep a "redo" stack when user undoes; redo pushes current state and restores from redo stack. When the user saves, send content to Rust via `write_file`; we do not require undo to work across save (i.e. after save, we may clear or keep history; document the choice in the frontend). When the user switches to another file, clear or keep history per file; document the choice.

**Version**: No specific library required. If the frontend uses an editor component that already has undo/redo, use it and document which component. Otherwise implement with arrays in memory.

**Where to read**: spec.md FR-009; plan.md Phase 7. No external "Obsidian" implementation guide.

**What NOT to use**: Sending every keystroke to Rust for undo (adds latency and complexity). Assuming the backend must implement undo (spec and plan say frontend).

**Validation**: Manual: type "a", "b", "c" → undo → "c" disappears → undo → "b" disappears. Redo twice → "b" and "c" reappear. Save → content on disk matches. No automated test required if manual test is documented.

---

## 5. Logging (industry-standard, local only)

**Purpose**: The app must write logs in a standard format and store them only on the user’s machine (spec FR-010). The executor needs one logging library and one log file location.

**Decision**: Use the **tracing** crate in Rust. Use **tracing-subscriber** to format and write logs. Write to (1) stdout (for dev) and (2) a log file in the user’s app data directory. Log file path: follow OS conventions. Example: on macOS/Linux, `$HOME/.config/ledger/logs/` or the path returned by Tauri’s `app_data_dir` (see Tauri v2 docs for app data directory). File name can be `app.log` or include the date. Format: structured (e.g. JSON lines or key-value) or human-readable; document the format in a comment. Frontend errors: send to Rust via a Tauri command (e.g. `log_from_frontend(level, message, payload?)`); in the command handler, emit a tracing span or event so it goes to the same file. No remote logging or telemetry.

**Version**: **tracing** and **tracing-subscriber**, latest stable on https://docs.rs (e.g. tracing 0.1.x, tracing-subscriber 0.3.x). Check Cargo.toml for exact versions.

**Where to read**: https://docs.rs/tracing/ and https://docs.rs/tracing-subscriber/ . Tauri v2 docs for "app data directory" or "path resolver."

**What NOT to use**: log crate only (tracing is the standard for structured logs). Sending logs to a remote server or third-party service. Using a different path than the app data directory (so logs stay on the user’s device).

**Validation**: Run the app, trigger one action that logs something, then open the log file under the app data dir and confirm the message appears. Call `log_from_frontend("error", "test")` from the frontend and confirm an entry appears in the same log file.

---

## 6. Frontend stack (TypeScript and UI)

**Purpose**: The frontend is the UI the user sees (file tree, editor, query panel, search). We need a single, explicit choice so the executor does not pick a random framework.

**Decision**: **TypeScript** for all frontend code. Build tool: **Vite** (comes with Tauri v2 templates). UI: use the **default Tauri v2 template** choice when creating the project (e.g. vanilla TypeScript + Vite, or the template’s default). Do not add a heavy framework (e.g. React, Angular) unless the plan is updated; prefer vanilla or a lightweight option (e.g. Svelte or Preact) if the template offers it. The exact template is the one used in plan Phase 1 (scaffold); document in quickstart.md which template was used (e.g. "create-tauri-app with TypeScript-Vite").

**Version**: TypeScript: target ES2020 or higher (in tsconfig.json). Node: LTS 18+. Vite and Tauri versions come from the Tauri create project; do not downgrade Tauri to v1.

**Where to read**: https://v2.tauri.app/start/create-project/ for the exact create command and template options. TypeScript: https://www.typescriptlang.org/docs/ for the version in use.

**What NOT to use**: Tauri v1 create command or v1 template. A frontend framework not listed in this section without updating the section. Plain JavaScript instead of TypeScript (spec says TypeScript).

**Validation**: After scaffold, `npm run tauri dev` opens a window and the frontend loads. No console errors about missing modules. TypeScript compiles without errors.

---

## 7. Session state (last vault, last file, theme)

**Purpose**: The app must remember the last opened vault and file (and theme) so on next launch it can reopen them (spec FR-011, FR-012). The executor needs one file format and one location.

**Decision**: Store a single **JSON file** in the app data directory (same base path as logs; e.g. `$HOME/.config/ledger/` or Tauri’s app data dir). File name: `config.json` or `session.json`. Contents: `{ "last_vault_path": "/path/to/vault", "last_file_path": "relative/or/full/path/to/file.md", "theme": "light" | "dark" | "system" }`. On app start, read this file; if paths exist and are valid (vault dir exists, file exists), open that vault and that file. When vault or file changes (or on exit), write the file. Use Tauri’s path resolver for the app data directory so it works on Windows, macOS, and Linux.

**Version**: No extra crate; use Rust std::fs and serde_json (likely already in the project for Tauri). If not, add serde_json and use it only for this file.

**Where to read**: Tauri v2 docs: app data directory / path resolver. serde_json: https://docs.rs/serde_json/ for reading and writing JSON.

**What NOT to use**: Storing session in a database. Storing session inside the vault folder (session is app state, not user data). Using a different path than the app data directory.

**Validation**: Open a vault and a file; close the app; reopen the app; the same vault and file must open (or the picker if the path was deleted). Change theme; close and reopen; theme must persist.

---

## Summary table (quick reference for executor)

| Topic        | Crate / choice      | Version   | Where to read |
|-------------|---------------------|-----------|----------------|
| Markdown    | pulldown-cmark      | 0.9.x     | docs.rs/pulldown-cmark |
| Fuzzy search| fuzzy-matcher       | 0.1.x     | docs.rs/fuzzy-matcher |
| Tag query   | (no extra crate)    | —         | data-model.md, contracts |
| Undo/redo   | (frontend only)     | —         | plan.md Phase 7 |
| Logging     | tracing, tracing-subscriber | 0.1.x / 0.3.x | docs.rs/tracing |
| Frontend    | TypeScript, Vite, Tauri template | from Tauri create | v2.tauri.app |
| Session     | JSON in app data dir| —         | Tauri path resolver, serde_json |

**Validation for the whole research doc**: Before starting implementation, ensure there are zero occurrences of "TBD" or "or similar" in this file. For each crate, confirm the version exists on docs.rs and add it to Cargo.toml when implementing.
