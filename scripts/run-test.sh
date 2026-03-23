#!/bin/bash
set -euo pipefail

# Run all unit tests (JS + Rust) in parallel, then acceptance tests sequentially.
# Accepts --skip-acceptance to skip acceptance tests.

# 🚩 Parse flags
SKIP_ACCEPTANCE="false"
if [[ "$*" == *"--skip-acceptance"* ]]; then SKIP_ACCEPTANCE="true"; fi

# 🧪 Run unit tests (JS + Rust) in parallel
echo "🧪 Running unit tests (JS + Rust) in parallel..."
npm run test --workspace=@web3nl/my-canister-dashboard &
pid1=$!
npm run test --workspace=@web3nl/vite-plugin-canister-dapp &
pid2=$!
npm run test --workspace=canister-dashboard-frontend &
pid3=$!
npm run test --workspace=icp-dapp-launcher &
pid4=$!
cargo test --workspace --exclude demos-test &
pid5=$!
wait $pid1
wait $pid2
wait $pid3
wait $pid4
wait $pid5
echo "✅ Unit tests passed"

# 🧪 Acceptance tests (sequential — each uses PocketIC)
if [ "$SKIP_ACCEPTANCE" = "true" ]; then
  echo "⏭️ Acceptance tests skipped"
else
  echo "🧪 Acceptance testing my-hello-world..."
  cargo run -p my-canister-dapp-cli -- test wasm/my-hello-world.wasm.gz

  echo "🧪 Acceptance testing my-notepad..."
  cargo run -p my-canister-dapp-cli -- test wasm/my-notepad.wasm.gz

  echo "🧪 Acceptance testing demos canister..."
  cargo run -p demos-test
fi
