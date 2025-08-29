# My Canister Dashboard

[![Crates.io](https://img.shields.io/crates/v/my-canister-dashboard)](https://crates.io/crates/my-canister-dashboard)
[![Documentation](https://docs.rs/my-canister-dashboard/badge.svg)](https://docs.rs/my-canister-dashboard)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Dashboard assets and management utilities for Internet Computer Canister Dapps.

Integrates with [`AssetRouter`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html) for asset certification.

## Usage

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
        );
        certified_data_set(router.root_hash());
    });
}
```

## Vite Plugin Canister Dapp

The My Canister Dashboard determines its development environment at runtime by fetching `/canister-dashboard-dev-config.json`. To run the dashboard in dev mode locally, we can use [vite-plugin-canister-dapp](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp).

## License

MIT
