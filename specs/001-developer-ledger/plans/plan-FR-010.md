# Plan: Logging (FR-010)

## Purpose

Satisfies FR-010.

## Goals

- Application and error logs are formatted per industry-standard expectations.
- Logs are written to the user's local device only (no remote logging).

## Implementation

### Elements

- **Logging (backend)**: Configure tracing, format logs per industry standards, and write logs to local file only.
- **log_from_frontend command**: Accept frontend log events and emit them to the same local log.

### Tasks

1. Manual check: confirm log file exists and contains messages (Quickstart row 10).
2. In Rust backend, configure tracing (or equivalent) with industry-standard format; write to a file in app data dir only.
3. Add Tauri command `log_from_frontend(level, message, payload?)` that emits to the same local log.
4. Ensure no logs are sent over the network.

## Validation

Manual check; Quickstart row 10.
