#!/bin/bash
set -euo pipefail

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "Unit testing vite-plugin-canister-dapp"
npm run test --workspace=@web3nl/vite-plugin-canister-dapp

echo "Unit testing canister-dashboard-frontend"
npm run test --workspace=canister-dashboard-frontend

echo "Unit testing my-canister-app"
npm run test --workspace=my-canister-app

echo "Acceptance testing my-hello-world"
cargo run -p canister-dapp-test -- wasm/my-hello-world.wasm.gz

echo "Acceptance testing my-notepad"
cargo run -p canister-dapp-test -- wasm/my-notepad.wasm.gz
