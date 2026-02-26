#!/bin/bash
set -euo pipefail

# Run JS unit tests in parallel
echo "Running JS unit tests in parallel..."
npm run test --workspace=@web3nl/my-canister-dashboard &
pid1=$!
npm run test --workspace=@web3nl/vite-plugin-canister-dapp &
pid2=$!
npm run test --workspace=canister-dashboard-frontend &
pid3=$!
npm run test --workspace=my-canister-app &
pid4=$!
wait $pid1 $pid2 $pid3 $pid4
echo "JS unit tests passed"

# Acceptance tests run sequentially (each uses PocketIC)
echo "Acceptance testing my-hello-world"
cargo run -p canister-dapp-test -- wasm/my-hello-world.wasm.gz

echo "Acceptance testing my-notepad"
cargo run -p canister-dapp-test -- wasm/my-notepad.wasm.gz
