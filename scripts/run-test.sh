#!/bin/bash

set -e

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "🧪 Running Canister Dapp Test"
./scripts/build-examples.sh
cargo test -p canister-dapp-test
