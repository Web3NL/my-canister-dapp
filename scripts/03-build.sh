#!/bin/bash
set -euo pipefail

# Phase 3: Build all frontend assets and Rust canister wasms.
# The orchestrator (validate-and-test-all.sh) handles background tasks like
# pre-compiling canister-dapp-test across phase boundaries.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# Source test env vars so frontend builds use correct identity provider URL
if [ -f tests/test.env ]; then
  set -a
  source tests/test.env
  set +a
fi

# Build all frontend assets in parallel
echo "Building frontend assets..."
./scripts/prebuild-mcd.sh &
pid_mcd=$!
npm run build --workspace=my-hello-world-frontend &
pid_hw=$!
npm run build --workspace=my-notepad-frontend &
pid_np=$!
wait $pid_mcd $pid_hw $pid_np

# Batch-build all Rust canister wasms
echo "Batch-building all canister wasms..."
./scripts/build-all-wasm.sh

echo "Build phase complete!"
