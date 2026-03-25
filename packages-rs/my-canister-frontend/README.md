# My Canister Frontend

[![Crates.io](https://img.shields.io/crates/v/my-canister-frontend)](https://crates.io/crates/my-canister-frontend)
[![Documentation](https://docs.rs/my-canister-frontend/badge.svg)](https://docs.rs/my-canister-frontend)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Frontend asset processing library for canisters on the Internet Computer.

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
	setup_frontend(&ASSETS).expect("Failed to setup frontend");
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
- **Security headers**: 6 default security/privacy headers on all responses (X-Frame-Options, Referrer-Policy, Permissions-Policy, etc.)
- **Asset validation**: File type allowlist, 2 MiB − 16 KiB size limit, path traversal protection, duplicate detection
- **Gzip compression**: Automatic gzip for text-based assets (HTML, JS, CSS, JSON, SVG)
- **Configurable**: Use `FrontendConfig` to allow additional file types, suppress default headers, or add custom headers
- Exposes `with_asset_router` and `with_asset_router_mut` for direct access to the internal asset router
- Exposes `asset_router_configs` and `asset_router_configs_with_config` for building your own asset router pipeline

## Configuration

`FrontendConfig` controls which file types are accepted and what HTTP headers are sent with every response. All fields have sensible defaults — only set what you need, and use `..Default::default()` to fill in the rest.

### Allow additional file types

```rust,ignore
use ic_cdk::init;
use include_dir::{include_dir, Dir};
use my_canister_frontend::{setup_frontend_with_config, FrontendConfig};

static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dapp-frontend/dist");

#[init]
fn init() {
    let config = FrontendConfig {
        extra_allowed_extensions: vec!["webmanifest".to_string()],
        ..Default::default()
    };
    setup_frontend_with_config(&ASSETS, &config).expect("Failed to setup frontend");
}
```

### Default security headers

Every response includes these headers out of the box:

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `no-referrer` |
| `Permissions-Policy` | `accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()` |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

### Suppress a default header

Use `excluded_headers` with a `StandardHeader` variant to remove a specific default:

```rust,ignore
use my_canister_frontend::{setup_frontend_with_config, FrontendConfig, StandardHeader};

let config = FrontendConfig {
    excluded_headers: vec![StandardHeader::XFrameOptions],
    ..Default::default()
};
```

### Add or override headers

Use `extra_headers` to append headers to every response. If the name matches a default header (case-insensitive), the default is replaced rather than duplicated:

```rust,ignore
use my_canister_frontend::{setup_frontend_with_config, FrontendConfig};

let config = FrontendConfig {
    // Replaces the default X-Frame-Options: DENY
    extra_headers: vec![
        ("X-Frame-Options".to_string(), "SAMEORIGIN".to_string()),
        ("Content-Security-Policy".to_string(), "default-src 'self'".to_string()),
    ],
    ..Default::default()
};
```

To add HSTS on a custom domain:

```rust,ignore
let config = FrontendConfig {
    extra_headers: vec![(
        "Strict-Transport-Security".to_string(),
        "max-age=31536000; includeSubDomains".to_string(),
    )],
    ..Default::default()
};
```

## License

MIT
