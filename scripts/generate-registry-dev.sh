#!/bin/bash

set -e

echo "Creating registry-dev.json for development..."

REGISTRY_FILE="my-canister-app/static/wasm-registry/registry.json"
DEV_REGISTRY_FILE="my-canister-app/static/wasm-registry/registry-dev.json"
DEV_WASM_DIR="wasm/dev"

# Copy original registry to dev registry
cp "$REGISTRY_FILE" "$DEV_REGISTRY_FILE"

# Replace remote URLs with local dev paths in the dev registry
sed "s|https://raw.githubusercontent.com/Web3NL/my-canister-dapp/main/wasm|$DEV_WASM_DIR|g" "$DEV_REGISTRY_FILE" > "$DEV_REGISTRY_FILE.tmp"
mv "$DEV_REGISTRY_FILE.tmp" "$DEV_REGISTRY_FILE"

# Replace .wasm.gz with -dev.wasm.gz and .wasm with -dev.wasm in the dev registry
sed 's|\.wasm\.gz"|-dev.wasm.gz"|g; s|\.wasm"|-dev.wasm"|g' "$DEV_REGISTRY_FILE" > "$DEV_REGISTRY_FILE.tmp"
mv "$DEV_REGISTRY_FILE.tmp" "$DEV_REGISTRY_FILE"

echo "✅ Development registry created at $DEV_REGISTRY_FILE!"
