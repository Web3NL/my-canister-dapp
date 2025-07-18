# My Canister Dapp

[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[![Canister Dashboard Crate](<https://img.shields.io/crates/v/my-canister-dashboard.svg?label=Canister%20Dashboard%20Crate>)](https://crates.io/crates/my-canister-dashboard)
[![Canister Frontend Crate](<https://img.shields.io/crates/v/my-canister-frontend.svg?label=Canister%20Frontend%20Crate>)](https://crates.io/crates/my-canister-frontend)
[![NPM](<https://img.shields.io/npm/v/@web3nl/my-canister-dashboard.svg?label=NPM>)](https://www.npmjs.com/package/@web3nl/my-canister-dashboard)

[![Canister Dashboard Crate Docs](<https://img.shields.io/docsrs/my-canister-dashboard?label=Canister%20Dashboard%20Crate%20Docs>)](https://docs.rs/my-canister-dashboard)
[![Canister Frontend Crate Docs](<https://img.shields.io/docsrs/my-canister-frontend?label=Canister%20Frontend%20Crate%20Docs>)](https://docs.rs/my-canister-frontend)
[![NPM Docs](<https://img.shields.io/badge/NPM%20Docs-GitHub%20Pages-blue>)](https://web3nl.github.io/my-canister-dapp/web3nl-my-canister-dashboard-js/)

This project provides libraries and tools to build Canister Dapps on the [Internet Computer](https://internetcomputer.org). A **Canister Dapp** is a single canister decentralized application that can be created and fully controlled with [Internet Identity](https://identity.internetcomputer.org).

Canister Dapps are developed as single canister applications that include both backend logic and frontend assets. Users can create, manage, and be the sole controller of these canisters without relying on any third-party services.

Visit [mycanister.app](https://mycanister.app) to create and manage your canister dapps.

## 🦀 My Canister Dashboard (Rust)

Dashboard assets and management utilities for Internet Computer Canister Dapps. A standard dashboard is provided to manage the Canister Dapp in the browser.

**Package:** [Crates.io](https://crates.io/crates/my-canister-dashboard) | [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-rs/my-canister-dashboard) | [Documentation](https://docs.rs/my-canister-dashboard)

## 📦 My Canister Dashboard (JavaScript)

Utility functions for canisters using My Canister Dashboard.
Provides client-side utilities for interacting with canister dashboards and managing Canister Dapps.

**Package:** [npm](https://www.npmjs.com/package/@web3nl/my-canister-dashboard) | [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-js/my-canister-dashboard-js) | [Documentation](https://web3nl.github.io/my-canister-dapp/web3nl-my-canister-dashboard-js/)

## 🦀 My Canister Frontend (Rust)

Frontend asset utilities for Canister Dapps to simplify the process of adding 'onboard' frontends to Canister Dapps.
Heavily relies on [ic-asset-certification](https://crates.io/crates/ic-asset-certification) and [ic-http-certification](https://crates.io/crates/ic-http-certification) crates.

**Package:** [Crates.io](https://crates.io/crates/my-canister-frontend) | [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-rs/my-canister-frontend) | [Documentation](https://docs.rs/my-canister-frontend)

## 🌐 My Canister App Service

User controlled canister creation tool and Wasm repository.
Provides a web interface for creating, installing, and managing decentralized applications on the Internet Computer.

**Website:** [mycanister.app](https://mycanister.app)

## 📚 Examples

Reference implementations including `my-hello-world` example.
Demonstrates how to build a complete canister dapp with frontend assets and dashboard integration.

## 🦀 Canister Dapp Test

Testing library for Canister Dapps on the Internet Computer.
Provides pocket-ic tests for Wasm modules and integration testing utilities.

**Package:** [Repository](https://github.com/Web3NL/my-canister-dapp/tree/main/my-canister-dapp-rs/canister-dapp-test)

## 🔧 Candid Interface

Current version of the required candid interface for Canister Dapps. To be extended by the canister dapp developer.

**Interface:** [my-canister.did](https://github.com/Web3NL/my-canister-dapp/blob/main/candid/my-canister.did)

## License

MIT
