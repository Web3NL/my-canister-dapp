#!/bin/bash
set -euo pipefail

# Phase 4: Deploy all canisters, set up II principals and controllers,
# upload wasms to registry, build and deploy the installer app.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# 📝 Load test env for canister IDs and identity provider URL
source_env tests/test.env

# --- 🚀 Deploy example canisters ---
echo "🚀 Deploying wasm-registry canister..."
icp canister create wasm-registry -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install wasm-registry --wasm wasm/wasm-registry.wasm.gz -e local --identity ident-1

echo "🚀 Deploying my-hello-world canister..."
icp canister create my-hello-world -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install my-hello-world --wasm wasm/my-hello-world.wasm.gz -e local --identity ident-1

echo "🚀 Deploying my-notepad canister..."
icp canister create my-notepad -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install my-notepad --wasm wasm/my-notepad.wasm.gz -e local --identity ident-1

echo "🚀 Deploying demos canister..."
# Demos needs extra cycles to create sub-canisters for the demo pool
DEMOS_CYCLES="5000000000000"
icp canister create demos -e local --identity ident-1 --cycles "$DEMOS_CYCLES"
icp canister install demos --wasm wasm/demos.wasm.gz -e local --identity ident-1

# 🚀 Create icp-dapp-launcher canister early so its ID is available for II principal derivation
echo "🚀 Creating icp-dapp-launcher canister..."
icp canister create icp-dapp-launcher -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"

# 📝 Re-write test.env so the icp-dapp-launcher canister ID is discoverable
./scripts/write-test-env.sh

# --- 🎯 Dashboard setup (II principals, controllers) ---
echo "🎯 Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh

# --- 📤 Upload wasms to registry ---
echo "📤 Uploading my-hello-world WASM to registry..."
./scripts/upload-wasm-to-registry.sh \
  "my-hello-world" \
  "The Internet Computer Hello World Dapp" \
  "5.0.0" \
  "wasm/my-hello-world.wasm.gz" \
  -e local --identity ident-1

echo "📤 Uploading my-notepad WASM to registry..."
./scripts/upload-wasm-to-registry.sh \
  "my-notepad" \
  "A personal notepad on the Internet Computer" \
  "1.0.0" \
  "wasm/my-notepad.wasm.gz" \
  -e local --identity ident-1

# --- 🚀 Build and deploy installer app ---
# Re-run write-test-env.sh now that all canisters exist (IDs are discoverable)
./scripts/write-test-env.sh

# 📝 Re-source with all canister IDs available
source_env tests/test.env

echo "🚀 Building and deploying icp-dapp-launcher..."
npm run build --workspace=icp-dapp-launcher
icp deploy icp-dapp-launcher -e local --identity ident-1

# 📝 Final write-test-env.sh to capture icp-dapp-launcher canister ID
./scripts/write-test-env.sh

# --- 🎯 Configure demos canister for testing ---
echo "🎯 Configuring demos canister..."

# 📝 Re-source to get all IDs
source_env tests/test.env

INSTALLER_ORIGIN="http://${VITE_ICP_DAPP_LAUNCHER_CANISTER_ID}.localhost:8080"

icp canister call demos configure "(record {
  wasm_registry_id = principal \"$VITE_WASM_REGISTRY_CANISTER_ID\";
  trial_duration_ns = 300000000000 : nat64;
  pool_target_size = 2 : nat32;
  cycles_per_demo_canister = 1000000000000 : nat;
  installer_origin = \"$INSTALLER_ORIGIN\"
})" -e local --identity ident-1

echo "🎯 Replenishing demos pool..."
icp canister call demos replenish_pool "()" -e local --identity ident-1

echo "🎟️ Generating demo access codes for E2E tests..."
CODES_RESULT=$(icp canister call demos generate_access_codes "(5 : nat32)" -e local --identity ident-1)

FIRST_CODE=$(echo "$CODES_RESULT" | grep -oE '[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}' | head -1)
if [ -n "$FIRST_CODE" ]; then
  mkdir -p tests/output
  echo -n "$FIRST_CODE" > tests/output/demo-access-code
  echo "🎟️ Saved demo access code: $FIRST_CODE"
else
  echo "⚠️ WARNING: Could not extract access code from result: $CODES_RESULT"
fi

echo "✅ All canisters deployed!"
