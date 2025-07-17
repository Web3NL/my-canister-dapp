#!/bin/bash

set -e

echo "Building WASM files for development..."

# Build canister-dashboard-frontend for development
echo "Building canister-dashboard-frontend (dev)..."
npm run build:dev --workspace=canister-dashboard-frontend

# Build my-hello-world canister
echo "Building my-hello-world canister..."
./examples/my-hello-world/build.sh

# Copy WASM to dev registry
echo "Copying WASM to dev registry..."
mkdir -p wasm/dev
cp target/wasm32-unknown-unknown/release/my-hello-world.wasm wasm/dev/my-hello-world-dev.wasm
cp target/wasm32-unknown-unknown/release/my-hello-world.wasm.gz wasm/dev/my-hello-world-dev.wasm.gz

# Build canister-dashboard-frontend for production again to ensure dist/ contains production files
echo "Building canister-dashboard-frontend (prod)..."
npm run build --workspace=canister-dashboard-frontend

echo "✅ All WASM files built and copied to dev registry!"