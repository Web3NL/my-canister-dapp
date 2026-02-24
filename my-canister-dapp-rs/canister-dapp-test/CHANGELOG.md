# Changelog

## [Unreleased]

### Added

- Parameterized WASM loading: `get_wasm_file_path(name)` accepts any dapp name instead of hardcoding `my-hello-world`.
- Second acceptance test for `my-notepad`, proving the framework generalizes to multiple dapps.
- HTTP response header validation: Content-Type for HTML/JS/CSS, Content-Security-Policy for dashboard HTML.
- 404 response test for non-existent paths.
- `wasm_status` assertions: name must be non-empty, version must be > 0.
- Stranger rejection test for `manage_top_up_rule` (was missing).
- Helper functions: `assert_header_contains`, `fetch_alternative_origins`, `assert_add_origin`, `assert_remove_origin`, `collect_canister_logs`.
- Inline documentation with section headers throughout the test.
- Doc comments on all public functions and constants in `lib.rs`.
- Meaningful README describing the suite's purpose and coverage.

### Changed

- Refactored monolithic test into reusable `run_acceptance_suite(wasm_path)` with two entry points.
- Simplified alternative origins tests using helper functions (reduced ~250 lines of repetition).

### Removed

- Dead code: `VersionHashes`, `VersionData`, `Assets` structs (never used).
- Unused dependencies: `serde`, `serde_cbor` removed from `[dependencies]`; `serde_json` moved to `[dev-dependencies]`.
