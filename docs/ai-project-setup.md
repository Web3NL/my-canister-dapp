# Project Setup — Scaffolding a New Dapp

> Step-by-step guide to creating a new user-owned dapp from scratch.
> For API details, see [ai-backend-reference.md](ai-backend-reference.md) and [ai-frontend-reference.md](ai-frontend-reference.md).
> For IC concepts, see [ai-overview.md](ai-overview.md).

## Single-Wasm Architecture

A dapp compiles into a **single wasm file** that contains both backend logic and all frontend assets (HTML, JS, CSS). There is no separate frontend hosting — the canister serves everything.

The build chain works like this:
1. **`build.rs`** runs `npm run build` on the frontend → produces `dist/` (compiled HTML, JS, CSS)
2. **`include_dir!`** macro embeds the `dist/` directory into the Rust binary at compile time
3. At canister init, **`setup_frontend()`** registers the embedded assets with the certified HTTP asset router
4. **`icp build my-dapp`** compiles the Rust crate into a single `.wasm` containing everything

This is why the frontend directory is a sibling of the backend directory — `build.rs` references `../frontend` to build it first.

## Project Structure

A dapp project has this layout:

```
my-dapp/
  icp.yaml                      # Canister + network config (for icp-cli)
  Cargo.toml                    # Rust workspace root
  src/
    backend/
      Cargo.toml                # Canister crate (cdylib)
      build.rs                  # Builds frontend during cargo build
      src/
        lib.rs                  # Canister entry point (init, endpoints)
      my-dapp.did               # Candid interface definition
    frontend/
      package.json              # Frontend dependencies
      vite.config.ts            # Vite + IC plugin config
      index.html                # HTML entry point
      src/
        main.ts                 # Frontend application code
```

---

## Step 1: icp.yaml

This is the configuration file for `icp-cli`. It defines your canister, the local network, and environments.

```yaml
canisters:
  - name: my-dapp
    recipe:
      type: "@dfinity/rust@v3.0.0"     # Rust canister build recipe
      configuration:
        package: my-dapp               # Cargo package name (matches Cargo.toml)
        shrink: true                   # Optimize wasm size with ic-wasm
        candid: src/backend/my-dapp.did  # Path to Candid file

networks:
  - name: local
    mode: managed                      # icp-cli manages the network lifecycle
    nns: true                          # Deploy ICP Ledger + CMC (required for cycles/top-up tests)
    ii: true                           # Deploy Internet Identity (required for dapp CLI auth flow)
    gateway:
      port: 8080                       # HTTP gateway port

environments:
  - name: local
    network: local
    canisters: [my-dapp]

```

### Why `nns: true` and `ii: true` are required

- **`ii: true`** — The `dapp deploy` command uses Internet Identity for the ownership handoff flow. Without II deployed locally, the CLI cannot authenticate the developer.
- **`nns: true`** — Deploys the ICP Ledger and Cycles Minting Canister (CMC). The acceptance tests (`dapp test`) validate the top-up rule flow, which transfers ICP to the CMC to mint cycles. Without NNS canisters, these tests fail.

> Reference: [icp-cli GitHub](https://github.com/dfinity/icp-cli)

---

## Step 2: Cargo.toml (Workspace Root)

```toml
[workspace]
members = ["src/backend"]
resolver = "2"
```

---

## Step 3: Backend Cargo.toml

```toml
[package]
name = "my-dapp"
version = "1.0.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]   # Required — compiles to wasm

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
# serde = { version = "1", features = ["derive"] }
```

---

## Step 4: Candid File (my-dapp.did)

This defines your canister's public interface. Start with the 5 required endpoints, then add your own.

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
  name : text;
  version : nat16;
  memo : opt text
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
  _0_25T;
  _0_5T;
  _1T;
  _2T;
  _5T;
  _10T;
  _50T;
  _100T
};

service : {
  // === Required endpoints (do not remove) ===
  "http_request" : (HttpRequest) -> (HttpResponse) query;
  "wasm_status" : () -> (WasmStatus) query;
  "manage_ii_principal" : (ManageIIPrincipalArg) -> (ManageIIPrincipalResult);
  "manage_alternative_origins" : (ManageAlternativeOriginsArg) -> (ManageAlternativeOriginsResult);
  "manage_top_up_rule" : (ManageTopUpRuleArg) -> (ManageTopUpRuleResult);

  // === Your custom endpoints ===
  // "greet" : (text) -> (text) query;
}
```

> Reference: [Candid Reference](https://internetcomputer.org/docs/references/candid-ref) | [Using Candid](https://internetcomputer.org/docs/building-apps/interact-with-canisters/candid/using-candid)

---

## Step 5: Backend lib.rs

See [ai-backend-reference.md — Minimal Backend Template](ai-backend-reference.md#minimal-backend-template) for the complete, copy-pasteable file.

Key points:
- Call `setup_frontend()` and `setup_dashboard_assets()` in `#[init]`
- Delegate `http_request` to `my_canister_frontend::http_request()`
- Implement all 5 required endpoints
- Guard management endpoints with `only_canister_controllers_guard`
- Guard your app endpoints with `only_ii_principal_guard`

---

## Step 6: build.rs

This is the critical glue that makes the single-wasm architecture work. The `build.rs` Cargo build script runs `npm run build` in the frontend directory **before** the Rust compilation. This ensures `frontend/dist/` exists when `include_dir!` tries to embed it into the wasm.

Without this file, `include_dir!` would fail because there's no `dist/` directory to embed.

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

## Step 7: Frontend package.json

```json
{
  "name": "my-dapp-frontend",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@web3nl/my-canister-dashboard": "<latest from npm>"
  },
  "devDependencies": {
    "@web3nl/vite-plugin-canister-dapp": "<latest from npm>",
    "vite": "^7",
    "typescript": "^5"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

Then run `npm install` in the frontend directory.

> Check npm for latest versions:
> - [npmjs.com/package/@web3nl/my-canister-dashboard](https://www.npmjs.com/package/@web3nl/my-canister-dashboard)
> - [npmjs.com/package/@web3nl/vite-plugin-canister-dapp](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp)

---

## Step 8: vite.config.ts

See [ai-frontend-reference.md — Complete vite.config.ts Templates](ai-frontend-reference.md#complete-viteconfigts-templates) for copy-pasteable configs.

Key requirements:
- Use `canisterDappEnvironmentConfig()` plugin with `viteDevCanisterId`
- Define `global: 'globalThis'` in both `define` and `optimizeDeps.esbuildOptions.define`
- Set up `@dfinity/*` → `@icp-sdk/*` alias mappings

---

## Step 9: Frontend index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Dapp</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

---

## Step 10: Frontend main.ts

See [ai-frontend-reference.md — Authentication Pattern](ai-frontend-reference.md#authentication-pattern) for the complete flow.

---

## Complete Checklist

1. Create project directory structure
2. Write `icp.yaml` with canister definition and local network config (`nns: true`, `ii: true`)
3. Write `Cargo.toml` (workspace root) and `src/backend/Cargo.toml`
4. Write `src/backend/my-dapp.did` with all 5 required endpoints + your custom ones
5. Write `src/backend/src/lib.rs` (use the minimal template from backend reference)
6. Write `src/backend/build.rs` (builds frontend during cargo build)
7. Write `src/frontend/package.json` and run `npm install`
8. Write `src/frontend/vite.config.ts` with plugin + aliases
9. Write `src/frontend/index.html` and `src/frontend/src/main.ts`
10. Build: `icp build my-dapp`
11. Run acceptance tests: `dapp test my-dapp`
12. Start local network and deploy with auth: `dapp deploy my-dapp`
13. Visit `http://<canister-id>.localhost:8080` to see your dapp
14. Visit `http://<canister-id>.localhost:8080/canister-dashboard` to see the management dashboard

### Example implementations

- Minimal (Svelte): [examples/my-hello-world/](../examples/my-hello-world/)
- CRUD with persistence (React): [examples/my-notepad/](../examples/my-notepad/)
