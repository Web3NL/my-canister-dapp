#!/bin/bash

set -e

echo "Building WASM files for production..."

# Build canister-dashboard-frontend for production
echo "Building canister-dashboard-frontend..."
npm run build --workspace=canister-dashboard-frontend
./scripts/copy-dashboard-assets-to-crate.sh

# Build my-hello-world canister
echo "Building my-hello-world canister..."
cd examples/my-hello-world
./build.sh
cd ../..

# Copy WASM to production registry
echo "Copying WASM to production registry..."
mkdir -p wasm
cp examples/my-hello-world/target/wasm32-unknown-unknown/release/my-hello-world.wasm wasm/my-hello-world.wasm
cp examples/my-hello-world/target/wasm32-unknown-unknown/release/my-hello-world.wasm.gz wasm/my-hello-world.wasm.gz

echo "✅ All WASM files built and copied to production registry!"