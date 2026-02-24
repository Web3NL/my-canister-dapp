# Changelog

## [Unreleased]

### Added

- CLI binary: `canister-dapp-test <wasm-path>` runs the full acceptance suite against any dapp WASM.
- HTTP response header validation: Content-Type for HTML/JS/CSS, Content-Security-Policy for dashboard HTML.
- SPA fallback test: unknown paths serve index.html with 200 (client-side routing).
- `wasm_status` assertions: name must be non-empty, version must be > 0.
- Stranger rejection test for `manage_top_up_rule` (was missing).
- Doc comments on all public functions and constants.

### Changed

- Converted from test-only crate to binary + library crate (installable via `cargo install`).
- Refactored monolithic test into reusable `run_acceptance_suite(wasm_bytes, label)`.
- Simplified alternative origins tests using helper functions.
- Pipeline (`run-test.sh`) now invokes the binary for each example WASM.

### Removed

- `tests/canister_dapp_test.rs` — replaced by the binary entry point.
- `get_wasm_file_name()` — callers now pass the WASM path directly.
- Dead code: `VersionHashes`, `VersionData`, `Assets` structs.
- Unused dependencies: `serde`.
