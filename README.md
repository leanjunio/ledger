# Ledger

Desktop app for a markdown vault: open a folder, edit files in a tree, parse list hierarchy and tags, query by tag, and full-text search. Data stays on your machine.

## Prerequisites

- **Rust** 1.75+ ([rustup.rs](https://rustup.rs))
- **Node.js** 18+ LTS
- **Tauri v2 system deps**: [v2.tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/) for your OS

## Run

```bash
npm install
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

## Tests

```bash
cargo test
```

(Run from repo root or `src-tauri/`.)

## Tech stack

| Layer   | Stack |
|---------|--------|
| Desktop | Tauri 2 |
| Backend | Rust (edition 2021); `pulldown-cmark`, `fuzzy-matcher`, `tracing`, `serde_json`, `tauri-plugin-dialog`, `regex` |
| Frontend | TypeScript, Vite; `@tauri-apps/api`, `@tauri-apps/plugin-dialog` |

## Project layout

- `src/` — Frontend (UI, file tree, editor, query, search)
- `src-tauri/` — Rust backend (commands, markdown parser, vault/session state)
- `src-tauri/tests/` — Integration tests
- `specs/001-developer-ledger/` — Spec, plan, tasks, contracts
