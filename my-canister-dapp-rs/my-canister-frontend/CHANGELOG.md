# Changelog

## [Unreleased]

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
