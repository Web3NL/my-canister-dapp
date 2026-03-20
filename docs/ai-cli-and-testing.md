# CLI & Testing Reference

> This document covers the `dapp` CLI tool and the acceptance test suite.
> For why the CLI exists and how it fits with icp-cli, see [ai-overview.md — Why the dapp CLI Exists](ai-overview.md#why-the-dapp-cli-exists).

## Why the `dapp` CLI Exists

`icp-cli` (`icp` command) is the primary CLI for the Internet Computer. It handles canister operations: build, create, install, call, manage settings, run local networks.

**But icp-cli has no concept of Internet Identity ownership handoff.**

The `dapp` CLI fills this specific gap. It orchestrates the complete flow of deploying a canister, authenticating with II, and transferring ownership — something that requires spinning up an ephemeral HTTP server, opening a browser, handling callbacks, and carefully sequencing canister management calls.

The `dapp` CLI is a **complement** to icp-cli:
- Use `icp` for: starting the local network, calling canister methods
- Use `dapp` for: deploying with II authentication and running acceptance tests

---

## Installation

```bash
cargo install my-canister-dapp-cli
```

This installs the `dapp` binary.

### Prerequisites

- **icp-cli** (`icp` command) must be installed and in PATH — [github.com/dfinity/icp-cli](https://github.com/dfinity/icp-cli)
- **Local IC network running** for local deployments (started via `icp` with `nns: true`, `ii: true` in `icp.yaml`)

---

## `dapp deploy`

Build and deploy a canister dapp to the Internet Computer with optional II authentication and ownership transfer.

### Usage

```bash
# Build from icp.yaml and deploy with II auth
dapp deploy my-dapp

# Deploy a pre-built wasm (no icp.yaml needed)
dapp deploy --wasm path/to/my-dapp.wasm.gz

```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `<canister>` (positional) | — | Canister name from `icp.yaml` (conflicts with `--wasm`) |
| `--wasm <PATH>` | — | Pre-built `.wasm` or `.wasm.gz` file (conflicts with positional arg) |
| `-e, --environment <ENV>` | `local` | Environment for deployment |
| `--identity <IDENTITY>` | current | icp-cli identity to use |
| `--cycles <CYCLES>` | `1000000000000` (1T) | Cycles for canister creation |
| `--ii-provider <URL>` | auto-detected | II provider URL override |

### Two Modes

1. **`dapp deploy <canister>`** — Requires `icp.yaml` in the current directory. Runs `icp build <canister>` first, then deploys the artifact from `.icp/cache/artifacts/<canister>`.

2. **`dapp deploy --wasm <path>`** — No `icp.yaml` needed. Deploys the given wasm file directly. Canister name is derived from the filename (e.g., `my-dapp.wasm.gz` → `my-dapp`).

### Full Deploy Flow (13 Steps)

This is what happens when you run `dapp deploy my-dapp`:

```
Step 1:  Check icp-cli is installed
           └─ Runs `icp --version`

Step 2:  Resolve canister name and wasm source
           └─ From positional arg (icp.yaml) or --wasm flag

Step 3:  Build wasm (only if no --wasm provided)
           └─ Runs `icp build my-dapp`
           └─ This triggers build.rs → npm run build (frontend) → cargo build (Rust + embedded assets)
           └─ Produces a single wasm containing backend logic + all frontend assets
           └─ Artifact written to .icp/cache/artifacts/my-dapp

Step 4:  Read wasm bytes and gzip if needed
           └─ Detects gzip via magic bytes (0x1f 0x8b)
           └─ Compresses raw wasm using flate2 if not already gzipped
           └─ Writes to temp file for icp-cli consumption

Step 5:  Create a fresh detached canister
           └─ Runs `icp canister create --detached --cycles 1000000000000`
           └─ Returns new canister ID (different every deploy — no reuse)

Step 6:  Install wasm into the canister
           └─ Runs `icp canister install <canister-id> --wasm <gzipped-path>`

Step 7:  Start ephemeral HTTP server on a random port
           └─ tiny_http server on localhost, auto-assigned port
           └─ Serves: GET / → auth HTML page, POST /callback → receive principal

Step 8:  Add CLI origin to canister's alternative origins
           └─ Calls manage_alternative_origins(Add("http://localhost:<port>"))
           └─ This allows II to honor derivationOrigin from this origin

Step 9:  Open browser for Internet Identity authentication
           └─ Prints clickable URL to terminal
           └─ Auth page uses AuthClient.login() with:
              identityProvider = II URL
              derivationOrigin = canister origin (e.g., http://<id>.localhost:8080)
           └─ II derives the principal the user will have at the canister's domain

Step 10: Receive derived principal via POST callback
           └─ Browser POSTs the principal as text/plain to http://localhost:<port>/callback
           └─ Server validates and returns the principal string

Step 11: Set II principal on the canister
           └─ Runs `icp canister call <id> manage_ii_principal '(variant { Set = principal "<principal>" })'`

Step 12: Remove CLI origin from alternative origins
           └─ Calls manage_alternative_origins(Remove("http://localhost:<port>"))
           └─ The ephemeral origin is no longer needed

Step 13: Update controllers (deployer relinquishes control)
           └─ Runs `icp canister settings update <id> --set-controller <id> --set-controller <principal>`
           └─ Canister becomes its own controller (for self-management)
           └─ User's II principal becomes a controller
           └─ Deployer is removed from controllers
           └─ ⚠️ MUST be the last step — after this, deployer has no access
```

### Local Environment

| Aspect | Value |
|--------|-------|
| Host | `http://localhost:8080` |
| II Provider | `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080` |
| Canister URL | `http://<id>.localhost:8080` |
| derivationOrigin | `http://<id>.localhost:8080` |

### Deployment Log

Each deploy appends a JSON line to `.dapp/deployments.jsonl`:

```json
{"canister_id":"bkyz2-fmaaa-aaaaa-qaaaq-cai","frontend":"http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8080","dashboard":"http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8080/canister-dashboard","owner":"2vxsx-fae","environment":"local","timestamp":"1710864000"}
```

---

## `dapp test`

Run acceptance tests against a wasm to validate it implements the required SDK interface.

### Usage

```bash
# Test a wasm file directly
dapp test path/to/my-dapp.wasm.gz

# Build from icp.yaml and test
dapp test my-dapp
```

### Flags

| Flag | Default | Description |
|------|---------|-------------|
| `<target>` (positional, required) | — | Path to `.wasm`/`.wasm.gz` file OR canister name in `icp.yaml` |
| `-e, --environment <ENV>` | `local` | Environment (for `icp build` when target is a canister name) |
| `--identity <IDENTITY>` | current | icp-cli identity to use (for `icp build`) |

### How It Works

1. If target is a file path → read wasm bytes directly
2. If target is a canister name → run `icp build <name>`, read artifact from `.icp/cache/artifacts/<name>`
3. Call `my_canister_dapp_test::run_acceptance_suite(&wasm_bytes, &label)`
4. Tests run in-process using [PocketIC](https://internetcomputer.org/docs/building-apps/test/pocket-ic) (no running network needed)
5. Exit code 0 = all tests pass, exit code 1 = failure

---

## Acceptance Test Suite — What It Validates

The test suite installs the wasm into a fresh PocketIC canister with ICP Ledger and CMC system canisters, then validates every required endpoint.

### 1. `wasm_status` (query)

- Returns `WasmStatus` with `name` (non-empty) and `version` (> 0)

### 2. `manage_ii_principal` (update)

- `Get` before any `Set` → `Err` (no principal configured yet)
- `Set(principal)` → `Ok(principal)`
- `Get` after `Set` → `Ok(principal)` (returns the stored value)
- Stranger (non-controller) calling → rejected

### 3. `http_request` (query) — Dashboard Assets

Validates the dashboard UI is correctly embedded and served:

| Path | Expected Status | Expected Content-Type |
|------|----------------|----------------------|
| `/canister-dashboard` | 200 | `text/html` |
| `/canister-dashboard/index.js` | 200 | `application/javascript` |
| `/canister-dashboard/style.css` | 200 | `text/css` |

Additional checks:
- HTML structure valid (DOCTYPE, html/head/body tags)
- JS file non-empty (>100 bytes, valid UTF-8)
- CSS has style rules (contains `{` and `}`)
- Asset hashes match known dashboard version
- **SPA fallback**: `/this-path-does-not-exist` returns 200 with index.html
- **Gzip compression**: when `Accept-Encoding: gzip` is sent, response body has gzip magic bytes (0x1f 0x8b)

### 4. Security Headers (all verified on responses)

Every HTTP response must include these headers:

| Header | Expected Value |
|--------|---------------|
| `content-security-policy` | Contains `default-src 'none'` |
| `x-content-type-options` | `nosniff` |
| `x-frame-options` | `deny` |
| `referrer-policy` | `no-referrer` |
| `x-xss-protection` | `0` |
| `strict-transport-security` | `max-age=31536000` |
| `permissions-policy` | `accelerometer=()` |
| `cross-origin-opener-policy` | `same-origin-allow-popups` |
| `cross-origin-resource-policy` | `same-origin` |

### 5. `manage_alternative_origins` (update)

- `Add("https://example.com")` → `Ok`
- Fetch `/.well-known/ii-alternative-origins` → JSON contains `"https://example.com"` in `alternativeOrigins` array
- `Remove("https://example.com")` → `Ok`
- Fetch again → origin is gone
- Invalid origins rejected (e.g., `ftp://...`, `http://non-localhost-domain.com`)
- Stranger (non-controller) calling → rejected

### 6. `manage_top_up_rule` (update)

- `Get` when empty → `Ok(None)`
- `Add(rule)` → `Ok(Some(rule))`
- `Get` after `Add` → `Ok(Some(rule))` (returns stored rule)
- `Clear` → `Ok(None)`
- `Get` after `Clear` → `Ok(None)`
- Timer fires at the specified interval
- When cycles threshold is breached: transfers ICP from canister account to CMC, receives cycles back
- Stranger (non-authorized) calling → rejected

### 7. Guard Enforcement

All guarded endpoints reject unauthorized callers:
- Non-controllers are rejected from controller-guarded endpoints
- Non-II-principals are rejected from II-principal-guarded endpoints

---

## Common Errors and Solutions

### "No icp.yaml found"

```
Error: No icp.yaml found in the current directory.
```

**Solution**: Either `cd` to the project root (where `icp.yaml` lives) or use `--wasm` flag:
```bash
dapp deploy --wasm path/to/my-dapp.wasm.gz
```

### Build artifact not found

```
Error: Build artifact not found: .icp/cache/artifacts/my-dapp
```

**Solution**: Check that the canister name in `dapp deploy <name>` matches the `name` field in `icp.yaml`.

### Authentication timeout

The CLI waits 120 seconds for the II authentication callback. If it times out:
- Check the local network is running: `icp network status`
- Check II is deployed: visit `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080` in a browser
- Check the II provider is reachable by visiting the URL in a browser

### Asset hash mismatch

The test suite verifies dashboard asset hashes against known versions. If hashes don't match:
- Ensure you're using the latest version of `my-canister-dashboard` from crates.io
- The dashboard assets are embedded at compile time — rebuild after updating the crate

---

## Local Development Setup

### 1. Start the local IC network

The network is configured in `icp.yaml` (needs `nns: true`, `ii: true`). Start it with icp-cli:

```bash
icp network start
```

This starts PocketIC on port 8080 with NNS and II canisters deployed. Use `icp network start -d` to run it in the background.

### 2. Build your dapp

```bash
icp build my-dapp
```

This runs the Rust build recipe from `icp.yaml`, which compiles the frontend (via `build.rs`) and the canister wasm.

### 3. Run acceptance tests

```bash
dapp test my-dapp
```

Tests run in-process with PocketIC — no running network needed. Fix any failures before deploying.

### 4. Deploy with II authentication

```bash
dapp deploy my-dapp
```

This creates a fresh canister, installs your wasm, and opens a browser for II authentication. After auth, you'll see:

```
--- Deployment complete ---
  Canister ID: bkyz2-fmaaa-aaaaa-qaaaq-cai
  Frontend:    http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8080
  Dashboard:   http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8080/canister-dashboard
  Owner:       <your-ii-principal>
```

### 5. Visit your dapp

- **Frontend**: `http://<canister-id>.localhost:8080`
- **Dashboard**: `http://<canister-id>.localhost:8080/canister-dashboard`

