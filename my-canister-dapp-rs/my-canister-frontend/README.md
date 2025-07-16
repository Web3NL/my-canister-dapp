# my-canister-frontend

Frontend asset processing library for Internet Computer canisters.

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
