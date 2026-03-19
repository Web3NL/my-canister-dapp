# My Canister Dapp

Fully owned on-chain dapps with just Internet Identity — no CLI, no dev tools, just a browser.

[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Release/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![Docs](https://img.shields.io/badge/docs-docs-blue)](https://github.com/Web3NL/my-canister-dapp/tree/main/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **Status**: Active development. Demos will be available at [mycanister.app](https://mycanister.app).

## The Handoff Problem

On the Internet Computer, a single canister can be a complete application — backend, frontend, and storage in one self-contained unit. But there's no way for a non-technical user to create and own one of these canisters from a browser.

There's also a subtle identity problem: Internet Identity derives a *different principal* for each domain. A user who authenticates at a launcher app gets one identity. When they visit their new canister at its own domain, they get a *different* identity. So how do you hand off ownership?

## The Solution

This project provides the libraries and tooling to create **user-owned canisters** — dapps that anyone can install and fully own on the Internet Computer using only a browser and Internet Identity.

After creating a canister, we re-authenticate the user with Internet Identity *at the new canister's domain*. This produces the principal they'll always have when visiting their dapp — and that principal becomes the controller. The launcher steps away. The user fully owns their canister.

### The flow

1. **Fund** — User sends ICP to their account at the launcher
2. **Launch** — A new canister is created and the dapp is installed
3. **Own** — User authenticates with II at the new canister's domain. That principal becomes the controller. The canister is theirs.

The user now manages their dapp directly at `<canister-id>.icp0.io/canister-dashboard` — cycles, upgrades, controllers, all from the browser.

## mycanister.app

[mycanister.app](https://mycanister.app) is the reference launcher and dapp registry. Browse available dapps, launch them as your own canister, and manage them — all with Internet Identity.

## For Developers

This is a monorepo containing Rust crates, npm packages, deployable canisters, and example dapps. See [CLAUDE.md](CLAUDE.md) for the full project map, architecture, and commands. Check out [examples/my-hello-world](examples/my-hello-world/) for a minimal implementation.

## License

MIT
