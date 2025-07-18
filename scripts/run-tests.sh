#!/bin/bash

set -e

echo "Testing canister dashboard frontend"
npm run test --workspace=canister-dashboard-frontend
# npm run test:e2e

echo "🧪 Running Canister Dapp Test"
cargo test -p canister-dapp-test
