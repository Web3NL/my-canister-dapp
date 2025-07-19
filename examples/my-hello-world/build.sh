#!/bin/bash
# This script should be run from within the examples/my-hello-world directory

set -e

# Check if dev argument is passed
DEV_MODE="$1"

echo "Building my-hello-world..."

# Build frontend
cd src/my-hello-world-frontend
if [ "$DEV_MODE" = "dev" ]; then
  npm run build:dev
else
  npm run build
fi
cd ../..

# Build Rust canister
cargo build --release --target wasm32-unknown-unknown --package my-hello-world --target-dir target

# Optimize WASM
ic-wasm target/wasm32-unknown-unknown/release/my_hello_world.wasm -o target/wasm32-unknown-unknown/release/my_hello_world_optimized.wasm optimize O3

# Shrink WASM
ic-wasm target/wasm32-unknown-unknown/release/my_hello_world_optimized.wasm -o target/wasm32-unknown-unknown/release/my-hello-world.wasm shrink

# Add Candid interface metadata
ic-wasm target/wasm32-unknown-unknown/release/my-hello-world.wasm -o target/wasm32-unknown-unknown/release/my-hello-world.wasm metadata candid:service -f src/my-hello-world/my-hello-world.did -v public

# Compress
# -k: keep original file
# -f: force overwrite existing .gz file
# -n: don't save original filename/timestamp (for deterministic builds)
gzip -kfn target/wasm32-unknown-unknown/release/my-hello-world.wasm

echo "✅ my-hello-world build complete!"