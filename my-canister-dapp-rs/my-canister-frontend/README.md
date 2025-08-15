# My Canister Frontend

[![Crates.io](https://img.shields.io/crates/v/my-canister-frontend)](https://crates.io/crates/my-canister-frontend)
[![Documentation](https://docs.rs/my-canister-frontend/badge.svg)](https://docs.rs/my-canister-frontend)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Frontend asset processing library for Internet Computer Canister Dapps.

## Usage

Single canister example (init + query):

```rust,ignore
use ic_cdk::{init, query};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_frontend::setup_frontend;

// Embed built frontend (e.g. dist/)
static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../my-hello-world-frontend/dist");

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

- Embedded assets via `include_dir`
- Automatic MIME type detection using `mime_guess`
- `index.html` auto-configured as fallback for `/`
- Certification using `ic-asset-certification`

## License

MIT
