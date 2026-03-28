# Backend Reference — Rust Crates API

> This document covers the two Rust SDK crates for building canister backends.
> For IC concepts and architecture, see [ai-overview.md](ai-overview.md) first.

## Required Candid Interface

Every dapp built with this SDK **must** implement these 5 endpoints. The acceptance test suite (`dapp test`) validates all of them. If any endpoint is missing or has the wrong signature, the tests will fail.

```candid
type HttpRequest = record {
  method : text;
  url : text;
  headers : vec record { text; text };
  body : vec nat8
};

type HttpResponse = record {
  status_code : nat16;
  headers : vec record { text; text };
  body : vec nat8
};

type WasmStatus = record {
  name : text;       // Required, non-empty
  version : nat16;   // Required, > 0
  memo : opt text    // Optional description
};

type ManageIIPrincipalArg = variant {
  Set : principal;
  Get
};

type ManageIIPrincipalResult = variant {
  Ok : principal;
  Err : text
};

type ManageAlternativeOriginsArg = variant {
  Add : text;
  Remove : text
};

type ManageAlternativeOriginsResult = variant {
  Ok;
  Err : text
};

type ManageTopUpRuleArg = variant {
  Get;
  Add : TopUpRule;
  Clear
};

type ManageTopUpRuleResult = variant {
  Ok : opt TopUpRule;
  Err : text
};

type TopUpRule = record {
  interval : TopUpInterval;
  cycles_threshold : CyclesAmount;
  cycles_amount : CyclesAmount
};

type TopUpInterval = variant {
  Hourly;
  Daily;
  Weekly;
  Monthly
};

type CyclesAmount = variant {
  _0_25T;   // 250 billion cycles
  _0_5T;    // 500 billion cycles
  _1T;      // 1 trillion cycles
  _2T;      // 2 trillion cycles
  _5T;      // 5 trillion cycles
  _10T;     // 10 trillion cycles
  _50T;     // 50 trillion cycles
  _100T     // 100 trillion cycles
};

// === REQUIRED ENDPOINTS ===
service : {
  "http_request" : (HttpRequest) -> (HttpResponse) query;
  "wasm_status" : () -> (WasmStatus) query;
  "manage_ii_principal" : (ManageIIPrincipalArg) -> (ManageIIPrincipalResult);
  "manage_alternative_origins" : (ManageAlternativeOriginsArg) -> (ManageAlternativeOriginsResult);
  "manage_top_up_rule" : (ManageTopUpRuleArg) -> (ManageTopUpRuleResult);

  // Add your own endpoints below:
  // "my_method" : (text) -> (text) query;
}
```

> Reference: [Candid Specification](https://internetcomputer.org/docs/references/candid-ref) | [Using Candid](https://internetcomputer.org/docs/building-apps/interact-with-canisters/candid/using-candid)

---

## my-canister-frontend

Certified HTTP asset serving for IC canisters. Handles gzip compression, MIME detection, SPA routing, and security headers automatically.

> Latest version: [crates.io/crates/my-canister-frontend](https://crates.io/crates/my-canister-frontend)

### Public API

#### `setup_frontend(assets_dir: &Dir<'static>) -> Result<(), String>`

Initialize and certify frontend assets using default configuration. Call in `#[init]` (and `#[post_upgrade]` if you use upgrades).

```rust
use include_dir::{include_dir, Dir};
use my_canister_frontend::setup_frontend;

static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../frontend/dist");

#[init]
fn init() {
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");
}
```

#### `setup_frontend_with_config(assets_dir: &Dir<'static>, config: &FrontendConfig) -> Result<(), String>`

Initialize with custom configuration (extra file types, larger size limit).

```rust
use my_canister_frontend::{setup_frontend_with_config, FrontendConfig};

let config = FrontendConfig {
    extra_allowed_extensions: vec!["webmanifest".to_string(), "glb".to_string()],
    max_file_size: 5 * 1024 * 1024, // 5 MB
};
setup_frontend_with_config(&FRONTEND_DIR, &config).expect("Failed to setup frontend");
```

#### `http_request(request: HttpRequest) -> HttpResponse`

Serve certified assets. Delegate your `#[query] fn http_request` to this.

```rust
#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(request)
}
```

#### `asset_router::with_asset_router_mut(f: impl FnOnce(&mut AssetRouter<'static>) -> T) -> T`

Access the internal `AssetRouter` to add dashboard assets or custom certified routes.

```rust
use my_canister_frontend::asset_router::with_asset_router_mut;

with_asset_router_mut(|router| {
    // Add dashboard assets to the same router
    setup_dashboard_assets(router, Some(origins)).expect("Failed");
});
```

### FrontendConfig

```rust
pub struct FrontendConfig {
    /// Additional file extensions beyond the defaults (e.g., "webmanifest", "glb")
    pub extra_allowed_extensions: Vec<String>,
    /// Maximum file size in bytes (default: 2 MB = 2_097_152)
    pub max_file_size: usize,
}
```

### Default allowed file extensions

`html`, `js`, `mjs`, `css`, `png`, `jpg`, `jpeg`, `gif`, `webp`, `svg`, `ico`, `avif`, `woff`, `woff2`, `ttf`, `otf`, `eot`, `json`, `xml`, `txt`, `wasm`, `map`

### Auto-gzipped extensions

`html`, `js`, `mjs`, `css`, `json`, `svg`, `xml`, `txt`, `map`

### Security headers (all 8, applied to every response)

1. `content-security-policy` — includes `default-src 'none'`
2. `x-content-type-options: nosniff`
3. `x-frame-options: deny`
4. `referrer-policy: no-referrer`
5. `x-xss-protection: 0`
6. `strict-transport-security: max-age=31536000`
7. `permissions-policy: accelerometer=()`
8. `cross-origin-opener-policy: same-origin-allow-popups`
9. `cross-origin-resource-policy: same-origin`

### SPA fallback

Unknown paths under `/` serve `index.html` with HTTP 200 (client-side routing support).

### The `include_dir!` macro and the single-wasm build

A dapp is compiled into a **single wasm** that contains both backend logic and all frontend assets. This is achieved through a build chain:

1. **`build.rs`** (Cargo build script) runs `npm run build` in the frontend directory, producing compiled assets in `dist/`
2. **`include_dir!`** embeds the entire `dist/` directory into the Rust binary at compile time
3. **`setup_frontend()`** registers these embedded assets with the certified asset router at canister init
4. **`icp build`** compiles everything into a single `.wasm` — backend code, frontend assets, and dashboard UI included

The path in `include_dir!` is relative to the backend crate's `CARGO_MANIFEST_DIR`:

```rust
// frontend/dist/ is produced by build.rs running `npm run build`
static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../frontend/dist");
```

This is why the project structure places `frontend/` as a sibling to `backend/`:
```
src/
  backend/
    Cargo.toml    ← CARGO_MANIFEST_DIR
    build.rs      ← runs npm run build in ../frontend
    src/lib.rs    ← include_dir!("$CARGO_MANIFEST_DIR/../frontend/dist")
  frontend/
    package.json
    dist/         ← build output, embedded into the wasm
```

See [build.rs](#buildrs-builds-frontend-during-cargo-build) below for the complete build script.

---

## my-canister-dashboard

Embedded dashboard UI and management endpoints for user-owned dapps. Provides the 4 management endpoints + `WasmStatus`, guard functions, and the dashboard web UI served at `/canister-dashboard`.

> Latest version: [crates.io/crates/my-canister-dashboard](https://crates.io/crates/my-canister-dashboard)

### Setup

```rust
use my_canister_dashboard::setup::setup_dashboard_assets;
use my_canister_frontend::asset_router::with_asset_router_mut;

// In #[init] (after setup_frontend):
with_asset_router_mut(|router| {
    let origins = vec!["https://mycanister.app".to_string()];
    setup_dashboard_assets(router, Some(origins))
        .expect("Failed to setup dashboard assets");
});
```

Parameters:
- `router: &mut AssetRouter` — the asset router (from `my-canister-frontend` or your own)
- `alternative_origins: Option<Vec<String>>` — initial origins for `/.well-known/ii-alternative-origins`. Pass `None` or `Some(vec![])` if no initial origins needed.

### Management Functions

These are the implementations you delegate to from your canister endpoints:

```rust
// II Principal — Get or Set the owner's II principal
my_canister_dashboard::manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult

// Alternative Origins — Add or Remove origins for II derivation
my_canister_dashboard::manage_alternative_origins(
    router: &mut AssetRouter,
    arg: ManageAlternativeOriginsArg
) -> ManageAlternativeOriginsResult

// Top-Up Rules — Schedule automatic cycle top-ups
my_canister_dashboard::manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult
```

### Guard Functions

```rust
use my_canister_dashboard::guards::{only_canister_controllers_guard, only_ii_principal_guard};
```

| Guard | Checks | Use For |
|-------|--------|---------|
| `only_canister_controllers_guard()` | `ic_cdk::api::is_controller(caller())` | Management endpoints |
| `only_ii_principal_guard()` | `caller() == stored II principal` | Application endpoints (owner-only) |

### Exported Types

All types are re-exported from `my_canister_dashboard`:

```rust
use my_canister_dashboard::{
    // II Principal
    ManageIIPrincipalArg,           // variant { Set(Principal), Get }
    ManageIIPrincipalResult,        // variant { Ok(Principal), Err(String) }
    // Alternative Origins
    ManageAlternativeOriginsArg,    // variant { Add(String), Remove(String) }
    ManageAlternativeOriginsResult, // variant { Ok, Err(String) }
    // Top-Up Rules
    ManageTopUpRuleArg,             // variant { Get, Add(TopUpRule), Clear }
    ManageTopUpRuleResult,          // variant { Ok(Option<TopUpRule>), Err(String) }
    TopUpRule,                      // { interval, cycles_threshold, cycles_amount }
    TopUpInterval,                  // Hourly | Daily | Weekly | Monthly
    CyclesAmount,                   // _0_25T | _0_5T | _1T | ... | _100T
    // WASM Metadata
    WasmStatus,                     // { name: String, version: u16, memo: Option<String> }
    // Guards
    guards::only_canister_controllers_guard,
    guards::only_ii_principal_guard,
    // Setup
    setup::setup_dashboard_assets,
};
```

### Dashboard Asset Paths

| Constant | Path | Serves |
|----------|------|--------|
| `CANISTER_DASHBOARD_HTML_PATH` | `/canister-dashboard` | Dashboard SPA HTML |
| `CANISTER_DASHBOARD_JS_PATH` | `/canister-dashboard/index.js` | Dashboard JavaScript |
| `CANISTER_DASHBOARD_CSS_PATH` | `/canister-dashboard/style.css` | Dashboard CSS |
| `ALTERNATIVE_ORIGINS_PATH` | `/.well-known/ii-alternative-origins` | Certified JSON for II |

---

## Minimal Backend Template

Complete, copy-pasteable `lib.rs` for a new dapp. This passes all acceptance tests.

Based on: [examples/my-hello-world/src/backend/src/lib.rs](../examples/my-hello-world/src/backend/src/lib.rs)

```rust
use ic_cdk::{init, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::{
    guards::{only_canister_controllers_guard, only_ii_principal_guard},
    setup::setup_dashboard_assets,
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, ManageIIPrincipalArg,
    ManageIIPrincipalResult, ManageTopUpRuleArg, ManageTopUpRuleResult, WasmStatus,
};
use my_canister_frontend::{asset_router::with_asset_router_mut, setup_frontend};

/// Embedded frontend assets — path relative to this crate's Cargo.toml.
static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../frontend/dist");

/// Origins allowed for II principal derivation at this canister's domain.
/// Include your launcher/installer origin here.
/// Include http://localhost:<port> for local Vite dev server.
const ALTERNATIVE_ORIGINS: &[&str] = &[
    "https://mycanister.app",   // production launcher
    "http://localhost:5174",     // local Vite dev server
];

// === Initialization ===

#[init]
fn init() {
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");
    with_asset_router_mut(|router| {
        let origins: Vec<String> = ALTERNATIVE_ORIGINS.iter().map(|s| s.to_string()).collect();
        setup_dashboard_assets(router, Some(origins)).expect("Failed to setup dashboard assets");
    });
}

// === Required Endpoints (5) — do not remove ===

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(request)
}

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Dapp".to_string(),  // <-- change this
        version: 1,
        memo: Some("Description of your dapp".to_string()),
    }
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    with_asset_router_mut(|router| my_canister_dashboard::manage_alternative_origins(router, arg))
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    my_canister_dashboard::manage_top_up_rule(arg)
}

// === Your Application Endpoints ===
// Guard with only_ii_principal_guard for owner-only access.

#[query(guard = "only_ii_principal_guard")]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
```

---

## Stable Memory Persistence Pattern

For dapps that store state across canister upgrades. Pattern from: [examples/my-notepad/src/backend/src/lib.rs](../examples/my-notepad/src/backend/src/lib.rs)

### Key changes from the minimal template:

1. **Extract asset setup into a helper** — called from both `init` and `post_upgrade`:

```rust
fn setup_assets() {
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");
    with_asset_router_mut(|router| {
        let origins: Vec<String> = ALTERNATIVE_ORIGINS.iter().map(|s| s.to_string()).collect();
        setup_dashboard_assets(router, Some(origins)).expect("Failed to setup dashboard assets");
    });
}

#[init]
fn init() {
    setup_assets();
}
```

2. **Define a stable state struct** (must derive `CandidType`, `Serialize`, `Deserialize`):

```rust
#[derive(CandidType, Serialize, Deserialize)]
struct StableState {
    notes: Vec<Note>,
    next_id: u32,
}
```

3. **Save state before upgrade**:

```rust
#[pre_upgrade]
fn pre_upgrade() {
    let state = StableState { /* collect from thread_locals */ };
    let bytes = candid::encode_one(&state).expect("Failed to encode state");
    // Write length prefix + bytes to stable memory
    let total_len = 4 + bytes.len();
    let pages_needed = (total_len as u64).div_ceil(65536);
    let current_pages = ic_cdk::stable::stable_size();
    if pages_needed > current_pages {
        ic_cdk::stable::stable_grow(pages_needed - current_pages)
            .expect("Failed to grow stable memory");
    }
    ic_cdk::stable::stable_write(0, &(bytes.len() as u32).to_le_bytes());
    ic_cdk::stable::stable_write(4, &bytes);
}
```

4. **Restore state after upgrade** (then re-setup assets):

```rust
#[post_upgrade]
fn post_upgrade() {
    let mut len_bytes = [0u8; 4];
    ic_cdk::stable::stable_read(0, &mut len_bytes);
    let len = u32::from_le_bytes(len_bytes) as usize;
    if len > 0 {
        let mut bytes = vec![0u8; len];
        ic_cdk::stable::stable_read(4, &mut bytes);
        if let Ok(state) = candid::decode_one::<StableState>(&bytes) {
            // Restore thread_locals from state
        }
    }
    setup_assets(); // Must re-setup assets after upgrade
}
```

---

## Cargo.toml Setup

### Backend crate Cargo.toml

```toml
[package]
name = "my-dapp"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]   # Required for wasm compilation

[dependencies]
candid = "0.10"
ic-cdk = "0.17"
ic-asset-certification = "3"
ic-http-certification = "3"
include_dir = "0.7"

# SDK crates — check crates.io for latest versions:
# https://crates.io/crates/my-canister-frontend
# https://crates.io/crates/my-canister-dashboard
my-canister-frontend = "<latest>"
my-canister-dashboard = "<latest>"

# Only if using stable memory persistence:
serde = { version = "1", features = ["derive"] }
```

> Check [crates.io/crates/my-canister-frontend](https://crates.io/crates/my-canister-frontend) and [crates.io/crates/my-canister-dashboard](https://crates.io/crates/my-canister-dashboard) for the latest version numbers.

### build.rs (builds frontend during `cargo build`) {#buildrs-builds-frontend-during-cargo-build}

```rust
use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=../frontend/src");
    println!("cargo:rerun-if-changed=../frontend/package.json");
    println!("cargo:rerun-if-changed=../frontend/vite.config.ts");

    let frontend_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../frontend");

    if !frontend_dir.exists() {
        panic!("Frontend directory not found: {}", frontend_dir.display());
    }

    let output = Command::new("npm")
        .args(["run", "build"])
        .current_dir(&frontend_dir)
        .output()
        .expect("Failed to execute npm command");

    if !output.status.success() {
        panic!(
            "Frontend build failed:\nstdout: {}\nstderr: {}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }
}
```

---

## Guard Usage Guide

| Endpoint | Guard | Who Can Call | Purpose |
|----------|-------|-------------|---------|
| `http_request` | None | Anyone | Serve public frontend + dashboard assets |
| `wasm_status` | None | Anyone | Return dapp metadata |
| `manage_ii_principal` | `only_canister_controllers_guard` | Canister controllers | Set/get the owner's II principal |
| `manage_alternative_origins` | `only_canister_controllers_guard` | Canister controllers | Add/remove II derivation origins |
| `manage_top_up_rule` | `only_canister_controllers_guard` | Canister controllers | Configure automatic cycle top-ups |
| *your app endpoints* | `only_ii_principal_guard` | The canister owner (II principal) | Application-specific logic |

### Common mistake

Using `only_ii_principal_guard` on management endpoints. During the deploy flow, the deployer (who is a controller but not yet the II principal) must be able to call `manage_ii_principal` and `manage_alternative_origins`. The controller guard allows this; the II principal guard would block it.
