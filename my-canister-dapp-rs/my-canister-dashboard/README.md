# My Canister Dashboard

[![Crates.io](https://img.shields.io/crates/v/my-canister-dashboard)](https://crates.io/crates/my-canister-dashboard)
[![Documentation](https://docs.rs/my-canister-dashboard/badge.svg)](https://docs.rs/my-canister-dashboard)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Dashboard assets and management utilities for Internet Computer Canister Dapps.

Integrates with [`AssetRouter`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html) for asset certification.

## Features

- **Embedded Dashboard UI** - Pre-built HTML/CSS/JS dashboard served at `/canister-dashboard`
- **Internet Identity Integration** - Manage II principal for authentication
- **Alternative Origins** - Configure `/.well-known/ii-alternative-origins` for II domain delegation
- **Automatic Top-up** - Schedule periodic cycles top-ups when balance falls below threshold
- **Guard Functions** - Restrict endpoints to controllers or II principal
- **Light/Dark Theme** - Automatic theme detection with manual toggle
- **Copy Buttons** - One-click copy for principals, accounts, and hashes

## Setup

```rust
use ic_asset_certification::AssetRouter;
use my_canister_dashboard::setup;
use std::cell::RefCell;
use ic_cdk::{api::certified_data_set, init};

thread_local! {
    static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(
        AssetRouter::new()
    );
}

#[init]
fn init() {
    ASSET_ROUTER.with(|router| {
        let mut router = router.borrow_mut();
        setup::setup_dashboard_assets(
            &mut router,
            Some(vec!["https://mycanister.app".to_string()]),
        ).expect("Failed to setup dashboard");
        certified_data_set(router.root_hash());
    });
}
```

## Management Functions

Expose these in your canister to enable dashboard functionality:

### II Principal Management

```rust
use my_canister_dashboard::{
    ManageIIPrincipalArg, ManageIIPrincipalResult,
    guards::only_canister_controllers_guard,
};
use ic_cdk::update;

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}
```

### Alternative Origins Management

```rust,ignore
use my_canister_dashboard::{
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult,
    guards::only_canister_controllers_guard,
};
use ic_cdk::update;

#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    ASSET_ROUTER.with(|router| {
        my_canister_dashboard::manage_alternative_origins(&mut router.borrow_mut(), arg)
    })
}
```

### Automatic Top-up Rules

```rust
use my_canister_dashboard::{
    ManageTopUpRuleArg, ManageTopUpRuleResult,
    guards::only_ii_principal_guard,
};
use ic_cdk::update;

#[update(guard = "only_ii_principal_guard")]
fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    my_canister_dashboard::manage_top_up_rule(arg)
}
```

## Guards

Two guard functions for protecting endpoints:

- `only_canister_controllers_guard()` - Allows only canister controllers
- `only_ii_principal_guard()` - Allows only the configured II principal

```rust
use my_canister_dashboard::guards::{only_canister_controllers_guard, only_ii_principal_guard};
use ic_cdk::update;

#[update(guard = "only_canister_controllers_guard")]
fn admin_only_function() { /* ... */ }

#[update(guard = "only_ii_principal_guard")]
fn user_only_function() { /* ... */ }
```

## Asset Paths

The dashboard assets are served at these paths:

| Constant | Path |
|----------|------|
| `CANISTER_DASHBOARD_HTML_PATH` | `/canister-dashboard` |
| `CANISTER_DASHBOARD_JS_PATH` | `/canister-dashboard/index.js` |
| `CANISTER_DASHBOARD_CSS_PATH` | `/canister-dashboard/style.css` |
| `ALTERNATIVE_ORIGINS_PATH` | `/.well-known/ii-alternative-origins` |

## Vite Plugin

For local development, use [@web3nl/vite-plugin-canister-dapp](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp) to configure the development environment.

## License

MIT
