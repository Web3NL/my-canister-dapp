# Project Guide

Monorepo for building user-owned dapps on the Internet Computer. Users create and own canisters from a browser using ICP + Internet Identity — no CLI needed.

## Project Map

```
packages-rs/                  Publishable Rust crates (crates.io)
  my-canister-dashboard/        Dashboard UI + management endpoints (embedded in user canisters)
    frontend/                   Svelte dashboard app (compiled into the Rust crate)
  my-canister-frontend/         Certified HTTP asset serving with security headers + gzip
  canister-dapp-test/           Acceptance test library — validates any dapp wasm via PocketIC
  my-canister-dapp-cli/         CLI tool (`dapp`) for deploying + testing user-owned dapps

packages-js/                  Publishable npm packages
  my-canister-dashboard-js/     JS utilities for interacting with dashboard endpoints
  vite-plugin-canister-dapp/    Vite plugin for dev/prod environment detection

canisters/                    Deployable canisters
  my-canister-app/              Installer app — SvelteKit frontend hosted as asset canister
  wasm-registry/                On-chain registry storing dapp wasms for installation

examples/                     Example dapps (used for testing and as developer templates)
  my-hello-world/               Minimal example — Rust backend + Svelte frontend
  my-notepad/                   Notepad example — persistent storage

scripts/                      Shell scripts for build, test, deploy, publish
tests/                        E2E tests (Playwright) + shared helpers + acceptance tests
  demos-test/                   Acceptance test binary for demos canister access code flow
  ii-setup/                     Internet Identity setup (Playwright + Vite)
  output/                       Runtime test artifacts (derived principals, etc.)
declarations/                 Generated Candid interface bindings (icp-index)
wasm/                         Built wasm files for deployment/testing
.github/workflows/            CI/CD pipelines
```

## Component Relationships

```
Developer builds a dapp using:
  my-canister-frontend (Rust) ── certified asset serving
  my-canister-dashboard (Rust) ── embeds dashboard UI + management API

User installs dapp via:
  my-canister-app (installer) ── browses wasm-registry, creates canister, installs wasm

Developer deploys + tests via:
  my-canister-dapp-cli (`dapp`) ── deploy to local/mainnet with II auth, run acceptance tests

Testing validates via:
  canister-dapp-test (library) ── loads any wasm into PocketIC, runs acceptance checks
  demos-test ── validates demos canister access code flow via PocketIC
  Playwright E2E ── tests full flows against local ICP network
```

## Tech Stack

- **Backend**: Rust, ic-cdk, ic-http-certification, ic-asset-certification
- **Frontend**: Svelte 5, SvelteKit, Vite 7, TypeScript
- **Canister tooling**: icp-cli (`icp` command), PocketIC, ic-wasm
- **Testing**: Vitest (unit), cargo test (Rust unit), canister-dapp-test library via `dapp test` (acceptance), Playwright (E2E)
- **CI**: GitHub Actions on ubuntu-latest with local ICP network
- **Package management**: npm workspaces + Cargo workspace

## Commands

### Development

```sh
npm run dev:app               # Run installer app (my-canister-app) dev server
npm run dev:dashboard         # Run dashboard frontend dev server
```

### Building

```sh
npm run build                 # Build all JS workspace packages
cargo build                   # Build all Rust workspace crates
npm run build:app             # Build just my-canister-app
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
./scripts/deploy-app.sh <patch|minor|major>  # Deploy my-canister-app to IC mainnet + tag
```

### Utility Scripts

```sh
./scripts/setup-identity.sh           # Create test identities
./scripts/write-test-env.sh           # Write tests/test.env with canister IDs
./scripts/setup-dashboard-dev-env.sh  # II principal derivation + controller setup
./scripts/upload-wasm-to-registry.sh  # Upload a wasm to the registry canister
./scripts/build-all-wasm.sh           # Build, shrink, and compress all canister wasms
./scripts/generate-declarations.sh    # Regenerate Candid declarations
./scripts/clean.sh                    # Remove build artifacts
```

## CI/CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `pr.yml` | Pull requests to main | Validation (build + test + E2E, skips Vite E2E) |
| `ci.yml` | Push to main / tags / manual | Full validation (includes Vite E2E) |
| `publish-docs.yml` | npm package tags | Build TypeDoc + deploy to GitHub Pages |

Both `pr.yml` and `ci.yml` use `shared-build.yml` which runs `./validate-and-test-all.sh` on ubuntu-latest with icp-cli and a local ICP network (PocketIC with NNS + II). The `ci.yml` workflow passes `include-vite-e2e: true` for the most complete validation on main.

## Testing Architecture

**Unit tests** — run in isolation, no network needed:
- JS: `vitest` per workspace (dashboard-js, vite-plugin, dashboard-frontend, my-canister-app)
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
