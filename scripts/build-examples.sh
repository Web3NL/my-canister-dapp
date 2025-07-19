#!/bin/bash

set -e

# Check if dev argument is passed
DEV_MODE="$1"

if [ "$DEV_MODE" = "dev" ]; then
  echo "Building examples for development..."
  export DFX_NETWORK="local"
  REGISTRY_DIR="wasm/dev"
  WASM_SUFFIX="-dev"
else
  echo "Building examples for production..."
  export DFX_NETWORK="ic"
  REGISTRY_DIR="wasm"
  WASM_SUFFIX=""
fi

# Build my-hello-world example using dfx (always use local network for building)
echo "Building my-hello-world canister with dfx..."
dfx build my-hello-world --network local

# Copy WASM to registry (dfx handles optimization, shrinking, and compression)
echo "Copying WASM to registry..."
mkdir -p "$REGISTRY_DIR"

# dfx stores the optimized and compressed WASM in .dfx/local/canisters/my-hello-world/
CANISTER_DIR=".dfx/local/canisters/my-hello-world"
cp "$CANISTER_DIR/my-hello-world.wasm.gz" "$REGISTRY_DIR/my-hello-world$WASM_SUFFIX.wasm.gz"

echo "✅ Examples built successfully!"