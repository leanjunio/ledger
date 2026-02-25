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

After implementing all plan phases, run through this list. Each item must pass. If an item fails, treat it as a bug and fix before release.

| # | What to check | How to check | Spec reference |
|---|----------------|--------------|----------------|
| 1 | Vault opens and file tree shows files | Open app → use "Open vault" or equivalent → select a folder that contains at least one .md file → the sidebar (or main area) shows the list of .md files. | FR-002 |
| 2 | File CRUD | Create a new file (e.g. "test.md") → it appears in the tree. Open it → type some text → Save → close and reopen the file → same text. Delete the file (with confirmation) → file disappears from tree and from disk. | FR-001 |
| 3 | List hierarchy | Open a file → add a line "- Item A" → add a line "  - Item B" (indented under A) → save. Reopen file or re-parse → structure shows two items with A as parent of B. | FR-003 |
| 4 | Tags | In a list item line add " #decision". Save. Run a tag query for "decision" (or open query view and filter by #decision) → that item appears in results. | FR-004 |
| 5 | Query by tag | With at least two list items in one or two files that have #decision, run query for tag "decision" → results show both items with file path and context. Click one result → file opens (and ideally scrolls to that item). | FR-005, FR-006 |
| 6 | Full-text search | In any open file, ensure the word "ledger" appears. Open search → type "ledger" → run search → at least one result; click it → file opens at or near that word. | FR-008 |
| 7 | Undo/redo | In the editor type "a", "b", "c". Trigger Undo (e.g. Ctrl+Z) twice → "c" and "b" disappear. Trigger Redo twice → "b" and "c" reappear. | FR-009 |
| 8 | Session restore | Open a vault and a file. Close the app completely. Reopen the app → the same vault and file open (or the app shows the vault picker if the path was deleted). | FR-011 |
| 9 | Theme | Change theme to Dark (or Light). Close and reopen the app → theme is still Dark (or Light). | FR-012 |
| 10 | Logs local | Trigger any action that logs (e.g. open vault, or call log_from_frontend from frontend). Find the log file (path in research.md: app data dir + logs). Open the file → the log message appears. No logs sent to the internet. | FR-010 |
| 11 | Copy-paste | In the editor, type "test". Select all and Copy. Open Notepad (or another app) and Paste → "test" appears. Paste into the Ledger editor again → "test" appears. | FR-013 |

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
