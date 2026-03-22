# Changelog

## [Unreleased]

## [1.1.1] - 2026-03-22

## [1.1.1] - 2026-03-20

### Changed

- Dashboard frontend: update default production Internet Identity provider URL from `identity.internetcomputer.org` to `id.ai` (via `@web3nl/vite-plugin-canister-dapp` update)

## [1.1.0] - 2026-03-20

### Added

- Export `ASSET_HASHES_JSON` constant — SHA-256 hashes of dashboard frontend assets for all published versions, used by the acceptance test library

## [1.0.1] - 2026-03-20

### Fixed

- Dashboard frontend: bind `fetch` to `globalThis` when creating `HttpAgent` to prevent `TypeError: Illegal invocation` in browsers
- Dashboard frontend: use `HttpAgent.create()` with `shouldFetchRootKey` instead of manual `fetchRootKey()` call

## [1.0.0] - 2026-03-08

### Added

- `asset-hashes.json` tracking SHA-256 hashes of dashboard frontend assets per release version

### Changed

- Updated terminology: "Canister Dapp" → "User-owned dapp" in package description and documentation

## [0.11.1] - 2026-02-27

### Fixed

- User-friendly log output: added `Display` impls for `TopUpInterval` and `NotifyError`, replaced debug formatting (`{:?}`) with display formatting in all log and error messages
- Added `Cache-Control: no-cache, no-store, must-revalidate` header to alternative origins endpoint

### Changed

- Improved help text for Manual Top-up and Automatic Top-up sections to clarify one-time vs recurring behavior

### Tests

- Added unit tests for `validate_alternative_origin()` covering HTTPS, HTTP localhost, subdomain localhost, and invalid inputs
- Added unit tests for `Display` impls on `TopUpInterval` and `NotifyError`
- Added edge case tests for `isValidOrigin()` in dashboard frontend (data URLs, javascript URLs, port 80 normalization)

### Docs

- Added "Usage with `my_canister_frontend`" section to README with code example

## [0.11.0] - 2026-01-11

### Added

- Light/dark theme toggle with system preference detection
- Copy buttons on all address fields (principals, ICRC1 accounts, module hash)
- Copy buttons on controllers and alternative origins list items
- Canister dashboard frontend: implemented `canisterStatusStore` and used it in `controllers` and `status` components

### Changed

- Use `CanisterDappEnvironmentConfig` for environment config instead of `CanisterDashboardDevConfig`
- Widget 1 renamed from "Logged in as" to "Your Identity"
- Widget 2 renamed from "Top up" to "Manual Top-up"
- Widget 3 renamed from "Top Up Rule" to "Automatic Top-up"
- Adjusted `top-up` and `status` to use new `canisterStatusStore.refresh` method
- Enable minification for dashboard assets

### Fixed

- CSP compliance: removed all inline scripts and styles

### Docs

- Expanded README with features list, management functions, guards, and asset paths
- Added rustdoc for top-up rule types (TopUpRule, TopUpInterval, CyclesAmount, ManageTopUpRuleArg)


## [0.10.7] - 2025-09-07

### Changed

- Remove CSP meta tag in `index.html` in favour of http headers, tightened CSP.

## [0.10.6] - 2025-09-06

## [0.10.5] - 2025-09-02

### Fixed

Canister dashboard frontend:

- Dashboard only loads if user is authed
- Improved component lifecycle handling
- Improved error handling
- Cleanup e2e tests

- Reverse canister log order in canister dashboard frontend

## [0.10.4] - 2025-09-02

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
