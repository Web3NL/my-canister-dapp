# Changelog

## [Unreleased]

### Changed

- Updated terminology: "canister dapp" → "user-owned dapp" in documentation and doc comments

### Added

- Asset hash verification: acceptance suite checks served dashboard assets against known-good hashes from all released versions
- Security header validation: all 8 security/privacy headers verified on frontend fallback responses
- Gzip compression test: verifies Accept-Encoding negotiation returns compressed responses with correct headers
- CLI binary: `my-canister-dapp-test <wasm-path>` runs the full acceptance suite against any dapp WASM.
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

- `tests/my_canister_dapp_test.rs` — replaced by the binary entry point.
- `get_wasm_file_name()` — callers now pass the WASM path directly.
- Dead code: `VersionHashes`, `VersionData`, `Assets` structs.
- Unused dependencies: `serde`.
