# Changelog

## [Unreleased]

### Fixed

- fix canister dashboard frontend to follow same alternative origin validation as backend

## [0.10.3] - 2025-08-29

### Docs

- Added documentation to mention Vite plugin configuration options.

## [0.10.2] - 2025-08-19

### Fixed

- Canister dashboard frontend: improved Top Up UX

## [0.10.1] - 2025-08-16

### Changed

- Version bumps, new build files

## [0.10.0] - 2025-08-13

### Added

- Manage top-up rule module with single-rule semantics (Hourly/Daily/Weekly/Monthly) and periodic timer.
- Exchange-rate fetch via CMC, ledger transfer and CMC notify flow with minimal idempotency.
- Logging (println) at key steps of the top-up lifecycle.

### Changed

## [0.9.1] - 2025-08-10

### Changed

- Update repository URL from `https://github.com/Web3NL/my-canister-dashboard` to `https://github.com/Web3NL/my-canister-dapp`

## [0.9.0] - 2025-08-10

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
