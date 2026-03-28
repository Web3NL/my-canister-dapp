# Changelog

## [Unreleased]

### Documentation

- Clarified that security header assertions target `my-canister-frontend`'s 6 default headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy); dapps that suppress headers via `FrontendConfig::excluded_headers` will intentionally fail the corresponding assertions

## [1.0.1] - 2026-03-20

### Changed

- Asset hashes now read from `my-canister-dashboard` crate instead of a local JSON file — hashes stay in sync automatically

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
