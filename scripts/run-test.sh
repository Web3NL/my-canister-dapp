#!/bin/bash

set -e

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "Wasm testing with canister-dapp-test"
cargo test -p canister-dapp-test
