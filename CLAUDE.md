# Project Guide

Monorepo for building user-owned dapps on the Internet Computer. Users create and own canisters from a browser using ICP + Internet Identity — no CLI needed.

## Project Map

```
packages-rs/                  Publishable Rust crates (crates.io)
  my-canister-dashboard/        Dashboard UI + management endpoints (embedded in user canisters)
    frontend/                   Svelte dashboard app (compiled into the Rust crate)
  my-canister-frontend/         Certified HTTP asset serving with security headers + gzip
  my-canister-dapp-test/        Acceptance test library — validates any dapp wasm via PocketIC
  my-canister-dapp-cli/         CLI tool (`dapp`) for deploying + testing user-owned dapps

packages-js/                  Publishable npm packages
  my-canister-dashboard-js/     JS utilities for interacting with dashboard endpoints
  vite-plugin-canister-dapp/    Vite plugin for dev/prod environment detection

canisters/                    Deployable canisters
  icp-dapp-launcher/            Launcher app — SvelteKit frontend hosted as asset canister
  wasm-registry/                On-chain registry storing dapp wasms for installation
  demos/                        Demo access code flow — time-limited canister access for trials

examples/                     Example dapps (used for testing and as developer templates)
  my-hello-world/               Minimal example — Rust backend + Svelte frontend
  my-notepad/                   Notepad example — persistent storage

scripts/                      Shell scripts for build, test, deploy, publish
tests/                        E2E tests (Playwright) + shared helpers + acceptance tests
wasm/                         Built wasm files for deployment/testing
```

## Architecture & Key Patterns

### The Handoff Flow (II Principal Derivation)

The core challenge: Internet Identity derives a *different principal* for each domain. A user at the launcher (`mycanister.app`) gets principal A. At their canister (`<id>.icp0.io`), they get principal B. Ownership must be transferred to principal B.

**Solution**: Re-authenticate the user with II using the `derivationOrigin` parameter set to the new canister's domain. This forces II to derive the principal the user will have when visiting their canister directly.

**The flow (launcher)**:
1. User creates canister via the launcher app
2. Launcher adds its own origin to the canister's `/.well-known/ii-alternative-origins`
3. Launcher calls `AuthClient.login()` with `derivationOrigin = https://<canister-id>.icp0.io`
4. II derives the user's principal at the canister's domain and returns it
5. That principal is set as the canister controller
6. Launcher removes itself from alternative origins — the bridge is gone, user fully owns the canister

### CLI `dapp deploy` Flow

The `dapp` CLI deploys dapps **locally** and transfers ownership to the developer's II principal. Each deploy creates a **fresh detached canister** (new ID every time, no upgrades). Deploy currently supports local deployment only.

**Sequence**:
1. Build canister wasm (or use `--wasm` to provide one)
2. Create detached canister, install wasm
3. Start ephemeral HTTP server, add `http://localhost:<port>` to alternative origins
4. Open browser for II authentication with `derivationOrigin` = canister's domain
5. Receive derived principal via POST callback, set II principal on canister
6. Remove CLI origin from alternative origins
7. Update controllers to `[canister_id, user_principal]` — deployer relinquishes control (must be last step)

Deployments tracked in `.dapp/deployments.jsonl`.

### Dashboard Embedding

The dashboard is a Svelte app compiled and embedded into every user canister via the `my-canister-dashboard` Rust crate.

1. `scripts/prebuild-mcd.sh` builds the Svelte frontend → copies to `packages-rs/my-canister-dashboard/assets/`
2. Rust's `include_dir!()` embeds assets at compile time
3. At canister init, `setup_dashboard_assets()` registers them with the certified asset router

Every canister serves the dashboard at `/canister-dashboard` with HTTP certification, CSP headers, and `/.well-known/ii-alternative-origins`.

### Demos Access Code Flow

The `demos` canister provides time-limited trial access via access codes (XXXX-XXXX-XXXX). Redemption: atomically claim code → take canister from pool → install wasm → II auth (same derivationOrigin pattern) → set principal → start trial timer. On expiry, wasm is uninstalled and canister returned to pool. See `docs/demos-feature.md`.

## Commands

Uses `icp-cli` (`icp` command) — **not dfx**. Config: `icp.yaml`. Networks: `local` (PocketIC on port 8080), `ic` (mainnet).

```sh
npm run check                 # Lint + format + typecheck all JS workspaces
./scripts/rust-lint-format.sh # cargo fmt + cargo clippy
./validate-and-test-all.sh    # Full pipeline: checks + local network + deploy + all tests
```

**validate-and-test-all.sh flags:** `--clean`, `--skip-checks`, `--skip-bootstrap`, `--skip-acceptance`, `--skip-e2e`, `--include-vite-e2e`

**Pipeline phases** (each independently runnable): `01-check.sh` → `02-bootstrap.sh` → `03-build.sh` → `04-deploy.sh` → `05-test.sh`

## Workflow

- **Branch first** — create a feature branch before starting any work; never commit directly to main
- **PRs by default** — open a pull request for new features and patches; push directly to main only when explicitly asked
- **Validate before push** — run `./validate-and-test-all.sh` before pushing (use `--skip-bootstrap` to reuse a running local network, `--skip-e2e` to skip browser tests when only backend changed)
- **Changesets** for npm versioning — `npm run changeset` before PRs with publishable changes
- **syncpack** enforces consistent dependency versions; **knip** detects unused exports
