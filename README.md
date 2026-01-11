# My Canister Dapp

Build dapps that anyone can install and own—no CLI, no dev tools, just a browser and Internet Identity.

[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Status**: This project is in active development. See the [FAQ](https://mycanister.app/faq) for more information.

## The Problem

On the Internet Computer, canisters are deployed using the `dfx` CLI. This works well for developers, but creates a barrier for everyone else.

Canisters have a unique capability: they can serve their own frontend—like a self-contained HTTP server. This means a single canister can be a complete application. But non-technical users have no easy way to create and control one of these canisters using just a browser and their Internet Identity.

There's also a subtle challenge: Internet Identity derives a *different principal* for each domain. If a user authenticates at `mycanister.app` to create a canister, they get one principal. But when they visit their new canister at `abc123.icp0.io`, II gives them a *different* principal. How do you hand off ownership?

## The Solution

This repository provides libraries for developers to create **user-owned canisters**—dapps that:

- Can be created from a browser using only ICP and Internet Identity
- Include a built-in dashboard for management (cycles, upgrades, controllers)
- Are fully controlled by the user's II principal *at their canister's domain*

**The key insight**: After creating a canister, we re-authenticate the user with Internet Identity using the new canister's domain as the `derivationOrigin`. This produces the principal they'll use when visiting their dapp directly—and that principal becomes the controller.

## How It Works

1. **Fund**: User sends ICP to their account at the installer app
2. **Create**: ICP is sent to the Cycles Minting Canister, which creates a new canister
3. **Install**: The dapp's wasm is installed into the canister
4. **Transfer Control**: User re-authenticates with II using the new canister domain
5. **Own**: That II principal is set as the canister controller

The user now fully owns their canister. They can manage it directly at `<canister-id>.icp0.io/canister-dashboard`.

## For Developers

You build the wasm that users install. Your dapp becomes a template that anyone can instantiate as their own user-owned canister.

### What to use

**Rust (backend)**:
- `my-canister-dashboard` — Embeds the dashboard UI and management endpoints
- `my-canister-frontend` — Serves certified frontend assets

**JavaScript (frontend)**:
- `@web3nl/vite-plugin-canister-dapp` — Vite plugin for dev/prod environment detection
- `@web3nl/my-canister-dashboard` — Utilities for interacting with dashboard endpoints

### Example

See [examples/my-hello-world](examples/my-hello-world/) for a complete implementation.

```rust
use my_canister_dashboard::setup::setup_dashboard_assets;
use my_canister_frontend::asset_router_configs;

#[init]
fn init() {
    ASSET_ROUTER.with(|router| {
        let mut router = router.borrow_mut();

        // Add dashboard with allowed origins for II authentication
        setup_dashboard_assets(&mut router, Some(vec![
            "https://mycanister.app".to_string(),
        ]));

        // Add your frontend assets
        let (assets, asset_configs) = asset_router_configs(&FRONTEND_DIR);
        router.certify_assets(assets, asset_configs).unwrap();

        certified_data_set(router.root_hash());
    });
}
```

## mycanister.app

[mycanister.app](https://mycanister.app) is the reference installer and dapp registry:

- **Dapp Store**: Browse available dapps to install
- **Installer**: Create user-owned canisters with ICP + Internet Identity
- **My Dapps**: View and access your created canisters

Developers can submit their dapps to the registry, or users can install custom wasm files directly.

## Packages

| Package | Type | Description |
|---------|------|-------------|
| [my-canister-dashboard](https://crates.io/crates/my-canister-dashboard) | Rust | Dashboard assets and management endpoints |
| [my-canister-frontend](https://crates.io/crates/my-canister-frontend) | Rust | Certified HTTP asset serving |
| [@web3nl/my-canister-dashboard](https://www.npmjs.com/package/@web3nl/my-canister-dashboard) | npm | Dashboard interaction utilities |
| [@web3nl/vite-plugin-canister-dapp](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp) | npm | Vite plugin for environment config |

## License

MIT
