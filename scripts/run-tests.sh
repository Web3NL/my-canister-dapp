#!/bin/bash

set -e

echo "Testing canister dashboard frontend"
npx playwright install 

npm run test --workspace=canister-dashboard-frontend
npm run test:e2e

echo "🧪 Running My Wasm Test"
cargo test -p my-wasm-test
