#!/bin/bash
# This script should be run from the monorepo root directory

set -e

echo "Building my-hello-world..."

# Build frontend
npm run build --workspace=my-hello-world-frontend

# Build Rust canister
cargo build --release --target wasm32-unknown-unknown --package my-hello-world

# Optimize WASM
ic-wasm target/wasm32-unknown-unknown/release/my_hello_world.wasm -o target/wasm32-unknown-unknown/release/my_hello_world_optimized.wasm optimize O3

# Shrink WASM
ic-wasm target/wasm32-unknown-unknown/release/my_hello_world_optimized.wasm -o target/wasm32-unknown-unknown/release/my-hello-world.wasm shrink

# Add Candid interface metadata
ic-wasm target/wasm32-unknown-unknown/release/my-hello-world.wasm -o target/wasm32-unknown-unknown/release/my-hello-world.wasm metadata candid:service -f examples/my-hello-world/src/my-hello-world/my-hello-world.did -v public

# Compress
# -k: keep original file
# -f: force overwrite existing .gz file
# -n: don't save original filename/timestamp (for deterministic builds)
gzip -kfn target/wasm32-unknown-unknown/release/my-hello-world.wasm

echo "✅ my-hello-world build complete!"