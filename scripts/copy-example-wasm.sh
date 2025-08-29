#!/bin/bash

set -e

if [ "$DAPP_BUILD_MODE" = "dev" ]; then
  echo "Building examples for development..."
  REGISTRY_DIR="wasm/dev"
  WASM_SUFFIX="-dev"
else
  echo "Building examples for production..."
  REGISTRY_DIR="wasm"
  WASM_SUFFIX=""
fi

WASM_FILE=".dfx/local/canisters/my-hello-world/my-hello-world.wasm.gz"

# Copy WASM to registry
echo "Copying WASM to registry..."
mkdir -p "$REGISTRY_DIR"
cp "$WASM_FILE" "$REGISTRY_DIR/my-hello-world$WASM_SUFFIX.wasm.gz"

# Copy wasm files to my-canister-app static folder for dev mode
if [ "$DAPP_BUILD_MODE" = "dev" ]; then
  echo "Copying WASM files to my-canister-app static directory..."
  STATIC_WASM_DIR="my-canister-app/static/wasm"
  mkdir -p "$STATIC_WASM_DIR"
  cp -r "$REGISTRY_DIR" "$STATIC_WASM_DIR/"
  echo "✅ WASM files copied to $STATIC_WASM_DIR/dev/"
fi

echo "✅ Example wasm copied successfully!"