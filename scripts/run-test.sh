#!/bin/bash

set -e

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "🧪 Running Canister Dapp Test"
DAPP_BUILD_MODE=prod dfx build my-hello-world
DAPP_BUILD_MODE=prod ./scripts/copy-example-wasm.sh

cargo test -p canister-dapp-test
