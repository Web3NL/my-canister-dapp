#!/bin/bash

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

# Compress WASM
gzip -kf target/wasm32-unknown-unknown/release/my-hello-world.wasm

echo "✅ my-hello-world build complete!"