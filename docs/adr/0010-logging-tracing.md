# ADR-0010: Logging via Tracing and Log-from-Frontend Bridge

## Status

Accepted

## Context

The specification requires logs to be written in an industry-standard format and stored locally on the user's machine (FR-010). Logs must be available for troubleshooting and must not be sent to external servers. Both the backend (Rust) and frontend (TypeScript) may generate events that need to be logged in one unified place.

## Decision

The backend uses the **tracing** and **tracing-subscriber** crates to manage logging. The subscriber is initialized in `src-tauri/src/lib.rs`:

```rust
tracing_subscriber::registry()
    .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
    .with(fmt::layer())
    .init();
```

This configuration sets the default log level to "info" (overridable via `RUST_LOG` environment variable) and outputs logs in text format to **stdout**. No file layer is currently configured.

Frontend events are bridged to the backend via the `log_from_frontend` command. The frontend calls `invoke("log_from_frontend", { level, message, payload })`, and the backend translates the level string ("error", "warn", "info", etc.) to a `tracing::Level` and emits an event. Those events go to the same subscriber (stdout).

## Consequences

- **Unified logging:** Both backend and frontend events are emitted via tracing and go to stdout, making it easy to correlate events.
- **Standard format:** Tracing outputs structured logs; the format is text with key-value pairs (via `fmt::layer()`). This matches industry expectations.
- **Stdout-only in current code:** Logs go to stdout, not to a file. This is suitable for development and for containers (which capture stdout). For local desktop use, users do not see logs unless they run the app from a terminal or redirect stdout to a file.
- **File logging not implemented:** The research.md document describes writing logs to a file in the app data directory; that feature is not yet implemented. To persist logs, a file layer would need to be added to the subscriber (e.g., using `tracing-appender`).
- **Environment control:** The log level can be controlled via `RUST_LOG` (e.g., `RUST_LOG=debug`). This is useful for troubleshooting.
- **No telemetry:** No logs are sent to external servers. All logs stay on the user's machine.

## References

- `src-tauri/src/lib.rs` (tracing subscriber initialization)
- `src-tauri/src/commands/log.rs` (log_from_frontend command)
- `src/main.ts` (frontend log invocations, if any)
- Tracing crate: https://docs.rs/tracing/
- Tracing-subscriber crate: https://docs.rs/tracing-subscriber/
- `specs/001-developer-ledger/research.md` (logging design)
