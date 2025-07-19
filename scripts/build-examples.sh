#!/bin/bash

set -e

# Check if dev argument is passed
DEV_MODE="$1"

if [ "$DEV_MODE" = "dev" ]; then
  echo "Building examples for development..."
  export DAPP_BUILD_MODE=dev
  REGISTRY_DIR="wasm/dev"
  WASM_SUFFIX="-dev"
else
  echo "Building examples for production..."
  export DAPP_BUILD_MODE=prod
  REGISTRY_DIR="wasm"
  WASM_SUFFIX=""
fi

# Build my-hello-world example
echo "Building my-hello-world canister..."
cargo build -p my-hello-world --release --target wasm32-unknown-unknown

# Optimize WASM
echo "Optimizing WASM..."
ic-wasm target/wasm32-unknown-unknown/release/my_hello_world.wasm -o target/wasm32-unknown-unknown/release/my_hello_world_optimized.wasm optimize O3

# Shrink WASM
echo "Shrinking WASM..."
ic-wasm target/wasm32-unknown-unknown/release/my_hello_world_optimized.wasm -o target/wasm32-unknown-unknown/release/my-hello-world.wasm shrink

# Add Candid interface metadata
echo "Adding Candid metadata..."
ic-wasm target/wasm32-unknown-unknown/release/my-hello-world.wasm -o target/wasm32-unknown-unknown/release/my-hello-world.wasm metadata candid:service -f examples/my-hello-world/src/my-hello-world/my-hello-world.did -v public

# Compress
echo "Compressing WASM..."
# -k: keep original file
# -f: force overwrite existing .gz file
# -n: don't save original filename/timestamp (for deterministic builds)
gzip -kfn target/wasm32-unknown-unknown/release/my-hello-world.wasm

# Copy WASM to registry
echo "Copying WASM to registry..."
mkdir -p "$REGISTRY_DIR"
cp target/wasm32-unknown-unknown/release/my-hello-world.wasm "$REGISTRY_DIR/my-hello-world$WASM_SUFFIX.wasm"
cp target/wasm32-unknown-unknown/release/my-hello-world.wasm.gz "$REGISTRY_DIR/my-hello-world$WASM_SUFFIX.wasm.gz"

echo "✅ Examples built successfully!"