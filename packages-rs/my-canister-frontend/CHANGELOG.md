# Changelog

## [Unreleased]

### Fixed

- Removed unused foo file from package

### Changed

- Updated terminology: "Canister Dapp" → "User-owned dapp" in package description and documentation

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
