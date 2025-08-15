# My Canister Frontend

[![Crates.io](https://img.shields.io/crates/v/my-canister-frontend)](https://crates.io/crates/my-canister-frontend)
[![Documentation](https://docs.rs/my-canister-frontend/badge.svg)](https://docs.rs/my-canister-frontend)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Frontend asset processing library for Internet Computer Canister Dapps.

## Usage

Single canister example:

```rust,ignore
use ic_cdk::{init, query};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_frontend::setup_frontend;

static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dapp-frontend/dist");

#[init]
fn init() {
	setup_frontend(&ASSETS);
}

#[query]
fn http_request(req: HttpRequest) -> HttpResponse {
	my_canister_frontend::http_request(req)
}
```

## Features

- Implements internal [AssetRouter](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html) for managing frontend assets
- Embeds assets provided a `Dir` via [`include_dir`](https://docs.rs/include_dir/latest/include_dir/)
- Automatic MIME type detection using `mime_guess`
- `index.html` auto-configured as fallback for `/`
- Certification using [`ic-asset-certification`](https://docs.rs/ic-asset-certification)
- Exposes `with_asset_router` and `with_asset_router_mut` for access to the asset router, see example below.
- Exposes `asset_router_configs` if you want to implement your own asset router, see [this example](https://github.com/Web3NL/my-canister-dapp/blob/e8fdc0ac81f7bdc702418c05130ace3f9f5399fb/examples/my-hello-world/src/my-hello-world/src/lib.rs).

## Usage with [`my_canister_dashboard`](https://crates.io/crates/my-canister-dashboard)

```rust,ignore
use ic_cdk::{init, query};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::setup_dashboard_assets;
use my_canister_frontend::setup_frontend;
use my_canister_frontend::asset_router::with_asset_router_mut;

static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dapp-frontend/dist");

#[init]
fn init() {
	setup_frontend(&ASSETS);

    // Setup dashboard in internal asset router
    with_asset_router_mut(|router| {
        setup_dashboard_assets(
            router,
            Some(vec![
                "https://mycanister.app".to_string(),
            ]),
        );
    });
}

#[query]
fn http_request(req: HttpRequest) -> HttpResponse {
	my_canister_frontend::http_request(req)
}
```

## License

MIT
