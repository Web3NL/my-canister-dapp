# Changelog

## [Unreleased]

### Added

Canister dashboard frontend:

- Canister Logs section to the dashboard and component
- API call to fetch canister logs from management canister
- data-testid attributes to Refresh buttons: `refresh-balance-btn`, `refresh-logs-btn` to avoid conflicts

### Changed

- Update E2E canister dashboard frontend test to use data-testid for balance refresh button

## [0.8.1] - 2025-08-09

- Test: verify cargo-release changelog handling.

## [0.7.0] - 2025-08-02

### Added

- Vite plugin dapp config: provides dapp env and static dap config asset.
- Dashboard infers env by fetching dapp config asset.
- Improved testing.

## [0.6.0] - 2025-07-27

### Added

- Canister dashboard frontend DOM abstraction layer.
- Canister dashboard frontend dev config from json file.
- Vite, dfx and prod as configurable environments.

### Changed

- Canister dashboard frontend in Typescript.
- Allow dfx host as alternative origin.
