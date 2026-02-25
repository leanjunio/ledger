# Plan: No cloud sync or telemetry (NFR-Privacy)

## Purpose

Satisfies NFR-Privacy.

## Goals

- No cloud sync or telemetry; no network use for user data.
- All user data stays local; inspectable via devtools Network tab.
- Quickstart NFR-Privacy used to verify no external requests for data.

## Implementation

### Elements

- **Data boundary (backend)**: No cloud sync or network calls for user data; all data stays local.
- **Frontend no-telemetry**: No analytics or telemetry so no user data leaves the app.

### Tasks

1. Add Quickstart NFR-Privacy: inspect devtools Network tab; verify no external requests for data.
2. Ensure backend and frontend do not initiate sync or telemetry; no third-party SDKs that send user data.
3. Document that all persistence is local (files on disk, optional local session state).

## Validation

Manual; Quickstart NFR-Privacy.
