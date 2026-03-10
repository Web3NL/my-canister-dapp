# My Canister Dapp CLI

[![Crates.io](https://img.shields.io/crates/v/my-canister-dapp-cli)](https://crates.io/crates/my-canister-dapp-cli)
[![Documentation](https://docs.rs/my-canister-dapp-cli/badge.svg)](https://docs.rs/my-canister-dapp-cli)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

CLI tool (`dapp`) for deploying and testing user-owned dapps on the Internet Computer.

## Features

- **`dapp deploy`** — build, compress, and deploy a canister wasm to a fresh detached canister (includes Internet Identity authentication for canister ownership)
- **`dapp test`** — run acceptance tests against a wasm using [PocketIC](https://crates.io/crates/pocket-ic)
- In-process gzip compression (no system `gzip` dependency)
- Accepts both raw `.wasm` and pre-gzipped `.wasm.gz` files via `--wasm`
- Deployment log: each deploy appends a JSON line to `.dapp/deployments.jsonl`

## Installation

```bash
cargo install my-canister-dapp-cli
```

## Usage

Deploy a canister locally:

```bash
dapp deploy <canister-name>
```

Deploy with a pre-built wasm:

```bash
dapp deploy <canister-name> --wasm path/to/canister.wasm.gz
```

Run acceptance tests:

```bash
dapp test path/to/canister.wasm.gz
```

## Prerequisites

- [icp-cli](https://github.com/nicholasosaka/icp-cli) (`icp` command) installed and in PATH
- Local ICP network running for local deployments

## License

MIT
