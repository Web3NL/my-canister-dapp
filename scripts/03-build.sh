#!/bin/bash
set -euo pipefail

# Phase 3: Build all frontend assets and Rust canister wasms.
# The orchestrator (validate-and-test-all.sh) handles background tasks like
# pre-compiling my-canister-dapp-test across phase boundaries.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# 📝 Load test env vars so frontend builds use correct identity provider URL
if [ -f tests/test.env ]; then
  source_env tests/test.env
fi

# 🔨 Build all frontend assets in parallel
echo "🔨 Building frontend assets in parallel..."
./scripts/prebuild-mcd.sh &
pid_mcd=$!
npm run build --workspace=my-hello-world-frontend &
pid_hw=$!
npm run build --workspace=my-notepad-frontend &
pid_np=$!
wait $pid_mcd
wait $pid_hw
wait $pid_np
echo "✅ Frontend assets built"

# 📦 Batch-build all Rust canister wasms
echo "📦 Batch-building all canister wasms..."
./scripts/build-all-wasm.sh

# 🔨 Build the dapp CLI binary (required by setup-dashboard-dev-env.sh)
echo "🔨 Building dapp CLI..."
cargo build -p my-canister-dapp-cli

echo "✅ Build phase complete!"
