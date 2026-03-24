# Changelog

## [Unreleased]

### Added

- `StandardHeader` enum for typed exclusion of default security headers
- `FrontendConfig::excluded_headers: Vec<StandardHeader>` — omit specific default headers from every response
- `FrontendConfig::extra_headers: Vec<(String, String)>` — add headers to every response; a name matching a default (case-insensitive) replaces that default rather than duplicating it

### Fixed

- Removed unused foo file from package
- Max file size reduced from 2 MiB to 2 MiB − 16 KiB (2,080,768 bytes) so that total HTTP responses (body + `IC-Certificate` header + security headers) always fit within ICP's 2 MiB query response limit

### Changed

- Updated terminology: "Canister Dapp" → "User-owned dapp" in package description and documentation
- **Breaking**: `FrontendConfig` gains two new fields (`excluded_headers`, `extra_headers`); struct literals must add `..Default::default()` to remain valid
- **Breaking**: `FrontendConfig` no longer has a `max_file_size` field; the size limit is fixed and non-configurable. Remove any `max_file_size` assignments from `FrontendConfig` struct literals.
- **Breaking**: `DEFAULT_MAX_FILE_SIZE` constant removed from the public API.
- `X-XSS-Protection: 0` removed from default headers (legacy IE/old-Chrome header; add via `extra_headers` if still needed)
- `Strict-Transport-Security` removed from default headers (ICP gateway enforces HTTPS; redundant on `.icp0.io`/`.ic0.app` domains; add via `extra_headers` for custom domains)

## [0.3.0] - 2026-02-27

### Fixed

- Use display formatting (`{e}`) instead of debug formatting (`{e:?}`) in asset certification error message

### Added

- 8 default security/privacy HTTP headers on all asset responses: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-XSS-Protection, Strict-Transport-Security, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy
- Asset validation: file type allowlist, 2 MB size limit, duplicate path detection, path traversal and malformed URL rejection
- Gzip compression for text-based assets (HTML, JS, CSS, JSON, SVG, XML, TXT, source maps)
- `FrontendConfig` struct for customization (extra allowed extensions, custom size limit)
- `setup_frontend_with_config()` for configurable frontend initialization
- `asset_router_configs_with_config()` for configurable asset processing

### Changed

- `asset_router_configs()` now returns `Result` to surface validation errors (breaking)
- Compressible assets are served with both Identity and Gzip encodings

### Tests

- Added unit tests for `FrontendConfig` defaults (max file size, allowed extensions, compressible subset)

### Dependencies

- Added `flate2` for gzip compression

## [0.2.1] - 2025-09-11

### Changed

- Specify version for internal dep
- Update dependencies

## [0.2.0] - 2025-08-15

### Added

- `setup_frontend` function to initialize frontend assets into the internal router
- `http_request` to handle HTTP requests
- Internal Asset Router with `with_asset_router` and `with_asset_router_mut` accessors

### Changed

- Deprecated crate root level `asset_router_configs` in favor of `my_canister_frontend::asset_router::asset_router_configs`
