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

## 3. Protocol Components

### 3.1 Cycles Minting Canister (CMC)

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

### 3.2 IC Management Canister

**Canister ID**: `aaaaa-aa`

**Relevant Methods**:
```candid
install_code : (InstallCodeArgument) -> ()
update_settings : (UpdateSettingsArgument) -> ()
canister_status : (CanisterIdRecord) -> (CanisterStatusResult)
```

### 3.3 ICP Ledger

**Canister ID**: `ryjl3-tyaaa-aaaaa-aaaba-cai`

**Transfer to CMC**:
```candid
transfer : (TransferArgs) -> (TransferResult)
```
- `to`: CMC account with caller's subaccount
- `memo`: `0x4352454100000000` for create, `0x5450555000000000` for top-up
- `fee`: 10_000 e8s (0.0001 ICP)

### 3.4 Internet Identity

**Canister ID**: `rdmx6-jaaaa-aaaaa-aaadq-cai`

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

## 4. Canister Interface

A User-Owned Canister MUST implement:

### 4.1 Required Endpoints

```candid
// HTTP asset serving
http_request : (HttpRequest) -> (HttpResponse) query;

// Dashboard management
manage_ii_principal : (ManageIIPrincipalArg) -> (ManageIIPrincipalResult);
manage_alternative_origins : (ManageAlternativeOriginsArg) -> (ManageAlternativeOriginsResult);

// Metadata
wasm_status : () -> (WasmStatus) query;
```

### 4.2 Type Definitions

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

### 4.3 Optional Endpoints

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

### 4.4 Guards

```
only_canister_controllers_guard: Caller must be in canister's controller list
only_ii_principal_guard: Caller must match stored II principal
```

---

## 5. Asset Certification

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

## 6. Ecosystem Packages

### 6.1 Rust Crates

| Crate | Purpose | Key Exports |
|-------|---------|-------------|
| `my-canister-dashboard` | Dashboard UI + management logic | See details below |
| `my-canister-frontend` | Certified asset serving | `asset_router_configs()` |
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

### 6.2 JavaScript Packages

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

### 6.3 Services

| Service | URL | Purpose |
|---------|-----|---------|
| mycanister.app | https://mycanister.app | Reference installer + wasm registry |

---

## 7. Constants

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
II_CANISTER_ID = "rdmx6-jaaaa-aaaaa-aaadq-cai"
IC_MANAGEMENT_CANISTER_ID = "aaaaa-aa"

// Hosts
MAINNET_HOST = "https://icp-api.io"
MAINNET_IDENTITY_PROVIDER = "https://identity.internetcomputer.org"
LOCAL_HOST = "http://localhost:8080"
```

---

## 8. References

- [Internet Identity Specification](https://internetcomputer.org/docs/references/ii-spec)
- [Alternative Origins Documentation](https://internetcomputer.org/docs/building-apps/authentication/alternative-origins)
- [IC Management Canister Interface](https://internetcomputer.org/docs/references/ic-interface-spec)
- [HTTP Gateway Protocol](https://internetcomputer.org/docs/references/http-gateway-protocol-spec)
- [Asset Certification](https://internetcomputer.org/docs/building-apps/frontends/custom-frontend#asset-certification)

---

## 9. Development & Testing Infrastructure

This project combines several unconventional technologies in unusual ways, requiring a specialized build and test pipeline. This section documents the pipeline for developers and AI systems.

### 9.1 Why This Pipeline Exists

The User-Owned Canister pattern requires solving several problems that don't exist in typical web development:

1. **Principal Derivation**: Internet Identity derives different principals for different domains. Testing requires obtaining principals at multiple origins.
2. **Certified Assets**: HTTP responses must be cryptographically certified by the canister.
3. **Local Infrastructure**: Development requires mock versions of ICP Ledger, Cycles Minting Canister, and Internet Identity.
4. **Dual Environment Testing**: The same frontend must work both in Vite dev server and deployed as canister assets.

### 9.2 Pipeline Overview

```
validate-and-test-all.sh
├── scripts/check.sh                    # Lint, format, typecheck (Rust + JS)
├── DFX Bootstrap
│   ├── dfx-env/deploy-all.sh           # Deploy fake-cmc, ledger, index, II
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

### 9.3 Internet Identity Test Fixtures

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

### 9.4 Local Infrastructure

`dfx-env/deploy-all.sh` deploys mock system canisters with hardcoded IDs:

| Canister | ID | Purpose |
|----------|-----|---------|
| icp-ledger | `ryjl3-tyaaa-aaaaa-aaaba-cai` | Token transfers, balance queries |
| icp-index | `qhbym-qaaaa-aaaaa-aaafq-cai` | Transaction indexing |
| fake-cmc | `rkp4c-7iaaa-aaaaa-aaaca-cai` | Mock Cycles Minting Canister |
| internet-identity | `rdmx6-jaaaa-aaaaa-aaadq-cai` | Authentication |

**fake-cmc**: A custom Rust canister that simulates `notify_create_canister` without requiring real cycles. Essential for testing the canister creation flow.

### 9.5 Test Categories

**E2E Tests** (in `tests/`):

| Directory | Tests |
|-----------|-------|
| `canister-dashboard-frontend/` | Dashboard UI: topup, controllers, alternative-origins, topup-rule |
| `my-canister-app/` | Full installer flow: fund → create → install → transfer |
| `my-hello-world-frontend/` | Example dapp functionality |

**Unit Tests** (via `scripts/run-test.sh`):
- npm workspace tests (vitest)
- Rust tests with PocketIC (`cargo test -p canister-dapp-test`)

### 9.6 Dual Environment Testing

E2E tests run in two configurations:

1. **Vite Dev Server** (`localhost:5173`): Dashboard served by Vite with hot reload
2. **DFX Canister** (`<id>.localhost:8080`): Dashboard served as certified canister assets

This ensures the dashboard works in both development and production. Playwright projects in `playwright.config.ts` handle the routing.

### 9.7 Registry Configuration

The wasm registry (`registry.json`) contains GitHub URLs for production:
```json
"url": "https://raw.githubusercontent.com/Web3NL/my-canister-dapp/<hash>/wasm/my-hello-world.wasm"
```

`scripts/generate-registry-dev.sh` transforms these to local paths for development:
```json
"url": "wasm/my-hello-world.wasm"
```

Output: `registry-dev.json` used by the local my-canister-app instance.

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.3 | 2026-01-11 | Expanded Section 6.1: my-canister-dashboard crate details, UI features, state persistence note |
| 1.2 | 2026-01-11 | Expanded Section 6.2: vite-plugin-canister-dapp documentation |
| 1.1 | 2026-01-09 | Added Section 9: Development & Testing Infrastructure |
| 1.0 | 2026-01-08 | Initial specification |
