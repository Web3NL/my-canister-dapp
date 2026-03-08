# Changelog

## [Unreleased]

## [1.0.0] - 2026-03-08

### Added

- Asset hash verification: acceptance suite checks served dashboard assets against known-good hashes from all released versions
- Security header validation: all 8 security/privacy headers verified on frontend fallback responses
- Gzip compression test: verifies Accept-Encoding negotiation returns compressed responses with correct headers
- HTTP response header validation: Content-Type for HTML/JS/CSS, Content-Security-Policy for dashboard HTML
- SPA fallback test: unknown paths serve index.html with 200 (client-side routing)
- `wasm_status` assertions: name must be non-empty, version must be > 0
- Stranger rejection test for `manage_top_up_rule` (was missing)
- Doc comments on all public functions and constants

### Changed

- Updated terminology: "canister dapp" → "user-owned dapp" in documentation and doc comments
- Refactored monolithic test into reusable `run_acceptance_suite(wasm_bytes, label)`
- Simplified alternative origins tests using helper functions
- Pipeline (`run-test.sh`) now invokes the crate for each example WASM

### Removed

- `tests/my_canister_dapp_test.rs` — replaced by library entry point
- `get_wasm_file_name()` — callers now pass the WASM path directly
- Dead code: `VersionHashes`, `VersionData`, `Assets` structs
- Unused dependencies: `serde`
