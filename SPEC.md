# Technical Specification: User-Owned Canisters

## Document Purpose

Formal technical reference for the User-Owned Canister pattern on the Internet Computer. Implementation-independent. Intended audience: developers, architects, AI systems.

**Style Guidelines for Editors**: Maintain technical, formal, concise tone. Avoid marketing language. Use tables for structured data. Include Candid/code snippets for interfaces. Keep sections numbered. Update Document History on changes.

---

## 1. Problem Statement

### 1.1 Canister Deployment Barrier

On the Internet Computer Protocol (ICP), canisters (smart contracts) are deployed via the `dfx` CLI. This requires:
- Local development environment
- Command-line proficiency
- Wallet/identity management via terminal

Non-technical users cannot create canisters they control.

### 1.2 Canister Self-Hosting Capability

ICP canisters can serve HTTP responses, including frontend assets. A single canister can function as a complete application (backend logic + frontend UI). This capability is underutilized due to the deployment barrier.

### 1.3 Internet Identity Principal Derivation

Internet Identity (II) derives user principals deterministically using:

```
seed = SHA256(salt || user_number || frontend_origin)
principal = DER_encode(seed)
```

Where `frontend_origin` = `protocol://hostname[:port]`

**Consequence**: The same user authenticating at different domains receives different principals. This creates an ownership transfer problem when creating a canister on behalf of a user.

### 1.4 The Handoff Problem

Scenario:
1. User authenticates at `installer.app` → receives `Principal_A`
2. Installer creates canister `xyz.icp0.io` with `Principal_A` as controller
3. User visits `xyz.icp0.io` and authenticates → receives `Principal_B`
4. User cannot manage canister (controller is `Principal_A`, not `Principal_B`)

---

## 2. Solution: User-Owned Canister Pattern

### 2.1 Definition

A **User-Owned Canister** is a canister where:
1. The controller is the user's II principal derived at the canister's own domain
2. A management dashboard is embedded in the canister
3. No external dependencies are required for ongoing management

### 2.2 Alternative Origins Mechanism

II supports a `derivationOrigin` parameter in authentication requests. When provided:
- II derives the principal using `derivationOrigin` instead of the current origin
- II validates that the current origin is listed in `derivationOrigin`'s `/.well-known/ii-alternative-origins`

**Specification**: [II Alternative Origins](https://internetcomputer.org/docs/references/ii-spec)

### 2.3 Solution Flow

```
1. FUND
   User transfers ICP to their account (derived from Principal_A at installer domain)

2. CREATE
   Installer calls CMC.notify_create_canister(block_index, controller=Principal_A)
   → New canister created with Principal_A as controller

3. INSTALL
   Installer calls IC_Management.install_code(canister_id, wasm_module)
   → Wasm includes dashboard with installer domain in alternative_origins

4. DERIVE
   Installer authenticates user with II using:
     derivationOrigin = "https://<canister_id>.icp0.io"
   → User receives Principal_B (their principal at canister domain)

5. TRANSFER
   Installer calls canister.manage_ii_principal({Set: Principal_B})
   Installer calls IC_Management.update_settings(canister_id, controllers=[canister_id, Principal_B])
   → User now controls canister with Principal_B

6. OWN
   User visits <canister_id>.icp0.io/canister-dashboard
   Authenticates with II → receives Principal_B
   → Full management access
```

### 2.4 Security Model

| Trust Boundary | Mitigation |
|----------------|------------|
| Installer could set wrong controller | User verifies controller post-creation |
| Wasm could be malicious | Registry curation; user can supply own wasm |
| Alternative origins manipulation | II validates via certified HTTP response |
| Dashboard tampering | Assets are IC-certified; hash verification |

---

## 3. Architecture Overview

This section explains how the project's components work together to enable the User-Owned Dapp pattern. Understanding this architecture is essential for developers building with the framework and for contributors working on the framework itself.

### 3.1 The Goal

Help developers write a frontend and backend in Rust, package it all up as an installable WASM that can be handed off to users, and include a dashboard for ongoing management—all without requiring the user to use CLI tools.

### 3.2 High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         USER-OWNED DAPP ECOSYSTEM                          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      SINGLE WASM MODULE                              │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │  │
│  │  │ Frontend Assets │  │  Dashboard UI   │  │   Backend Logic     │   │  │
│  │  │ (your dapp UI)  │  │  (/canister-    │  │   (Rust canister    │   │  │
│  │  │                 │  │   dashboard)    │  │    code)            │   │  │
│  │  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘   │  │
│  │           │                    │                      │              │  │
│  │           └────────────────────┼──────────────────────┘              │  │
│  │                                │                                     │  │
│  │                  ┌─────────────▼─────────────┐                       │  │
│  │                  │       AssetRouter         │                       │  │
│  │                  │  (certified HTTP serving) │                       │  │
│  │                  └───────────────────────────┘                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                       │
│                                    │ install_code                          │
│                                    ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       INTERNET COMPUTER                              │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────────┐   │  │
│  │  │    CMC    │  │  Ledger   │  │    II     │  │   IC Management │   │  │
│  │  │ (cycles)  │  │  (ICP)    │  │(identity) │  │   (canister     │   │  │
│  │  │           │  │           │  │           │  │    control)     │   │  │
│  │  └───────────┘  └───────────┘  └───────────┘  └─────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│                          ┌────────────────────┐                            │
│                          │   mycanister.app   │                            │
│                          │    (installer)     │                            │
│                          └────────────────────┘                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 The Single WASM Model

A User-Owned Dapp compiles to a **single WASM file** containing:

1. **Frontend Assets** - Your dapp's UI (HTML, JS, CSS) compiled and embedded at build time
2. **Dashboard UI** - Management interface served at `/canister-dashboard`
3. **Backend Logic** - Your Rust canister code

**Why Single WASM?**
> A self-contained WASM requires no external dependencies. The dashboard is always available at the canister's domain. Users can manage their dapp without CLI tools or third-party services.

**Build Flow:**
```
Frontend Source (TS/JS)        Dashboard Frontend           Backend (Rust)
        │                            │                            │
   npm run build              prebuild-mcd.sh                     │
        ▼                            ▼                            │
     dist/                    my-canister-dashboard               │
   (compiled)                   crate assets/                     │
        │                            │                            │
        └─── include_dir!() ────────-┤                            │
                                     │                            │
                                     ▼                            │
                         Rust Canister (lib.rs) ◄─────────────────┘
                         - setup_frontend()
                         - setup_dashboard_assets()
                         - your backend code
                                     │
                               cargo build
                                     ▼
                           my-dapp.wasm.gz
                         (single deployable file)
```

### 3.4 Package Architecture

The framework consists of published packages (for dapp developers) and private packages (deployment artifacts):

```
┌────────────────────────────────────────────────────────────────────────────┐
│               PUBLISHED PACKAGES (for dapp developers)                     │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  Rust Crates (crates.io)              JavaScript Packages (npm)            │
│  ┌─────────────────────────┐          ┌──────────────────────────────┐    │
│  │ my-canister-frontend    │          │ @web3nl/my-canister-dashboard │    │
│  │ (certified asset serving)│          │ (frontend client for dashboard│    │
│  └─────────────────────────┘          │  backend API)                 │    │
│  ┌─────────────────────────┐          └──────────────────────────────┘    │
│  │ my-canister-dashboard   │          ┌──────────────────────────────┐    │
│  │ (dashboard UI + mgmt    │          │ @web3nl/vite-plugin-canister-│    │
│  │  endpoints)             │          │ dapp (Vite integration for   │    │
│  └─────────────────────────┘          │  dfx + multi-env dev)        │    │
│  ┌─────────────────────────┐          └──────────────────────────────┘    │
│  │ canister-dapp-test      │                                              │
│  │ (conformance test suite)│                                              │
│  └─────────────────────────┘                                              │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│              PRIVATE PACKAGES (deployment artifacts)                       │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────┐     builds      ┌────────────────────────┐   │
│  │ canister-dashboard-     │ ───────────────►│ my-canister-dashboard  │   │
│  │ frontend                │     into        │ crate (assets/)        │   │
│  │ (dashboard UI source)   │                 └────────────────────────┘   │
│  └─────────────────────────┘                                              │
│  ┌─────────────────────────┐                                              │
│  │ my-canister-app         │                                              │
│  │ (production installer   │                                              │
│  │  at mycanister.app)     │                                              │
│  └─────────────────────────┘                                              │
│  ┌─────────────────────────┐                                              │
│  │ my-hello-world-frontend │                                              │
│  │ (example frontend)      │                                              │
│  └─────────────────────────┘                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 Package Roles

| Package | Type | Published | Role |
|---------|------|-----------|------|
| `my-canister-frontend` | Rust crate | crates.io | Certified HTTP asset serving for IC canisters |
| `my-canister-dashboard` | Rust crate | crates.io | Dashboard UI (embedded) + management endpoints |
| `canister-dapp-test` | Rust crate | crates.io | Conformance test suite for User-Owned Dapps |
| `@web3nl/my-canister-dashboard` | JS package | npm | Frontend code to interact with dashboard backend API |
| `@web3nl/vite-plugin-canister-dapp` | JS package | npm | Vite plugin for dfx integration + environment detection |
| `canister-dashboard-frontend` | JS package | private | Dashboard UI source (compiled into Rust crate) |
| `my-canister-app` | JS package | private | Production installer service at mycanister.app |
| `my-hello-world` | Rust crate | private | Reference implementation canister |
| `my-hello-world-frontend` | JS package | private | Reference implementation frontend |

### 3.6 How Packages Work Together

**For a dapp developer building a User-Owned Dapp:**

1. **Backend (Rust)**:
   - Use `my-canister-frontend` to serve your compiled frontend assets with IC certification
   - Use `my-canister-dashboard` to add the management dashboard and endpoints
   - Both crates are independent and can be used separately

2. **Frontend (TypeScript/JavaScript)**:
   - Use `@web3nl/my-canister-dashboard` to call dashboard backend APIs (check cycles, etc.)
   - Use `@web3nl/vite-plugin-canister-dapp` to configure Vite for seamless dfx integration

3. **Build**:
   - Your `build.rs` compiles the frontend via `npm run build`
   - `include_dir!()` embeds the compiled frontend into the WASM
   - Result: single WASM containing everything

4. **Test**:
   - Use `canister-dapp-test` to verify your WASM meets User-Owned Dapp requirements

**Why Two Dashboard Packages?**
> `canister-dashboard-frontend` (private) is the UI source code written in TypeScript. `my-canister-dashboard` (published) embeds the pre-compiled UI and provides the backend API. This separation allows the Rust crate to be published with frozen assets while development continues on the frontend.

---

## 4. Protocol Components

### 4.1 Cycles Minting Canister (CMC)

**Canister ID**: `rkp4c-7iaaa-aaaaa-aaaca-cai`

**Relevant Methods**:
```candid
notify_create_canister : (NotifyCreateCanisterArg) -> (NotifyCreateCanisterResult)
```

**NotifyCreateCanisterArg**:
```candid
type NotifyCreateCanisterArg = record {
  block_index : nat64;
  controller : principal;
  subnet_type : opt text;
  subnet_selection : opt SubnetSelection;
  settings : opt CanisterSettings;
};
```

**ICP Transfer Memo**: `0x4352454100000000` ("CREA" in ASCII, padded)

**Subaccount Derivation**: `principal_to_subaccount(caller_principal)`

### 4.2 IC Management Canister

**Canister ID**: `aaaaa-aa`

**Relevant Methods**:
```candid
install_code : (InstallCodeArgument) -> ()
update_settings : (UpdateSettingsArgument) -> ()
canister_status : (CanisterIdRecord) -> (CanisterStatusResult)
```

### 4.3 ICP Ledger

**Canister ID**: `ryjl3-tyaaa-aaaaa-aaaba-cai`

**Transfer to CMC**:
```candid
transfer : (TransferArgs) -> (TransferResult)
```
- `to`: CMC account with caller's subaccount
- `memo`: `0x4352454100000000` for create, `0x5450555000000000` for top-up
- `fee`: 10_000 e8s (0.0001 ICP)

### 4.4 Internet Identity

**Canister ID**: `rdmx6-jaaaa-aaaaa-aaadq-cai` (mainnet), `uxrrr-q7777-77774-qaaaq-cai` (local)

**AuthClient.login() Parameters**:
```typescript
{
  identityProvider: string,      // II URL
  derivationOrigin?: string,     // Origin for principal derivation
  maxTimeToLive?: bigint,        // Session duration in nanoseconds
}
```

**Alternative Origins Endpoint**:
```
GET /.well-known/ii-alternative-origins
Response: { "alternativeOrigins": ["https://origin1.com", ...] }
```

Requirements:
- Must return HTTP 200 (no redirects)
- Must be served as certified asset
- Must include CORS header: `Access-Control-Allow-Origin: https://identity.internetcomputer.org`
- Maximum 10 origins

---

## 5. Canister Interface

A User-Owned Canister MUST implement:

### 5.1 Required Endpoints

```candid
// HTTP asset serving
http_request : (HttpRequest) -> (HttpResponse) query;

// Dashboard management
manage_ii_principal : (ManageIIPrincipalArg) -> (ManageIIPrincipalResult);
manage_alternative_origins : (ManageAlternativeOriginsArg) -> (ManageAlternativeOriginsResult);

// Metadata
wasm_status : () -> (WasmStatus) query;
```

### 5.2 Type Definitions

```candid
type ManageIIPrincipalArg = variant {
  Set : principal;
  Get;
};

type ManageIIPrincipalResult = variant {
  Ok : principal;
  Err : text;
};

type ManageAlternativeOriginsArg = variant {
  Add : text;
  Remove : text;
};

type ManageAlternativeOriginsResult = variant {
  Ok;
  Err : text;
};

type WasmStatus = record {
  name : text;
  version : nat32;
  memo : opt text;
};
```

### 5.3 Optional Endpoints

```candid
// Automatic cycle top-up
manage_top_up_rule : (ManageTopUpRuleArg) -> (ManageTopUpRuleResult);

type TopUpInterval = variant { Hourly; Daily; Weekly; Monthly };
type CyclesAmount = variant { _0_25T; _0_5T; _1T; _2T; _5T; _10T; _50T; _100T };

type TopUpRule = record {
  interval : TopUpInterval;
  cycles_threshold : CyclesAmount;
  cycles_amount : CyclesAmount;
};
```

### 5.4 Guards

```
only_canister_controllers_guard: Caller must be in canister's controller list
only_ii_principal_guard: Caller must match stored II principal
```

---

## 6. Asset Certification

All HTTP responses MUST be certified per the IC HTTP certification specification.

**Required Headers**:
```
IC-Certificate: <certificate>
IC-CertificateExpression: <expression>
```

**Libraries**:
- `ic-asset-certification` (Rust)
- `ic-http-certification` (Rust)

**Dashboard Assets Path**:
```
/canister-dashboard          → HTML
/canister-dashboard/index.js → JavaScript
/canister-dashboard/style.css → CSS
/.well-known/ii-alternative-origins → JSON
```

---

## 7. Ecosystem Packages

### 7.1 Rust Crates

| Crate | Purpose | Key Exports |
|-------|---------|-------------|
| `my-canister-dashboard` | Dashboard UI and management utilities for user-owned canisters | See details below |
| `my-canister-frontend` | Certified frontend asset serving for IC canisters | See details below |
| `canister-dapp-test` | PocketIC test utilities | Test principals, constants, wasm helpers |

#### my-canister-dashboard Crate Details

**Setup:**
- `setup_dashboard_assets(router, alternative_origins)` - Initialize dashboard in AssetRouter during `#[init]`

**Management Functions:**
- `manage_ii_principal(arg)` - Get/Set Internet Identity principal
- `manage_alternative_origins(router, arg)` - Add/Remove alternative origins for II
- `manage_top_up_rule(arg)` - Get/Add/Clear automatic cycles top-up rules

**Guard Functions:**
- `only_canister_controllers_guard()` - Restrict endpoint to canister controllers
- `only_ii_principal_guard()` - Restrict endpoint to configured II principal

**Asset Paths (constants):**
- `CANISTER_DASHBOARD_HTML_PATH` = `/canister-dashboard`
- `CANISTER_DASHBOARD_JS_PATH` = `/canister-dashboard/index.js`
- `CANISTER_DASHBOARD_CSS_PATH` = `/canister-dashboard/style.css`
- `ALTERNATIVE_ORIGINS_PATH` = `/.well-known/ii-alternative-origins`

**Dashboard UI Features:**
- Light/dark theme toggle with system preference detection
- Copy buttons on all address fields (principals, accounts, hashes)
- Responsive design for mobile and desktop

**Important:** Thread-local state (II principal, alternative origins, top-up rules) is NOT persisted to stable memory. Canisters must implement their own persistence if configuration should survive upgrades.

#### my-canister-frontend Crate Details

**Setup:**
- `setup_frontend(assets_dir)` - Initialize and certify frontend assets during `#[init]`

**HTTP Serving:**
- `http_request(request)` - Serve certified assets via HTTP query endpoint

**Asset Router Access:**
- `asset_router::with_asset_router(f)` - Read-only access to internal router
- `asset_router::with_asset_router_mut(f)` - Mutable access for adding assets (e.g., dashboard)
- `asset_router::asset_router_configs(dir)` - Low-level asset processing for custom routers

**Note:** This crate is independent of `my-canister-dashboard`. They can be used together (frontend provides router, dashboard adds assets) or separately.

### 7.2 JavaScript Packages

| Package | Purpose | Key Exports |
|---------|---------|-------------|
| `@web3nl/my-canister-dashboard` | Dashboard client utilities | `MyCanisterDashboard`, `MyDashboardBackend`, `inferCanisterIdFromLocation()` |
| `@web3nl/vite-plugin-canister-dapp` | Vite plugin for environment config | See below |

#### @web3nl/vite-plugin-canister-dapp

Enables building a single frontend/WASM that works in all environments (local dfx, Vite dev server, IC mainnet).

**Build-time** (Vite plugin):
- Injects dev and prod environment configs as global constants
- Sets up Vite dev server proxies for `/api`, `/canister-dashboard`, `/.well-known/ii-alternative-origins`

**Runtime** (browser):
- `inferEnvironment()` - Returns `{ host, identityProvider }` based on URL origin detection
- `isDevMode()` - Returns `true` if origin is http://, localhost, or 127.0.0.1
- `inferCanisterId()` - Extracts canister ID from URL subdomain or uses `viteDevCanisterId` fallback

**Exports**:
```typescript
// Main export
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

// Runtime export (for frontend code)
import { inferEnvironment, isDevMode, inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
```

**Configuration**:
```typescript
canisterDappEnvironmentConfig({
  viteDevCanisterId: 'canister-id',  // Required for Vite dev server
  environment: {                      // Optional, sensible defaults provided
    development: { host: 'http://localhost:8080', identityProvider: '...' },
    production: { host: 'https://icp-api.io', identityProvider: '...' }
  },
  serverProxies: { api: true, canisterDashboard: true, iiAlternativeOrigins: true }
})
```

### 7.3 Private Packages

These packages are not published to npm or crates.io. They are deployment artifacts or internal build dependencies.

#### canister-dashboard-frontend

**Location**: `my-canister-dapp-js/canister-dashboard-frontend/`

**Purpose**: Source code for the embedded dashboard UI (vanilla TypeScript + Vite).

**Build Process**:
1. `scripts/prebuild-mcd.sh` runs `npm run build` in this package
2. Output is copied to `my-canister-dapp-rs/my-canister-dashboard/assets/`
3. The Rust crate embeds these assets via `include_dir!()`

**Why Private**: This is a build artifact, not a reusable library. Developers use the published `my-canister-dashboard` crate which already includes the compiled dashboard.

#### my-canister-app

**Location**: `my-canister-app/`

**Purpose**: Production installer service deployed at [mycanister.app](https://mycanister.app).

**Features**:
- Dapp Store: Browse available User-Owned Dapps from the registry
- Installer: Create user-owned canisters with ICP + Internet Identity
- My Dapps: View and access canisters the user has created

**Why Private**: This is a deployment target (a running service), not a library. The source is open for reference but not intended for external reuse.

#### my-hello-world + my-hello-world-frontend

**Location**: `examples/my-hello-world/`

**Purpose**: Reference implementation demonstrating the complete User-Owned Dapp pattern.

**Why Private**: These are examples, not production libraries. See Section 8 for detailed documentation.

### 7.4 Services

| Service | URL | Purpose |
|---------|-----|---------|
| mycanister.app | https://mycanister.app | Reference installer + wasm registry |

---

## 8. Reference Implementation: my-hello-world

The `examples/my-hello-world/` directory contains a complete reference implementation demonstrating the User-Owned Dapp pattern.

### 8.1 Structure

```
examples/my-hello-world/
├── src/
│   ├── my-hello-world/                # Rust canister
│   │   ├── Cargo.toml
│   │   ├── build.rs                   # Compiles frontend before Rust build
│   │   ├── src/lib.rs                 # Canister implementation
│   │   └── my-hello-world.did         # Candid interface definition
│   ├── my-hello-world-frontend/       # TypeScript frontend
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.ts                # Entry point
│   │       ├── App.ts                 # lit-html based UI
│   │       ├── auth.ts                # II authentication manager
│   │       └── cyclesChecker.ts       # Dashboard API usage example
│   └── declarations/                  # Generated Candid bindings
└── README.md
```

### 8.2 Build Process

The `build.rs` script automates frontend compilation:

```rust
// build.rs (simplified)
fn main() {
    println!("cargo:rerun-if-changed=../my-hello-world-frontend/src");

    let status = Command::new("npm")
        .args(["run", "build"])
        .current_dir("../my-hello-world-frontend")
        .status()
        .expect("npm run build failed");

    assert!(status.success());
}
```

The canister then embeds the compiled frontend:

```rust
// lib.rs
use include_dir::{include_dir, Dir};

static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../my-hello-world-frontend/dist");

#[init]
fn init() {
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");

    my_canister_frontend::asset_router::with_asset_router_mut(|router| {
        setup_dashboard_assets(router, Some(vec![
            "https://mycanister.app".to_string(),
            // ... other allowed origins
        ]));
    });
}
```

### 8.3 Frontend Integration

The frontend uses published packages for dashboard integration:

```typescript
// cyclesChecker.ts
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';

const dashboard = new MyCanisterDashboard(canisterId, { agent });
const status = await dashboard.canisterStatus();
if (status.cycles < CYCLES_THRESHOLD) {
    showWarning("Low cycles - visit dashboard to top up");
}
```

```typescript
// vite.config.ts
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig({
    plugins: [
        canisterDappEnvironmentConfig({
            viteDevCanisterId: '22ajg-aqaaa-aaaap-adukq-cai',
        }),
    ],
});
```

### 8.4 Backend Implementation

The canister implements all required User-Owned Dapp endpoints:

```rust
#[query]
fn http_request(req: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(req)
}

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "my-hello-world".to_string(),
        version: 5,
        memo: Some("Reference implementation".to_string()),
    }
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

// ... additional management endpoints
```

---

## 9. Conformance Testing

### 9.1 canister-dapp-test as Conformance Suite

The `canister-dapp-test` crate is the definitive test for determining if a WASM is a valid User-Owned Dapp. Any WASM that passes all tests in this crate can be installed via mycanister.app and handed off to users.

**Location**: `my-canister-dapp-rs/canister-dapp-test/`

**Run**: `cargo test -p canister-dapp-test`

### 9.2 What Makes a Valid User-Owned Dapp

The conformance suite verifies:

| Requirement | Test Method |
|-------------|-------------|
| Dashboard HTML served | HTTP 200 at `/canister-dashboard` with valid HTML structure |
| Dashboard JS served | HTTP 200 at `/canister-dashboard/index.js` with valid UTF-8 |
| Dashboard CSS served | HTTP 200 at `/canister-dashboard/style.css` with CSS rules |
| II principal management | `manage_ii_principal(Set)` and `manage_ii_principal(Get)` |
| Alternative origins | `manage_alternative_origins(Add)` and `manage_alternative_origins(Remove)` |
| Top-up rules | `manage_top_up_rule(Add)`, `manage_top_up_rule(Get)`, `manage_top_up_rule(Clear)` |
| Controller guard | Non-controllers rejected from management endpoints |
| II principal guard | Only configured principal can access protected endpoints |
| Wasm status | `wasm_status()` returns valid `WasmStatus` record |

### 9.3 Test Utilities

The crate provides utilities for testing User-Owned Dapps:

**Asset Validation**:
- `validate_html_structure(bytes)` - Verify HTML contains required elements
- `validate_js_structure(bytes)` - Verify JS is valid UTF-8 and non-empty
- `validate_css_structure(bytes)` - Verify CSS contains style rules
- `validate_frontend_assets(http_response)` - Comprehensive validation
- `compute_asset_hash(bytes)` - SHA256 hash for asset verification

**Test Principals**:
- `ii_principal_at_installer_app()` - Simulates user principal at installer origin
- `ii_principal_at_user_controlled_dapp()` - Simulates user principal at canister origin
- `stranger_principal()` - Simulates unauthorized user

**Constants**:
- `MIN_CANISTER_CREATION_BALANCE` - Minimum cycles for canister creation
- System canister IDs for local testing

### 9.4 Future: Formal Standard

The conformance suite currently verifies the Candid interface specification in `my-canister-dashboard.did`. Future work will expand this to a full behavioral specification defining:

- Required runtime behaviors
- State persistence requirements
- Upgrade safety guarantees
- Security properties

---

## 10. Constants

```
// Cycles
MIN_CANISTER_CREATION_CYCLES = 500_000_000_000 (500B)
DEFAULT_CREATION_AMOUNT = 1_000_000_000_000 (1T)

// ICP
TRANSACTION_FEE_E8S = 10_000 (0.0001 ICP)
E8S_PER_ICP = 100_000_000

// Memos (big-endian)
CREATE_CANISTER_MEMO = 0x4352454100000000 ("CREA")
TOP_UP_MEMO = 0x5450555000000000 ("TPUP")

// System Canisters
CMC_CANISTER_ID = "rkp4c-7iaaa-aaaaa-aaaca-cai"
LEDGER_CANISTER_ID = "ryjl3-tyaaa-aaaaa-aaaba-cai"
II_CANISTER_ID_MAINNET = "rdmx6-jaaaa-aaaaa-aaadq-cai"
II_CANISTER_ID_LOCAL = "uxrrr-q7777-77774-qaaaq-cai"
IC_MANAGEMENT_CANISTER_ID = "aaaaa-aa"

// Hosts
MAINNET_HOST = "https://icp-api.io"
MAINNET_IDENTITY_PROVIDER = "https://identity.internetcomputer.org"
LOCAL_HOST = "http://localhost:8080"
LOCAL_IDENTITY_PROVIDER = "http://uxrrr-q7777-77774-qaaaq-cai.localhost:8080"
```

---

## 11. References

- [Internet Identity Specification](https://internetcomputer.org/docs/references/ii-spec)
- [Alternative Origins Documentation](https://internetcomputer.org/docs/building-apps/authentication/alternative-origins)
- [IC Management Canister Interface](https://internetcomputer.org/docs/references/ic-interface-spec)
- [HTTP Gateway Protocol](https://internetcomputer.org/docs/references/http-gateway-protocol-spec)
- [Asset Certification](https://internetcomputer.org/docs/building-apps/frontends/custom-frontend#asset-certification)

---

## 12. Development & Testing Infrastructure

This project combines several unconventional technologies in unusual ways, requiring a specialized build and test pipeline. This section documents the pipeline for developers and AI systems.

### 12.1 Why This Pipeline Exists

The User-Owned Canister pattern requires solving several problems that don't exist in typical web development:

1. **Principal Derivation**: Internet Identity derives different principals for different domains. Testing requires obtaining principals at multiple origins.
2. **Certified Assets**: HTTP responses must be cryptographically certified by the canister.
3. **Local Infrastructure**: Development requires mock versions of ICP Ledger, Cycles Minting Canister, and Internet Identity.
4. **Dual Environment Testing**: The same frontend must work both in Vite dev server and deployed as canister assets.

### 12.2 Pipeline Overview

```
validate-and-test-all.sh
├── scripts/check.sh                    # Lint, format, typecheck (Rust + JS)
├── DFX Bootstrap
│   ├── dfx-env/deploy-all.sh           # Deploy custom II (CMC, Ledger, Index via --system-canisters)
│   └── scripts/setup-dfx-identity.sh   # Create deterministic test identity
├── scripts/setup-dashboard-dev-env.sh  # II principal derivation (see 9.3)
│   ├── Create my-hello-world canister
│   ├── Run create-ii-account fixture
│   ├── Run derive-ii-principal fixture (x2 origins)
│   └── Set canister controllers
├── scripts/generate-registry-dev.sh    # Transform GitHub URLs → local paths
├── dfx deploy my-canister-app
├── scripts/run-test.sh                 # Unit tests (npm + cargo)
└── scripts/run-test-e2e.sh             # E2E tests (Playwright)
```

### 12.3 Internet Identity Test Fixtures

Located in `test-fixtures/` (not `tests/`), these are **infrastructure utilities**, not tests:

| Fixture | Purpose | Output |
|---------|---------|--------|
| `ii-account/create-ii-account.spec.ts` | Creates II account via Playwright automation | `test-output/ii-anchor.txt` |
| `ii-principal-derivation/derive-ii-principal.spec.ts` | Derives principal at a specified origin | `test-output/derived-ii-principal-*.txt` |
| `ii-principal-derivation/derive-ii-principal-prod.spec.ts` | Manual derivation for production II | Interactive |

**Why these exist**: E2E tests need to authenticate as a user. Internet Identity derives principals per-origin, so we must:
1. Create an II account once
2. Derive principals at each test origin (Vite dev server, dfx canister)
3. Set those principals as canister controllers before running E2E tests

The `derive-ii-principal.ts` source is bundled into an IIFE (`derive-ii-principal.iife.js`) that can be injected into any page to perform II authentication.

### 12.4 Local Infrastructure

`dfx start --system-canisters` (dfx 0.30+) bootstraps system canisters automatically:

| Canister | ID | Source |
|----------|-----|---------|
| nns-cycles-minting (CMC) | `rkp4c-7iaaa-aaaaa-aaaca-cai` | Built-in |
| nns-ledger (ICP Ledger) | `ryjl3-tyaaa-aaaaa-aaaba-cai` | Built-in |
| nns-index (ICP Index) | `qhbym-qaaaa-aaaaa-aaafq-cai` | Built-in |
| internet-identity | `uxrrr-q7777-77774-qaaaq-cai` | Custom (dfx-env) |

**Pre-funding**: The anonymous identity is initialized with 1,000,000,000 ICP.
Test accounts receive ICP via transfers from anonymous identity (`dfx-env/deploy-all.sh`).

**Note**: CMC, Ledger, and Index use dfx 0.30+ built-in canisters. Internet Identity uses
a custom deployment because the built-in II has a newer UI incompatible with e2e tests,
and it cannot be overridden (controlled by NNS root). PocketIC tests use `IcpFeatures`.

### 12.5 Test Categories

**E2E Tests** (in `tests/`):

| Directory | Tests |
|-----------|-------|
| `canister-dashboard-frontend/` | Dashboard UI: topup, controllers, alternative-origins, topup-rule |
| `my-canister-app/` | Full installer flow: fund → create → install → transfer |
| `my-hello-world-frontend/` | Example dapp functionality |

**Unit Tests** (via `scripts/run-test.sh`):
- npm workspace tests (vitest)
- Rust tests with PocketIC (`cargo test -p canister-dapp-test`)

### 12.6 Dual Environment Testing

E2E tests run in two configurations:

1. **Vite Dev Server** (`localhost:5173`): Dashboard served by Vite with hot reload
2. **DFX Canister** (`<id>.localhost:8080`): Dashboard served as certified canister assets

This ensures the dashboard works in both development and production. Playwright projects in `playwright.config.ts` handle the routing.

### 12.7 Registry Configuration

The wasm registry (`registry.json`) contains GitHub URLs for production:
```json
"url": "https://raw.githubusercontent.com/Web3NL/my-canister-dapp/<hash>/wasm/my-hello-world.wasm"
```

`scripts/generate-registry-dev.sh` transforms these to local paths for development:
```json
"url": "wasm/my-hello-world.wasm"
```

Output: `registry-dev.json` used by the local my-canister-app instance.

### 12.8 PocketIC Integration Tests

The `canister-dapp-test` crate uses PocketIC for deterministic canister testing without requiring a running dfx replica.

**Setup Pattern**:
```rust
use pocket_ic::{PocketIcBuilder, IcpFeatures, IcpFeaturesConfig};

let pic = PocketIcBuilder::new()
    .with_icp_features(IcpFeatures {
        cycles_minting: Some(IcpFeaturesConfig::DefaultConfig),
        icp_token: Some(IcpFeaturesConfig::DefaultConfig),
        ..Default::default()
    })
    .build();
```

**Test Principal Helpers**:
```rust
// Simulates user at installer origin (mycanister.app)
let installer_principal = ii_principal_at_installer_app();  // 0xFF...FF (29 bytes)

// Simulates user at their own canister's origin
let owner_principal = ii_principal_at_user_controlled_dapp();  // 0xFE...FE (29 bytes)

// Simulates unauthorized user
let stranger = stranger_principal();  // 0xFD...FD (29 bytes)
```

**Test Flow**:
1. Create PocketIC instance with ICP features
2. Deploy test WASM to canister
3. Set up controllers and II principal
4. Verify dashboard assets are served correctly
5. Test management endpoints with different principals
6. Verify guard enforcement

---

## 13. Future Direction

### 13.1 Formal User-Owned Dapp Standard

The project is working toward a formal standard for User-Owned Dapps beyond the current Candid interface specification.

**Current State**:
- Candid interface defined in `my-canister-dashboard.did`
- Conformance tested by `canister-dapp-test`

**Future Work**:
- Full behavioral specification (not just interface)
- State persistence requirements
- Upgrade safety guarantees
- Security property definitions

### 13.2 Conformance Certification

The `canister-dapp-test` crate will serve as the official conformance suite:
- Passing all tests = certified User-Owned Dapp
- Registry entries may require passing conformance tests
- Versioned test suite to track standard evolution

### 13.3 Ecosystem Growth

Goal: Enable third-party developers to build User-Owned Dapps using the published packages and have them listed in the mycanister.app registry.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | 2026-01-11 | Major restructure: Added Section 3 (Architecture Overview with diagrams), Section 7.3 (Private Packages), Section 8 (Reference Implementation), Section 9 (Conformance Testing), Section 12.8 (PocketIC), Section 13 (Future Direction). Renumbered all sections. |
| 1.4 | 2026-01-11 | Added Section 6.1: my-canister-frontend crate details, clarified crate independence |
| 1.3 | 2026-01-11 | Expanded Section 6.1: my-canister-dashboard crate details, UI features, state persistence note |
| 1.2 | 2026-01-11 | Expanded Section 6.2: vite-plugin-canister-dapp documentation |
| 1.1 | 2026-01-09 | Added Section 9: Development & Testing Infrastructure |
| 1.0 | 2026-01-08 | Initial specification |
