#!/bin/bash

set -e

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "Unit testing vite-plugin-canister-dapp"
npm run test --workspace=@web3nl/vite-plugin-canister-dapp

echo "Unit testing canister-dashboard-frontend"
npm run test --workspace=canister-dashboard-frontend

echo "Wasm testing with canister-dapp-test"
cargo test -p canister-dapp-test
