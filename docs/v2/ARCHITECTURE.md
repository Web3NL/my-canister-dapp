# Canister Dashboard

Architecture Design Document

---

## 1. Overview

A **Canister Dashboard** is a user-owned canister on the Internet Computer that serves as a personal control panel for managing dapps. Any user with a browser and an Internet Identity ([id.ai](https://id.ai)) account can create one — no CLI tools, no developer setup.

From their dashboard, users can:

- Create new app canisters and install wasm modules into them
- Monitor status, cycles balance, and logs across all managed apps
- Top-up cycles (manually or via auto-refill rules)
- Upgrade, start, stop, and delete app canisters
- Manage controllers and take snapshots

### Key Architectural Insight

App canisters are **plain canisters**. They contain only application logic — no embedded management UI, no dashboard endpoints. The dashboard canister manages them externally as a controller. This means app developers never need to bundle management code into their wasm. They just build their app.

### The Problem

On the Internet Computer, canisters are deployed using developer CLI tools. This works for developers but creates a barrier for everyone else. Canisters have a unique capability — they can serve their own frontend like a self-contained HTTP server — but non-technical users have no way to create and control one using just a browser.

There is also a principal derivation challenge: Internet Identity derives a *different principal* for each canister domain. A user who creates a canister from one domain will have a different identity when visiting the canister at its own domain. Solving this "handoff problem" is central to the architecture.

---

## 2. System Architecture

### Components

```
┌──────────────────┐       ┌───────────────────────┐       ┌──────────────────┐
│   Launcher App   │       │  Dashboard Canister    │       │  App Canister A  │
│  (static site)   │──────>│  (Rust + embedded SPA) │──────>│  (plain canister)│
│                  │       │                        │       └──────────────────┘
└──────────────────┘       │                        │──────>┌──────────────────┐
                           │                        │       │  App Canister B  │
                           └───────────────────────┘       └──────────────────┘
```

**Launcher App** — A publicly accessible static site at a well-known URL. Its only job is to help users create their first dashboard canister. After creation, the user never needs the launcher again.

**Dashboard Canister** — One per user. A Rust canister with an embedded SvelteKit SPA served via certified HTTP responses, plus Candid endpoints for all management operations. The dashboard is a controller of every app canister it creates.

**App Canisters** — Standard IC canisters containing only application logic. They have no awareness of the dashboard. The dashboard manages them by being listed as a controller.

### System Service Dependencies

```
Dashboard Canister
  │
  ├──> ICP Ledger (ryjl3-tyaaa-aaaaa-aaaba-cai)       Transfer ICP for payments
  ├──> CMC (rkp4c-7iaaa-aaaaa-aaaca-cai)               Create canisters, top-up cycles
  ├──> Management Canister (aaaaa-aa)                   install_code, update_settings,
  │                                                     canister_status, fetch_canister_logs,
  │                                                     snapshots
  └──> Internet Identity (id.ai)                        User authentication
```

---

## 3. The Handoff Protocol

Internet Identity derives a unique principal per domain:

```
seed = H(salt ‖ user_number ‖ frontend_origin)
```

When a user at domain A creates canister B, their principal at B's domain will differ from their principal at A. The **handoff protocol** solves this by re-authenticating with `derivationOrigin` set to the new canister's domain, obtaining the principal the user will have when visiting that canister directly.

For `derivationOrigin` to work, the target canister must serve `/.well-known/ii-alternative-origins` as a certified asset, listing the requesting origin. II fetches this file to validate the cross-domain authentication request.

### Phase 1: Launcher Creates Dashboard

The user visits the Launcher at `https://<launcher-id>.icp0.io` and authenticates with II, receiving principal **P_launcher**.

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Fund** | User transfers ICP to their Launcher account (P_launcher's ledger account) |
| 2 | **Transfer to CMC** | Launcher calls ICP Ledger `icrc1_transfer` to CMC's minting account with memo `CREA` (`0x4352454100000000`) |
| 3 | **Create canister** | Launcher calls CMC `notify_create_canister(block_index, controller=P_launcher)`. CMC returns new canister ID **D** |
| 4 | **Persist pending state** | Store D in `localStorage` key `pending_dashboard_creation` for crash recovery |
| 5 | **Install dashboard wasm** | Launcher calls Management Canister `install_code(canister_id=D, mode=install, wasm=dashboard_wasm)` |
| 6 | **Configure alternative origins** | Launcher calls D's `manage_alternative_origins(Add("https://<launcher-id>.icp0.io"))` so D serves the required `/.well-known/ii-alternative-origins` |
| 7 | **Re-authenticate** | Launcher calls `AuthClient.login({ identityProvider: "https://id.ai", derivationOrigin: "https://D.icp0.io" })`. II validates D's alternative origins file, then returns delegation for **P_D** |
| 8 | **Store II principal** | Using P_launcher identity (still a controller), call D's `manage_ii_principal(Set(P_D))` |
| 9 | **Transfer controllers** | Call Management Canister `update_settings(canister_id=D, controllers=[D, P_D])`. D itself stays a controller for inter-canister calls. P_launcher is removed |
| 10 | **Clear pending state** | Remove from `localStorage` |
| 11 | **Redirect** | Navigate user to `https://D.icp0.io` |

### Phase 2: Dashboard Creates App

The user is at `https://D.icp0.io`, authenticated as **P_D**.

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Fund** | User ensures D holds sufficient ICP in its ledger account |
| 2 | **Initiate** | User calls D's `create_app(name, wasm_module, init_arg)` |
| 3 | **D transfers to CMC** | D calls ICP Ledger `transfer` to CMC with memo `CREA` |
| 4 | **D creates canister** | D calls CMC `notify_create_canister(block_index, controller=D)`. Returns new canister ID **A**. D stores A in its `app_registry` |
| 5 | **D installs wasm** | D calls Management Canister `install_code(canister_id=A, wasm=user_provided_wasm)`. For large wasms (>2MB), use `install_chunked_code` |
| 6 | **Configure alt origins** *(optional)* | If A serves HTTP and needs II auth from D's domain, D calls A's `manage_alternative_origins` endpoint. Many backend-only apps skip this |
| 7 | **Re-authenticate** *(optional)* | Dashboard SPA calls `AuthClient.login({ derivationOrigin: "https://A.icp0.io" })`. Requires A to serve `/.well-known/ii-alternative-origins` listing D's origin. Returns **P_A**. Skip for backend-only canisters |
| 8 | **Add P_A as controller** | Dashboard SPA calls D's `update_app_controllers`, which calls `update_settings(canister_id=A, controllers=[D, P_A])` |
| 9 | **Record in registry** | D stores `A → { controllers: [D, P_A], wasm_hash, created_at, name }` |

### Crash Recovery

Both phases use a **pending canister** pattern:

- **Phase 1**: The Launcher stores the canister ID in `localStorage` (key: `pending_dashboard_creation`). On page reload, it detects the pending canister and resumes from step 5 (install) instead of creating a new canister.
- **Phase 2**: The dashboard canister stores pending creation in stable storage (field: `pending_app_creation`). The frontend detects this on load and resumes the flow.

This prevents ICP loss if the browser crashes mid-flow — the canister already exists and just needs wasm installation and handoff.

---

## 4. Dashboard Canister Interface

```candid
// ═══════════════════════════════════════════════════════
//  Types
// ═══════════════════════════════════════════════════════

type HttpRequest = record {
  method : text;
  url : text;
  headers : vec record { text; text };
  body : vec nat8;
};

type HttpResponse = record {
  status_code : nat16;
  headers : vec record { text; text };
  body : vec nat8;
};

type AppInfo = record {
  canister_id : principal;
  name : text;
  created_at : nat64;
  wasm_hash : opt vec nat8;
  status : opt CanisterStatusResult;
};

type CanisterStatusResult = record {
  status : variant { running; stopping; stopped };
  memory_size : nat;
  cycles : nat;
  module_hash : opt vec nat8;
  idle_cycles_burned_per_day : nat;
};

type CreateAppArg = record {
  name : text;
  wasm_module : vec nat8;
  init_arg : opt vec nat8;
};

type CreateAppResult = variant { Ok : principal; Err : text };

type InstallMode = variant {
  install;
  reinstall;
  upgrade : record {
    skip_pre_upgrade : opt bool;
    wasm_memory_persistence : opt variant { keep; replace };
  };
};

type InstallCodeArg = record {
  canister_id : principal;
  mode : InstallMode;
  wasm_module : vec nat8;
  arg : opt vec nat8;
};

type UploadChunkResult = variant { Ok : vec nat8; Err : text };

type InstallChunkedCodeArg = record {
  canister_id : principal;
  mode : InstallMode;
  chunk_hashes : vec vec nat8;
  wasm_module_hash : vec nat8;
  arg : opt vec nat8;
};

type TopUpRule = record {
  interval : TopUpInterval;
  cycles_threshold : CyclesAmount;
  cycles_amount : CyclesAmount;
};

type TopUpInterval = variant { Hourly; Daily; Weekly; Monthly };

type CyclesAmount = variant {
  _0_25T; _0_5T; _1T; _2T; _5T; _10T; _50T; _100T;
};

type ManageTopUpRuleArg = variant { Get; Add : TopUpRule; Clear };
type ManageTopUpRuleResult = variant { Ok : opt TopUpRule; Err : text };

type ManageAlternativeOriginsArg = variant { Add : text; Remove : text };
type ManageAlternativeOriginsResult = variant { Ok; Err : text };

type ManageIIPrincipalArg = variant { Set : principal; Get };
type ManageIIPrincipalResult = variant { Ok : principal; Err : text };

type AppTopUpArg = record {
  canister_id : principal;
  cycles_amount : CyclesAmount;
};

type SnapshotId = vec nat8;

type SnapshotInfo = record {
  id : SnapshotId;
  taken_at : nat64;
  total_size : nat64;
};

type LogEntry = record {
  timestamp : nat64;
  content : text;
};

type Result = variant { Ok; Err : text };
type ResultPrincipal = variant { Ok : principal; Err : text };
type ResultOptTopUpRule = variant { Ok : opt TopUpRule; Err : text };
type ResultSnapshotInfo = variant {
  Ok : record { id : SnapshotId; total_size : nat64 };
  Err : text;
};

// ═══════════════════════════════════════════════════════
//  Service
// ═══════════════════════════════════════════════════════

service : {
  // --- HTTP ---
  "http_request"        : (HttpRequest) -> (HttpResponse) query;
  "http_request_update" : (HttpRequest) -> (HttpResponse);

  // --- Authentication ---
  "manage_ii_principal"        : (ManageIIPrincipalArg) -> (ManageIIPrincipalResult);
  "manage_alternative_origins" : (ManageAlternativeOriginsArg) -> (ManageAlternativeOriginsResult);

  // --- App Lifecycle ---
  "create_app"           : (CreateAppArg) -> (ResultPrincipal);
  "install_app_code"     : (InstallCodeArg) -> (Result);
  "upload_chunk"         : (record { chunk : vec nat8 }) -> (UploadChunkResult);
  "install_chunked_code" : (InstallChunkedCodeArg) -> (Result);
  "start_app"            : (principal) -> (Result);
  "stop_app"             : (principal) -> (Result);
  "delete_app"           : (principal) -> (Result);

  // --- Status & Monitoring ---
  "list_apps"            : () -> (vec AppInfo) query;
  "app_status"           : (principal) -> (CanisterStatusResult);
  "dashboard_status"     : () -> (CanisterStatusResult);
  "fetch_app_logs"       : (principal) -> (vec LogEntry);

  // --- Controllers ---
  "update_app_controllers"       : (record { canister_id : principal; controllers : vec principal }) -> (Result);
  "update_dashboard_controllers" : (vec principal) -> (Result);

  // --- Cycles ---
  "top_up_app"           : (AppTopUpArg) -> (Result);
  "manage_top_up_rule"   : (ManageTopUpRuleArg) -> (ResultOptTopUpRule);
  "cycles_balance"       : () -> (nat) query;
  "icp_balance"          : () -> (nat64);

  // --- Snapshots ---
  "take_snapshot"        : (record { canister_id : principal; replace_snapshot : opt SnapshotId }) -> (ResultSnapshotInfo);
  "load_snapshot"        : (record { canister_id : principal; snapshot_id : SnapshotId }) -> (Result);
  "list_snapshots"       : (principal) -> (vec SnapshotInfo);
  "delete_snapshot"      : (record { canister_id : principal; snapshot_id : SnapshotId }) -> (Result);
};
```

---

## 5. App Canister Requirements

App canisters managed by the dashboard have **minimal requirements**:

1. **The dashboard canister must be listed as a controller.** Without this, the dashboard cannot manage the app via the Management Canister. This is set automatically during creation (step 4 of Phase 2).

2. **No mandatory endpoints.** App canisters can expose any Candid interface. The dashboard manages them purely through the IC Management Canister API (as a controller) — `install_code`, `canister_status`, `update_settings`, `start_canister`, `stop_canister`, `delete_canister`, snapshots, and `fetch_canister_logs`.

3. **Optional: `/.well-known/ii-alternative-origins`**. Only needed if the user wants to authenticate at the app canister with II from the dashboard's domain (for the handoff in Phase 2, step 7). Backend-only canisters or canisters without II integration skip this.

4. **Optional: `wasm_status` query convention.** If an app canister exposes:
   ```candid
   "wasm_status" : () -> (record { name : text; version : nat16; memo : opt text }) query
   ```
   The dashboard will display richer metadata (app name, version) in the app list. This is a convention, not a requirement.

---

## 6. Frontend Architecture

### Technology

The dashboard frontend is a **SvelteKit SPA** built with Vite, compiled to static assets, and embedded into the Rust canister wasm at compile time using `include_dir!`. A single canister serves both the SPA and the Candid API — no separate asset canister needed.

### Routes

| Route | View |
|-------|------|
| `/` | Dashboard home — app list with status cards, cycles gauges |
| `/create` | Create new app canister (fund → create → install → handoff wizard) |
| `/app/:id` | App detail — status, logs, controllers, snapshots, upgrade |
| `/settings` | Dashboard settings — controllers, II principal, alternative origins, top-up rules |
| `/fund` | Fund dashboard with ICP, view ICP and cycles balances |

### Key Frontend Modules

| Module | Purpose |
|--------|---------|
| `lib/api/dashboard.ts` | Typed actor for dashboard canister Candid API |
| `lib/api/ledger.ts` | ICP Ledger ICRC-1 transfers |
| `lib/api/cmc.ts` | CMC exchange rate queries |
| `lib/auth/authClient.ts` | II login/logout wrapper |
| `lib/auth/remoteAuth.ts` | Re-authenticate with `derivationOrigin` for new canisters |
| `lib/stores/auth.ts` | Svelte store for auth state (identity, principal) |
| `lib/stores/apps.ts` | Svelte store for managed app canisters |
| `lib/flows/createApp.ts` | Orchestrates the create-app flow with crash recovery |
| `lib/utils/derivationOrigin.ts` | `createDerivationOrigin(canisterId, host)` |
| `lib/utils/pendingCanister.ts` | localStorage crash recovery |
| `lib/utils/balance.ts` | ICP↔cycles rate calculation |

### Authentication Flow

```
1. User lands on https://D.icp0.io
2. SPA checks AuthClient for existing session
3. If not authenticated → show login button
4. AuthClient.login({ identityProvider: "https://id.ai" })
5. On success → store identity in auth store
6. All API calls use the authenticated identity's agent

For app creation re-auth (Phase 2, step 7):
7. AuthClient.login({
     identityProvider: "https://id.ai",
     derivationOrigin: "https://A.icp0.io"
   })
8. Obtain P_A → send to dashboard backend for controller setup
```

The re-auth for app creation uses a **separate AuthClient storage namespace** (key prefix `ii_remote_auth_`) to isolate the remote session identity from the primary dashboard identity.

---

## 7. Security Model

### Guards

Two guard functions protect all mutation endpoints:

- **`only_controllers_guard()`** — Checks `ic_cdk::api::is_controller(&caller())`. Used for administrative operations that affect the dashboard canister itself.

- **`only_ii_principal_guard()`** — Checks `caller() == stored_ii_principal`. Used for user-facing operations (app management, cycles, etc.).

### Guard Assignments

| Endpoint | Guard |
|----------|-------|
| `http_request`, `http_request_update` | None (public) |
| `manage_ii_principal` | `only_controllers_guard` |
| `manage_alternative_origins` | `only_controllers_guard` |
| `update_dashboard_controllers` | `only_controllers_guard` |
| `create_app`, `install_app_code`, `upload_chunk`, `install_chunked_code` | `only_ii_principal_guard` |
| `start_app`, `stop_app`, `delete_app` | `only_ii_principal_guard` |
| `list_apps`, `app_status`, `dashboard_status` | `only_ii_principal_guard` |
| `fetch_app_logs` | `only_ii_principal_guard` |
| `update_app_controllers` | `only_ii_principal_guard` |
| `top_up_app`, `manage_top_up_rule` | `only_ii_principal_guard` |
| `icp_balance`, `cycles_balance` | `only_ii_principal_guard` |
| Snapshot operations | `only_ii_principal_guard` |

### Content Security Policy

The embedded HTML is served with a strict CSP header:

```
default-src 'none';
script-src 'self';
style-src 'self';
img-src 'self' data:;
object-src 'none';
base-uri 'none';
form-action 'self';
frame-ancestors 'none';
connect-src 'self' https://icp-api.io https://*.icp0.io https://id.ai
            http://localhost:* http://*.localhost:*;
```

`https://id.ai` is included in `connect-src` for II 2.0 authentication flows.

### Asset Certification

All HTTP responses — frontend assets, `/.well-known/ii-alternative-origins` — are served as **certified assets** using `ic-asset-certification`. The `AssetRouter` certifies assets at `#[init]` time and recertifies after any mutation (adding/removing alternative origins). The root hash is committed via `certified_data_set(router.root_hash())`.

The `/.well-known/ii-alternative-origins` response includes `Access-Control-Allow-Origin: *` as required by II for cross-origin validation.

### Stable Storage

All mutable state must survive canister upgrades. Serialized in `#[pre_upgrade]` and restored in `#[post_upgrade]`:

| Field | Type | Purpose |
|-------|------|---------|
| `ii_principal` | `Option<Principal>` | The user's II principal at this canister's domain |
| `alternative_origins` | `Vec<String>` | Origins allowed for II derivationOrigin |
| `app_registry` | `BTreeMap<Principal, AppRecord>` | All managed app canisters |
| `top_up_rule` | `Option<TopUpRule>` | Auto-refill configuration |
| `pending_app_creation` | `Option<Principal>` | Crash recovery for in-progress app creation |
| `wasm_chunk_store` | `BTreeMap<Vec<u8>, Vec<u8>>` | Temporary storage for chunked wasm uploads |

---

## 8. Cycles Economics

### ICP-to-Cycles Conversion

The Cycles Minting Canister (CMC) converts ICP to cycles at the current XDR exchange rate:

```
1 XDR = 1 trillion cycles (1T)
Rate: xdr_permyriad_per_icp (XDR × 10,000 per ICP)

cycles_per_icp = (xdr_permyriad_per_icp × 1e12) / 10,000
icp_needed_e8s = ⌈target_cycles × 1e8 / cycles_per_icp⌉
```

The rate is queried via CMC's `get_icp_xdr_conversion_rate`.

### Canister Creation

Creating a canister via CMC:

1. Transfer ICP to CMC's minting account with memo `CREA` (`0x4352454100000000`)
2. Call `notify_create_canister(block_index, controller, subnet_selection)`
3. CMC converts ICP to cycles and creates the canister with that cycles balance

### Cycles Top-Up

Topping up an existing canister:

1. Transfer ICP to CMC with memo `TPUP` (`0x5450555000000000`) and subaccount derived from the target canister ID
2. Call `notify_top_up(canister_id, block_index)`

Transaction fee: **10,000 e8s** (0.0001 ICP) per transfer.

### Auto-Refill Rules

The dashboard supports periodic auto-refill using `ic_cdk_timers`. A `TopUpRule` configures:

- **interval**: Hourly, Daily, Weekly, or Monthly checks
- **cycles_threshold**: If balance drops below this, trigger a top-up
- **cycles_amount**: How many cycles to mint per top-up

The timer callback:
1. Checks current cycles balance against threshold
2. Queries CMC for current ICP/XDR rate
3. Computes ICP needed for the requested cycles amount
4. Transfers ICP from the canister's ledger account to CMC
5. Calls `notify_top_up`
6. Stores `last_block_index` for idempotent retries if `notify_top_up` returns `Processing`

### Cost Estimates (approximate)

| Operation | Cost |
|-----------|------|
| Create canister (1T cycles) | ~0.5 ICP |
| Top-up 1T cycles | ~0.1 ICP |
| Install wasm (100KB) | ~0.01T cycles |
| ICP transaction fee | 0.0001 ICP |

*Actual costs vary with the XDR/ICP exchange rate.*

---

## 9. Technology Stack

### Rust Backend

| Crate | Version | Purpose |
|-------|---------|---------|
| `ic-cdk` | 0.19.0 | Canister development kit — macros, system API |
| `ic-cdk-timers` | 1.0+ | Periodic timers for auto-refill |
| `ic-asset-certification` | 3.1.0 | Certify HTTP assets in response tree |
| `ic-http-certification` | 3.0+ | HTTP request/response types |
| `candid` | 0.10+ | Candid serialization |
| `ic-ledger-types` | 0.16+ | ICP Ledger types |
| `icrc-ledger-types` | 0.1+ | ICRC-1 transfer types |
| `include_dir` | 0.7+ | Embed frontend build at compile time |
| `serde` + `serde_json` | 1.0 | Serialization |
| `serde_cbor` | 0.11+ | CBOR for stable storage |
| `sha2` | 0.10+ | SHA-256 for wasm/chunk hashes |

### Frontend

| Package | Purpose |
|---------|---------|
| `svelte` / `@sveltejs/kit` | SPA framework |
| `vite` | Build tool |
| `@dfinity/agent` | IC agent for canister calls |
| `@icp-sdk/auth` | AuthClient for II login |
| `@icp-sdk/core` | Principal type |

### Testing

| Tool | Purpose |
|------|---------|
| `pocket-ic` | Rust integration tests with simulated IC |
| `vitest` | JS unit tests |
| `playwright` | E2E browser tests |

### Tooling

| Tool | Purpose |
|------|---------|
| `icp-cli` 0.1.0 | Build and deploy (uses `icp.yaml`) |
| `wasm-opt` | Wasm optimization |

---

## 10. Project Structure

```
canister-dashboard/
│
├── icp.yaml                           # icp-cli project config
├── Cargo.toml                         # Rust workspace root
├── rust-toolchain.toml
├── package.json                       # JS workspace root
│
├── crates/
│   ├── dashboard-backend/             # Dashboard canister (Rust)
│   │   ├── Cargo.toml
│   │   ├── dashboard.did              # Candid interface
│   │   └── src/
│   │       ├── lib.rs                 # Entry points: init, pre/post_upgrade,
│   │       │                          #   http_request, all Candid endpoints
│   │       ├── state.rs               # Thread-local mutable state
│   │       ├── stable.rs              # Stable storage serialization
│   │       ├── guards.rs              # only_controllers_guard, only_ii_principal_guard
│   │       ├── assets.rs              # Embed frontend, CSP, asset certification
│   │       ├── ii_principal.rs        # manage_ii_principal
│   │       ├── alternative_origins.rs # manage_alternative_origins, /.well-known
│   │       ├── app_registry.rs        # App canister CRUD
│   │       ├── app_lifecycle.rs       # create_app, install_code, start/stop/delete
│   │       ├── controllers.rs         # update_app_controllers, update_dashboard_controllers
│   │       ├── cycles.rs              # top_up_app, manage_top_up_rule, balances
│   │       ├── snapshots.rs           # Snapshot operations
│   │       ├── logs.rs                # fetch_canister_logs wrapper
│   │       ├── chunked_upload.rs      # Wasm chunk upload buffer
│   │       ├── cmc.rs                 # CMC create + notify flows
│   │       └── ledger.rs              # ICP ledger transfer helpers
│   │
│   ├── dashboard-types/               # Shared Candid types (optional)
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   │
│   └── dashboard-test/                # Integration tests
│       ├── Cargo.toml
│       └── tests/
│           ├── app_lifecycle_test.rs
│           ├── cycles_test.rs
│           ├── auth_test.rs
│           ├── snapshots_test.rs
│           └── http_test.rs
│
├── frontend/                          # SvelteKit SPA
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   └── src/
│       ├── app.html
│       ├── routes/
│       │   ├── +layout.svelte
│       │   ├── +page.svelte           # Home — app list
│       │   ├── create/+page.svelte    # Create app wizard
│       │   ├── app/[id]/+page.svelte  # App detail
│       │   ├── settings/+page.svelte  # Dashboard settings
│       │   └── fund/+page.svelte      # Fund dashboard
│       └── lib/
│           ├── api/
│           │   ├── dashboard.ts
│           │   ├── ledger.ts
│           │   └── cmc.ts
│           ├── auth/
│           │   ├── authClient.ts
│           │   └── remoteAuth.ts
│           ├── components/
│           │   ├── AppCard.svelte
│           │   ├── StatusBadge.svelte
│           │   ├── CyclesGauge.svelte
│           │   ├── LogViewer.svelte
│           │   ├── ControllerList.svelte
│           │   ├── SnapshotList.svelte
│           │   ├── TopUpRuleForm.svelte
│           │   ├── WasmUploader.svelte
│           │   └── LoginButton.svelte
│           ├── stores/
│           │   ├── auth.ts
│           │   └── apps.ts
│           ├── flows/
│           │   └── createApp.ts
│           └── utils/
│               ├── derivationOrigin.ts
│               ├── pendingCanister.ts
│               ├── balance.ts
│               └── format.ts
│
├── launcher/                          # Launcher static site (separate canister)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── index.html
│       ├── main.ts                    # Create-dashboard flow
│       └── api/
│
└── scripts/
    ├── build.sh
    ├── deploy.sh
    └── test.sh
```

### Build Sequence

```
1. cd frontend && npm run build          # SvelteKit → frontend/build/
2. cargo build --target wasm32-unknown-unknown --release -p dashboard-backend
   # Rust picks up frontend/build/ via include_dir!
3. wasm-opt + gzip                       # Optimize and compress
4. icp deploy                            # Deploy via icp-cli
```

The frontend is embedded at Rust compile time. `index.html` is configured as a fallback for all SPA routes (any path not matching a static asset returns `index.html`). All assets are certified via `ic-asset-certification` and served with appropriate MIME types and cache headers.
