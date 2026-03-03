# My Canister Dapp Test

[![Crates.io](https://img.shields.io/crates/v/my-canister-dapp-test)](https://crates.io/crates/my-canister-dapp-test)
[![Documentation](https://docs.rs/my-canister-dapp-test/badge.svg)](https://docs.rs/my-canister-dapp-test)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Acceptance suite for user-owned dapps built with [`my-canister-dashboard`](https://crates.io/crates/my-canister-dashboard).

Validates that a WASM module correctly implements every endpoint in the dashboard interface:

- **`http_request`** — certified asset serving (dashboard HTML/JS/CSS, 404 handling, CSP headers)
- **`wasm_status`** — dapp metadata (name, version, memo)
- **`manage_ii_principal`** — Internet Identity principal CRUD + controller guard
- **`manage_alternative_origins`** — II alternative origins CRUD + origin validation
- **`manage_top_up_rule`** — auto top-up rule CRUD + timer-driven ICP→cycles minting

Each WASM is installed into a fresh [PocketIC](https://crates.io/crates/pocket-ic) canister with ICP Ledger and CMC system canisters for end-to-end top-up testing.

## Usage

```bash
my-canister-dapp-test path/to/my-dapp.wasm.gz
```

Or via cargo:

```bash
cargo run -p my-canister-dapp-test -- path/to/my-dapp.wasm.gz
```

## License

MIT
