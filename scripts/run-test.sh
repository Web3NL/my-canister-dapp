#!/bin/bash
set -euo pipefail

# Run all unit tests (JS + Rust) in parallel, then acceptance tests sequentially.

echo "Running unit tests (JS + Rust) in parallel..."
npm run test --workspace=@web3nl/my-canister-dashboard &
pid1=$!
npm run test --workspace=@web3nl/vite-plugin-canister-dapp &
pid2=$!
npm run test --workspace=canister-dashboard-frontend &
pid3=$!
npm run test --workspace=my-canister-app &
pid4=$!
cargo test --workspace --exclude canister-dapp-test --exclude demos-test &
pid5=$!
wait $pid1 $pid2 $pid3 $pid4 $pid5
echo "Unit tests passed"

# Acceptance tests run sequentially (each uses PocketIC)
# Uses cargo run which reuses the pre-compiled binary from 03-build.sh
echo "Acceptance testing my-hello-world"
cargo run -p canister-dapp-test -- wasm/my-hello-world.wasm.gz

echo "Acceptance testing my-notepad"
cargo run -p canister-dapp-test -- wasm/my-notepad.wasm.gz

echo "Acceptance testing demos canister"
cargo run -p demos-test
