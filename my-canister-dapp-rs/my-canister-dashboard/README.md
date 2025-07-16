# My Canister Dashboard

[![Crates.io](https://img.shields.io/crates/v/my-canister-dashboard)](https://crates.io/crates/my-canister-dashboard)
[![Documentation](https://docs.rs/my-canister-dashboard/badge.svg)](https://docs.rs/my-canister-dashboard)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A self-contained dashboard for Internet Computer canisters that provides essential monitoring and management capabilities.

## ⚠️ Beta Warning

**This crate is in BETA and NOT PRODUCTION READY.**

- API may change without notice
- Not recommended for production use
- Use at your own risk
- Feedback and contributions welcome

## Features

- Canister status monitoring
- Balance and cycles tracking
- Controller management
- Top-up functionality
- Alternative origins configuration

## Usage

Integrate the dashboard assets into your canister:

```rust
use ic_asset_certification::AssetRouter;
use my_canister_dashboard::setup_dashboard_assets;

let mut router = AssetRouter::default();
setup_dashboard_assets(&mut router).expect("Failed to setup dashboard");
```

## License

MIT
