# Changelog

## [Unreleased]

### Added

- `dapp derive-ii-principal <canister-origin>` — non-interactively derives the II principal for a
  canister origin using headless Playwright. Always creates a fresh identity. Outputs the principal
  to stdout. Requires Node.js, `@playwright/test`, Playwright Chromium
  (`npx playwright install chromium`), and a locally running II canister.

### Changed

- Deploy creates a fresh detached canister each time (no more name collisions on redeploy)
- Build uses `icp build` instead of raw `cargo build` + `ic-wasm shrink`
- Wasm gzip compression handled in-process via `flate2` (no system `gzip` dependency)
- Auto-detects already-gzipped wasm files and passes through without re-compressing
- Canister name and `--wasm` flag are now mutually exclusive
- Authentication prints a clickable terminal link instead of auto-launching the browser

### Added

- Deployment log: each deploy appends a JSON line to `.dapp/deployments.jsonl` with canister ID, URLs, owner, environment, and timestamp
- `--wasm` flag accepts both raw `.wasm` and pre-gzipped `.wasm.gz` files
- Descriptive error messages for missing `icp.yaml`, unknown canister name, missing build artifact, wasm not found, and II auth failure
- README, documentation field, and cargo-release metadata for crates.io parity

### Removed

- `open` crate dependency (no longer auto-launches browser)
