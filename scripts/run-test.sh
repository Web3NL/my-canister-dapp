#!/bin/bash
set -euo pipefail

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "Unit testing vite-plugin-canister-dapp"
npm run test --workspace=@web3nl/vite-plugin-canister-dapp

echo "Unit testing my-canister-installer"
npm run test --workspace=@web3nl/my-canister-installer

echo "Unit testing canister-dashboard-frontend"
npm run test --workspace=canister-dashboard-frontend

echo "Unit testing my-canister-app"
npm run test --workspace=my-canister-app

echo "Unit testing my-canister-dashboard (Rust)"
cargo test -p my-canister-dashboard

echo "Unit testing my-canister-frontend (Rust)"
cargo test -p my-canister-frontend

echo "Wasm testing with canister-dapp-test"
cargo test -p canister-dapp-test
