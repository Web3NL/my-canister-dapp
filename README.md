# My Canister Dapp

This project provides libraries and tools to build Canister Dapps on the [Internet Computer](https://internetcomputer.org). A **Canister Dapp** is a single canister decentralized application that can be created and fully controlled with [Internet Identity](https://identity.internetcomputer.org).

Canister Dapps are developed as single canister applications that include both backend logic and frontend assets. Users can create, manage, and be the sole controller of these canisters without relying on any third-party services.

Visit [mycanister.app](https://mycanister.app) to create and manage your canister dapps.

## My Canister Dashboard (Rust)

Dashboard assets and management utilities for Internet Computer Canister Dapps. A standard dashboard is provided to manage the Canister Dapp in the browser.

**Package:** [Crates.io](https://crates.io/crates/my-canister-dashboard) | [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-rs/my-canister-dashboard)

## My Canister Dashboard (JavaScript)

Utility functions for canisters using My Canister Dashboard.
Provides client-side utilities for interacting with canister dashboards and managing Canister Dapps.

**Package:** [npm](https://www.npmjs.com/package/@web3nl/my-canister-dashboard) | [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-js/my-canister-dashboard-js)

## My Canister Frontend (Rust)

Frontend asset utilities for Canister Dapps to simplify the process of adding 'onboard' frontends to Canister Dapps.
Heavily relies on [ic-asset-certification](https://crates.io/crates/ic-asset-certification) and [ic-http-certification](https://crates.io/crates/ic-http-certification) crates.

**Package:** [Crates.io](https://crates.io/crates/my-canister-frontend) | [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-rs/my-canister-frontend)

## My Canister App Service

User controlled canister creation tool and Wasm repository.
Provides a web interface for creating, installing, and managing decentralized applications on the Internet Computer.

**Website:** [mycanister.app](https://mycanister.app)

## Examples

Reference implementations including `my-hello-world` example.
Demonstrates how to build a complete canister dapp with frontend assets and dashboard integration.

## Canister Dapp Test

Testing library for Canister Dapps on the Internet Computer.
Provides pocket-ic tests for Wasm modules and integration testing utilities.

**Package:** [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-rs/canister-dapp-test)

## Candid Interface

Current version of the required candid interface for Canister Dapps. To be extended by the canister dapp developer.

**Interface:** [my-canister.did](https://github.com/Web3NL/my-canister-dapp/blob/main/candid/my-canister.did)

## License

MIT
