#!/bin/bash

set -e

echo "Unit testing my-canister-dashboard"
npm run test --workspace=@web3nl/my-canister-dashboard

echo "🧪 Setting up PocketIC environment"
# Set POCKET_IC_BIN environment variable based on platform
if [[ -n "$CI" ]]; then
    export POCKET_IC_BIN="$(pwd)/bin/pocket-ic/linux/pocket-ic"
    echo "Using PocketIC binary for CI: $POCKET_IC_BIN"
else
    export POCKET_IC_BIN="$(pwd)/bin/pocket-ic/darwin/pocket-ic"
    echo "Using PocketIC binary for macOS: $POCKET_IC_BIN"
fi

echo "🧪 Running Canister Dapp Test"
./scripts/build-examples.sh
cargo test -p canister-dapp-test
