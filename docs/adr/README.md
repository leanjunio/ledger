# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting the current state of the Ledger application. Each ADR describes an architecturally significant decision, its context, the chosen approach, and its consequences.

## Overview

These ADRs document the **current implementation** as of the development branch `001-developer-ledger`. They describe how the application is built now, not aspirations or future plans. For product requirements and API definitions, see `specs/001-developer-ledger/` (spec.md, plan.md, data-model.md, contracts).

## ADR Index

| # | Title | Summary |
|---|-------|---------|
| [0001](./0001-tauri-2-desktop-local-only.md) | Tauri 2 Desktop, Local-Only | Desktop app built with Tauri 2 (Rust backend + TypeScript frontend); single vault at a time; all data and logs local. |
| [0002](./0002-vault-in-memory-state.md) | Vault and In-Memory Backend State | Backend holds one active vault in memory (root path and file list); no database. |
| [0003](./0003-frontend-backend-tauri-commands.md) | Frontend–Backend Boundary via Tauri Commands | All frontend-backend communication via Tauri invoke(); contract defined in `specs/contracts/tauri-commands.md`. |
| [0004](./0004-data-model-persistence.md) | Data Model and Persistence | Files on disk as plain markdown; list items and tags computed on parse/query; session in app data dir JSON. |
| [0005](./0005-markdown-list-parsing.md) | Markdown List Parsing with Pulldown-Cmark | Uses pulldown-cmark 0.9 to parse lists; tags extracted via regex `#[\w-]+`; tree rebuilt on every parse. |
| [0006](./0006-query-and-search-no-index.md) | Query and Full-Text Search: No Index | Query and search scan files on demand; no persistent index; fuzzy search parameter accepted but not implemented; results capped at 100. |
| [0007](./0007-session-persistence.md) | Session Persistence in App Data | Session stored as JSON in app data directory (`config.json`); persists last vault, last file, theme. |
| [0008](./0008-frontend-vanilla-typescript.md) | Frontend Architecture: Vanilla TypeScript | Single-file vanilla TypeScript frontend (no framework); one `AppState` object; render functions update DOM; undo/redo not implemented. |
| [0009](./0009-path-validation-vault-containment.md) | Path Validation and Vault Containment | All file operations validated to stay under vault root; no `..`; canonicalization prevents traversal. |
| [0010](./0010-logging-tracing.md) | Logging via Tracing and Log-from-Frontend Bridge | Backend uses tracing/tracing-subscriber; logs go to stdout; frontend bridges events via `log_from_frontend` command; file logging not yet implemented. |

## Reading an ADR

Each ADR has five main sections:

- **Status:** Accepted (current decision in use).
- **Context:** The problem or requirement that prompted the decision.
- **Decision:** What was chosen and how it works (references to code).
- **Consequences:** Tradeoffs, benefits, limitations, and future considerations.
- **References:** Links to code and specs for verification.

Use an ADR to understand why a design choice was made and what its implications are. Read the code references to see the implementation.

## Constitution and Writing Rules

All ADRs are written following the project's constitution (.specify/memory/constitution.md) and writing validation rules (.cursor/rules/specify-rules.mdc):

- **Principle I (Code quality):** ADRs are readable, consistent, and clearly contracted.
- **Principle V (Technical decision governance):** Decisions are documented with context and rationale; exceptions are noted.
- **Writing rules:** Short scannable sentences; one idea per sentence; active voice; no banned words or phrases; no LLM patterns; Oxford commas; sentence-case headings.

## Gaps and Future Work

- **Fuzzy search:** The `fuzzy` parameter in `search_full_text` is accepted but not used. The fuzzy-matcher crate is available; implementation is a future enhancement.
- **Undo/redo in editor:** The specification lists undo/redo (FR-009); the current frontend uses a native textarea which does not expose a shared undo history. A future version could implement a history stack.
- **Theme persistence in frontend:** The backend supports theme in session; the frontend does not currently read or write it. Wiring this is a future task.
- **Log file output:** Research.md describes writing logs to a file in the app data directory. The current code only outputs to stdout. Adding a file layer to tracing-subscriber is a future enhancement.

## Related Documents

- `specs/001-developer-ledger/spec.md` – Product specification and user stories.
- `specs/001-developer-ledger/plan.md` – Implementation plan with phased approach.
- `specs/001-developer-ledger/data-model.md` – Entity definitions and validation.
- `specs/001-developer-ledger/contracts/tauri-commands.md` – Backend API contract.
- `specs/001-developer-ledger/research.md` – Technology choices and rationale.
- `.specify/memory/constitution.md` – Project governance and principles.
