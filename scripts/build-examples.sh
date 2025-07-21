#!/bin/bash

set -e

# Check if dev argument is passed
DEV_MODE="$1"

if [ "$DEV_MODE" = "dev" ]; then
  echo "Building examples for development..."
  export DAPP_BUILD_MODE="dev"
  REGISTRY_DIR="wasm/dev"
  WASM_SUFFIX="-dev"
else
  echo "Building examples for production..."
  export DAPP_BUILD_MODE="prod"
  REGISTRY_DIR="wasm"
  WASM_SUFFIX=""
fi

# Build my-hello-world example
echo "Building my-hello-world canister"
cargo build --release --target wasm32-unknown-unknown -p my-hello-world

# Process WASM with ic-wasm
echo "Optimizing WASM with ic-wasm..."
cargo install ic-wasm
WASM_FILE="target/wasm32-unknown-unknown/release/my_hello_world.wasm"

# Optimize for small code size
ic-wasm "$WASM_FILE" -o "$WASM_FILE" optimize Oz

# Shrink
ic-wasm "$WASM_FILE" -o "$WASM_FILE" shrink

# Add metadata (if candid file exists)
ic-wasm "$WASM_FILE" -o "$WASM_FILE" metadata candid:service -f examples/my-hello-world/src/my-hello-world/my-hello-world.did -v public

# Gzip the processed WASM
gzip -c "$WASM_FILE" > "$WASM_FILE.gz"

# Copy WASM to registry
echo "Copying WASM to registry..."
mkdir -p "$REGISTRY_DIR"
cp "$WASM_FILE.gz" "$REGISTRY_DIR/my-hello-world$WASM_SUFFIX.wasm.gz"

echo "✅ Examples built successfully!"