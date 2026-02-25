# ADR-0001: Tauri 2 Desktop, Local-Only

## Status

Accepted

## Context

The application must run on the user's desktop machine (Windows, macOS, Linux), work with one vault at a time, and keep all data and logs local to the user's device. The product goals require Obsidian-like functionality: a native desktop experience, no cloud sync, and keyboard-first interaction. The team chose Tauri 2 as the runtime for building a desktop app with a Rust backend and a web-based frontend.

## Decision

We build the application with **Tauri 2** (version 2.x). The backend is **Rust** (edition 2021, minimum 1.75), and the frontend is **TypeScript** with Vite. The main entry point is `src-tauri/src/main.rs`, which calls `ledger_lib::run()`; `src-tauri/src/lib.rs` initializes the Tauri app, registers all commands, and manages `VaultState`. There is no network communication for user data or telemetry. All file I/O and state persists locally on the user's machine.

## Consequences

- **Deployment and distribution:** The app is shipped as a single executable binary per platform plus frontend assets bundled by Vite. No web server, no cloud infrastructure.
- **Performance and reliability:** Full control over the UI thread and system resources. No latency from network requests; all operations are local and instant.
- **Data privacy:** All user data stays on the user's disk. Session state (last vault, last file, theme) is stored in the app data directory (`app_data_dir()` from Tauri's path resolver). Logs go to stdout or a local file on the user's machine.
- **Maintenance and versioning:** Dependencies are locked in `src-tauri/Cargo.toml` and `package.json`; exact versions are documented in `specs/001-developer-ledger/research.md`. Using Tauri v2 only (no v1); v1 docs and migration guides are not applicable.
- **Constraints:** Desktop-only (no web, mobile, or real-time sync). Single user per instance. Multi-platform support requires testing on each OS; platform-specific Tauri prerequisites must be installed.

## References

- `src-tauri/src/main.rs`, `src-tauri/src/lib.rs`
- `src-tauri/Cargo.toml`
- `specs/001-developer-ledger/research.md` (technology choices)
- `specs/001-developer-ledger/plan.md` (Technical Context)
