# E2E tests

Uses WebdriverIO with [tauri-driver](https://crates.io/crates/tauri-driver).

## Prerequisites

- Install tauri-driver: `cargo install tauri-driver --locked`
- **Platform:** WebDriver is supported on **Linux** and **Windows** only (not macOS).

## Run

From project root:

```bash
npm run test:e2e
```

Tests inject a fixture root via `MARKDOWN_APP_ROOT` so the app loads without using the folder picker.
