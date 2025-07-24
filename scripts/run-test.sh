#!/bin/bash

set -e

echo "Unit testing canister dashboard frontend"
npm run test --workspace=canister-dashboard-frontend

echo "🧪 Running Canister Dapp Test"
./scripts/build-examples.sh
cargo test -p canister-dapp-test
