#!/bin/bash
set -euo pipefail

echo "Creating registry-dev.json for development..."

REGISTRY_FILE="my-canister-app/static/wasm-registry/registry.json"
DEV_REGISTRY_FILE="my-canister-app/static/wasm-registry/registry-dev.json"

# Copy original registry and replace GitHub URLs with relative wasm/ path
sed -E 's|https://raw.githubusercontent.com/Web3NL/my-canister-dapp/[a-f0-9]+/wasm/|wasm/|g; s|https://raw.githubusercontent.com/Web3NL/my-canister-dapp/main/wasm/|wasm/|g' "$REGISTRY_FILE" > "$DEV_REGISTRY_FILE"

echo "✅ Development registry created at $DEV_REGISTRY_FILE!"
