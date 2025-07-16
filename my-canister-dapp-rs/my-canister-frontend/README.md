# My Canister Frontend

[![Crates.io](https://img.shields.io/crates/v/my-canister-frontend)](https://crates.io/crates/my-canister-frontend)
[![Documentation](https://docs.rs/my-canister-frontend/badge.svg)](https://docs.rs/my-canister-frontend)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Frontend asset processing library for Internet Computer Canister Dapps.

## Usage

```rust
use include_dir::{include_dir, Dir};
use my_canister_frontend::asset_router_configs;

static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/assets");

let (assets, configs) = asset_router_configs(&ASSETS);
// Use with AssetRouter.certify_assets(assets, configs)
```

## Features

- Automatic MIME type detection using `mime_guess`
- Configures `index.html` as fallback for `/` route
- Returns `AssetConfig::File` configurations for all assets

## License

MIT
