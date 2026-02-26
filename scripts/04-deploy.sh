#!/bin/bash
set -euo pipefail

# Phase 4: Deploy all canisters, set up II principals and controllers,
# upload wasms to registry, build and deploy the installer app.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# Source test env for canister IDs and identity provider URL
set -a
source tests/test.env
set +a

# --- Deploy example canisters ---
echo "Deploying wasm-registry canister..."
icp canister create wasm-registry -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install wasm-registry --wasm wasm/wasm-registry.wasm.gz -e local --identity ident-1

echo "Deploying my-hello-world canister..."
icp canister create my-hello-world -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install my-hello-world --wasm wasm/my-hello-world.wasm.gz -e local --identity ident-1

echo "Deploying my-notepad canister..."
icp canister create my-notepad -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install my-notepad --wasm wasm/my-notepad.wasm.gz -e local --identity ident-1

# --- Dashboard setup (II principals, controllers) ---
echo "Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh

# --- Upload wasms to registry ---
echo "Uploading my-hello-world WASM to registry..."
./scripts/upload-wasm-to-registry.sh \
  "my-hello-world" \
  "The Internet Computer Hello World Dapp" \
  "5.0.0" \
  "wasm/my-hello-world.wasm.gz" \
  -e local --identity ident-1

echo "Uploading my-notepad WASM to registry..."
./scripts/upload-wasm-to-registry.sh \
  "my-notepad" \
  "A personal notepad on the Internet Computer" \
  "1.0.0" \
  "wasm/my-notepad.wasm.gz" \
  -e local --identity ident-1

# --- Build and deploy installer app ---
# Re-run write-test-env.sh now that all canisters exist (IDs are discoverable)
./scripts/write-test-env.sh

# Re-source with all canister IDs available
set -a
source tests/test.env
set +a

echo "Building and deploying my-canister-app..."
npm run build --workspace=my-canister-app
icp deploy my-canister-app -e local

# Final write-test-env.sh to capture my-canister-app canister ID
./scripts/write-test-env.sh

echo "All canisters deployed!"
