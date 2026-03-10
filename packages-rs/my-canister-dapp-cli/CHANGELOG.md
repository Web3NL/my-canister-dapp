# Changelog

## [Unreleased]

### Changed

- Deploy creates a fresh detached canister each time (no more name collisions on redeploy)
- Build uses `icp build` instead of raw `cargo build` + `ic-wasm shrink`
- Wasm gzip compression handled in-process via `flate2` (no system `gzip` dependency)
- Auto-detects already-gzipped wasm files and passes through without re-compressing

### Added

- Deployment log: each deploy appends a JSON line to `.dapp/deployments.jsonl` with canister ID, URLs, owner, environment, and timestamp
- `--wasm` flag accepts both raw `.wasm` and pre-gzipped `.wasm.gz` files
