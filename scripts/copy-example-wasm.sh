#!/bin/bash
set -euo pipefail

echo "Copying WASM to registry..."

# Copy to root wasm directory (for vite dev server)
mkdir -p wasm
cp .dfx/local/canisters/my-hello-world/my-hello-world.wasm.gz wasm/my-hello-world.wasm.gz

# Copy to static directory (for production build)
mkdir -p my-canister-app/static/wasm
cp .dfx/local/canisters/my-hello-world/my-hello-world.wasm.gz my-canister-app/static/wasm/my-hello-world.wasm.gz

echo "✅ Example wasm copied successfully!"
