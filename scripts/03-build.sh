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

# ================================================================
# 🔨 Frontend Assets (parallel)
# ================================================================
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

# ================================================================
# 📦 Canister Wasms
# ================================================================
echo "🔨 Building canister wasms with icp-cli..."
icp build wasm-registry my-hello-world my-notepad demos

echo "🗜️ Compressing wasm-registry..."
gzip -9 -c .icp/cache/artifacts/wasm-registry > wasm/wasm-registry.wasm.gz

echo "🗜️ Compressing my-hello-world..."
gzip -9 -c .icp/cache/artifacts/my-hello-world > wasm/my-hello-world.wasm.gz

echo "🗜️ Compressing my-notepad..."
gzip -9 -c .icp/cache/artifacts/my-notepad > wasm/my-notepad.wasm.gz

echo "🗜️ Compressing demos..."
gzip -9 -c .icp/cache/artifacts/demos > wasm/demos.wasm.gz

echo "✅ All wasms built and compressed"

# ================================================================
# 🔨 dapp CLI Binary
# ================================================================
echo "🔨 Building dapp CLI..."
cargo build -p my-canister-dapp-cli

echo "✅ Build phase complete!"
