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
  demos-test/                   Acceptance test binary for demos canister access code flow
  ii-setup/                     Internet Identity setup (Playwright + Vite)
  output/                       Runtime test artifacts (derived principals, etc.)
wasm/                         Built wasm files for deployment/testing
.github/workflows/            CI/CD pipelines
```

## Component Relationships

```
Developer builds a dapp using:
  my-canister-frontend (Rust) ── certified asset serving
  my-canister-dashboard (Rust) ── embeds dashboard UI + management API

User installs dapp via:
  icp-dapp-launcher (launcher) ── browses wasm-registry, creates canister, installs wasm

Developer deploys + tests via:
  my-canister-dapp-cli (`dapp`) ── deploy to local/mainnet with II auth, run acceptance tests

Testing validates via:
  my-canister-dapp-test (library) ── loads any wasm into PocketIC, runs acceptance checks
  demos-test ── validates demos canister access code flow via PocketIC
  Playwright E2E ── tests full flows against local ICP network
```

## Architecture & Key Patterns

### The Handoff Flow (II Principal Derivation)

The core challenge: Internet Identity derives a *different principal* for each domain. A user at the launcher (`mycanister.app`) gets principal A. At their canister (`<id>.icp0.io`), they get principal B. Ownership must be transferred to principal B.

**Solution**: Re-authenticate the user with II using the `derivationOrigin` parameter set to the new canister's domain. This forces II to derive the principal the user will have when visiting their canister directly.

**The flow (launcher)**:
1. User creates canister via the launcher app
2. Launcher adds its own origin to the canister's `/.well-known/ii-alternative-origins` (certified JSON endpoint that tells II which origins are authorized)
3. Launcher calls `AuthClient.login()` with `derivationOrigin = https://<canister-id>.icp0.io`
4. II derives the user's principal at the canister's domain and returns it
5. That principal is set as the canister controller
6. Launcher removes itself from alternative origins — the bridge is gone, user fully owns the canister

**Key files**:
- `canisters/icp-dapp-launcher/src/lib/remoteAuthentication/` — derivationOrigin construction and remote auth client
- `packages-rs/my-canister-dashboard/src/dashboard/alternative_origins.rs` — alternative origins management (add/remove origins, serve certified JSON)
- `packages-rs/my-canister-dashboard/src/guards/` — guard functions (`only_canister_controllers_guard`, `only_ii_principal_guard`)

### CLI `dapp deploy` Flow

The `dapp` CLI (`my-canister-dapp-cli`) deploys dapps and transfers ownership to the developer's II principal. Each deploy creates a **fresh detached canister** (new ID every time, no upgrades).

**Sequence**:
1. Build canister wasm (or use `--wasm` to provide one)
2. Create detached canister via `icp canister create --detached`
3. Install wasm into the canister
4. Start an ephemeral HTTP server on a random localhost port
5. Add `http://localhost:<port>` to the canister's alternative origins
6. Open browser for II authentication with `derivationOrigin` = canister's domain
7. Receive the derived principal via POST callback to the local server
8. Set the II principal on the canister
9. Remove the CLI origin from alternative origins
10. Update controllers to `[canister_id, user_principal]` — deployer relinquishes control (must be last step)

Deployments are tracked in `.dapp/deployments.jsonl`.

**Key files**:
- `packages-rs/my-canister-dapp-cli/src/commands/deploy.rs` — full deploy orchestration
- `packages-rs/my-canister-dapp-cli/src/auth/server.rs` — ephemeral auth server
- `packages-rs/my-canister-dapp-cli/src/auth/page.rs` — HTML/JS served for II authentication
- `packages-rs/my-canister-dapp-cli/src/icp.rs` — icp-cli wrapper struct

### Dashboard Embedding

The dashboard is a Svelte app that gets compiled and embedded into every user canister as part of the `my-canister-dashboard` Rust crate.

**Build process**:
1. `scripts/prebuild-mcd.sh` builds the Svelte dashboard frontend
2. Compiled assets (HTML, JS, CSS) are copied to `packages-rs/my-canister-dashboard/assets/`
3. Rust's `include_dir!()` macro embeds these files into the crate at compile time
4. At canister init, `setup_dashboard_assets()` registers them with the certified asset router

Every user canister serves the dashboard at `/canister-dashboard` with full HTTP certification, security headers (CSP), and the `/.well-known/ii-alternative-origins` endpoint.

**Key files**:
- `scripts/prebuild-mcd.sh` — builds dashboard frontend and copies to assets dir
- `packages-rs/my-canister-dashboard/src/dashboard/mod.rs` — asset embedding via `include_dir!()`
- `packages-rs/my-canister-dashboard/src/setup/mod.rs` — `setup_dashboard_assets()` function
- `packages-rs/my-canister-dashboard/frontend/` — Svelte dashboard source

### Demos Access Code Flow

The `demos` canister provides time-limited trial access to dapps via access codes.

**Access codes**: 12-character alphanumeric strings (XXXX-XXXX-XXXX), generated from IC random bytes. Characters exclude 0/O/1/I to avoid ambiguity.

**Redemption flow**:
1. Code is atomically claimed (prevents double-use)
2. A canister is taken from a pre-created pool
3. Wasm is fetched from the wasm-registry and installed
4. Launcher origin is added to alternative origins
5. User authenticates with II (same derivationOrigin pattern)
6. II principal is set, controllers updated
7. Trial timer starts — on expiry, wasm is uninstalled and canister returned to pool

**Key files**:
- `canisters/demos/src/codes.rs` — access code generation
- `canisters/demos/src/redeem.rs` — redemption and finalization logic
- `docs/demos-feature.md` — feature documentation

## icp-cli

`icp-cli` (the `icp` command) is the **primary CLI tool for the Internet Computer** — it replaces dfx entirely. This project does not use dfx.

**Configuration**: `icp.yaml` defines canisters (with build recipes), networks, and environments.

**Key commands used in this project**:
| Command | Purpose |
|---------|---------|
| `icp build <name>` | Build canister wasm from icp.yaml recipe |
| `icp canister create --detached` | Create a new canister, return ID immediately |
| `icp canister install <id> --wasm <path>` | Install wasm into a canister |
| `icp canister call <id> <method> <args>` | Call canister method with Candid-encoded args |
| `icp canister settings update <id> --set-controller <principal>` | Update canister controllers |

**Networks**:
- `local` — managed PocketIC on port 8080 with NNS + II enabled
- `ic` — mainnet

**Environments** (defined in `icp.yaml`): `local` and `mainnet`, each specifying which canisters to deploy.

## Tech Stack

- **Backend**: Rust, ic-cdk, ic-http-certification, ic-asset-certification
- **Frontend**: Svelte 5, SvelteKit, Vite 7, TypeScript
- **Canister tooling**: icp-cli (`icp` command), PocketIC, ic-wasm
- **Testing**: Vitest (unit), cargo test (Rust unit), my-canister-dapp-test library via `dapp test` (acceptance), Playwright (E2E)
- **CI**: GitHub Actions on ubuntu-latest with local ICP network
- **Package management**: npm workspaces + Cargo workspace

## Commands

### Development

```sh
npm run dev:launcher          # Run icp-dapp-launcher dev server
npm run dev:dashboard         # Run dashboard frontend dev server
```

### Building

```sh
npm run build                 # Build all JS workspace packages
cargo build                   # Build all Rust workspace crates
npm run build:launcher        # Build just icp-dapp-launcher
npm run build:docs            # Build TypeDoc API docs for JS packages
```

### Quality Checks

```sh
npm run check                 # Lint + format + typecheck all JS workspaces
npm run deps:check            # syncpack lint + knip dead code detection
npm run fix                   # Auto-fix lint + format issues
npm run deps:fix              # Auto-fix dependency consistency
./scripts/rust-lint-format.sh # cargo fmt + cargo clippy for Rust
./scripts/01-check.sh         # Full prerelease checks (npm ci, build, lint, deps, Rust)
```

### Testing

```sh
./scripts/run-test.sh         # All unit tests (JS vitest + Rust cargo test + acceptance)
./scripts/run-test-e2e.sh     # E2E tests only (Playwright, requires running local network)
                              #   --include-vite-e2e: also run Vite dev server batch
./validate-and-test-all.sh    # Full pipeline: checks + local network + deploy + all tests
```

**validate-and-test-all.sh flags:**
- `--clean` — clean build artifacts first
- `--skip-checks` — skip lint/format/typecheck
- `--skip-bootstrap` — skip local network setup (reuse existing)
- `--skip-acceptance` — skip acceptance tests
- `--skip-e2e` — skip E2E tests
- `--include-vite-e2e` — force Vite E2E tests (even in CI)

**Pipeline phases** (each independently runnable):
```sh
./scripts/01-check.sh         # Static analysis (lint, format, typecheck, clippy)
./scripts/02-bootstrap.sh     # Start local network, identity, test.env, fund account
./scripts/03-build.sh         # Build frontends + Rust canister wasms
./scripts/04-deploy.sh        # Deploy canisters, II setup, upload wasms
./scripts/05-test.sh          # Unit + acceptance + E2E tests
                              #   --include-vite-e2e: also run Vite dev server batch
                              #   --skip-e2e: skip E2E tests entirely
```

### Publishing

```sh
npm run changeset             # Create a changeset for version bumping
npm run release:version       # Apply changesets → bump versions
npm run release:publish       # Publish npm packages + push git tags
./scripts/deploy-launcher.sh <patch|minor|major>  # Deploy icp-dapp-launcher to IC mainnet + tag
```

### Utility Scripts

```sh
./scripts/setup-identity.sh           # Create test identities
./scripts/write-test-env.sh           # Write tests/test.env with canister IDs
./scripts/setup-dashboard-dev-env.sh  # II principal derivation + controller setup
./scripts/upload-wasm-to-registry.sh  # Upload a wasm to the registry canister
./scripts/build-all-wasm.sh           # Build, shrink, and compress all canister wasms
./scripts/generate-declarations.sh    # Regenerate Candid declarations (dashboard, wasm-registry, demos)
./scripts/clean.sh                    # Remove build artifacts
./scripts/prebuild-mcd.sh             # Build dashboard frontend + copy assets to Rust crate
./scripts/add-asset-hash-entry.sh     # Add asset hash entry for certification
./scripts/encode-upload-arg.mjs       # Encode wasm upload arguments for registry
```

## CI/CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `pr.yml` | Pull requests to main | Validation (build + test + E2E, skips Vite E2E) |
| `ci.yml` | Push to main / tags / manual | Full validation (includes Vite E2E) |
| `shared-build.yml` | Called by pr.yml / ci.yml | Reusable workflow — runs full build/test pipeline |
| `publish-docs.yml` | npm package tags | Build TypeDoc + deploy to GitHub Pages |

`shared-build.yml` runs `./validate-and-test-all.sh` on ubuntu-latest with icp-cli and a local ICP network (PocketIC with NNS + II). The `ci.yml` workflow passes `include-vite-e2e: true` for the most complete validation on main.

## Testing Architecture

**Unit tests** — run in isolation, no network needed:
- JS: `vitest` per workspace (dashboard-js, vite-plugin, dashboard-frontend, icp-dapp-launcher)
- Rust: `cargo test` per crate (my-canister-dashboard, my-canister-frontend)

**Acceptance tests** — validate wasm behavior via PocketIC:
- `cargo run -p my-canister-dapp-cli -- test wasm/<name>.wasm.gz`
- `cargo run -p demos-test`
- Tests HTTP responses, security headers, dashboard endpoints, demos access code flow

**E2E tests** — full browser flows against local ICP network:
- Installer app test (always runs first — writes installed canister ID)
- Vite dev server batch: dashboard (local only, skipped in CI)
- Canister-served batch: dashboard + hello-world frontend (always runs)
- Requires: local network running, canisters deployed, II configured
- Test env vars in `tests/test.env` (auto-generated by setup scripts)

## Workflow

- **PRs by default** — open a pull request for new features and patches; push directly to main only when explicitly asked
- **Validate before push** — run `./validate-and-test-all.sh` before pushing; this is the primary validation gate (use `--skip-bootstrap` to reuse a running local network, `--skip-e2e` to skip browser tests when only backend changed)

## Conventions

- **Changesets** for versioning — `npm run changeset` before PRs with publishable changes
- **syncpack** enforces consistent dependency versions across workspaces
- **knip** detects unused exports and dependencies
- **icp-cli** (`icp` command) replaces dfx for all canister operations
- Config: `icp.yaml` (canister definitions), `Cargo.toml` (Rust workspace), `package.json` (npm workspaces)
- Local network: PocketIC on port 8080 with NNS + II enabled
- Canister URLs: `http://<canister-id>.localhost:8080`

## Key Files

- `icp.yaml` — canister definitions and network config
- `Cargo.toml` — Rust workspace members and shared dependencies
- `package.json` — npm workspace definitions and root scripts
- `playwright.config.ts` — E2E test project configuration
- `validate-and-test-all.sh` — orchestrates the full build/test pipeline
- `scripts/constants.sh` — shared variables (cycle amounts, canister names, origins)
- `tests/test.env` — auto-generated env vars for test runs (canister IDs, II URL)
