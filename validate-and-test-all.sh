#!/bin/bash
set -euo pipefail

# Source shared constants
source "$(dirname "$0")/scripts/constants.sh"

# Minimal total runtime reporting (MM:SS)
SCRIPT_START_TIME=$(date +%s)
print_total_time() {
    local duration=$(( $(date +%s) - SCRIPT_START_TIME ))
    printf "Total time: %02d:%02d\n" $(( duration / 60 )) $(( duration % 60 ))
}
trap print_total_time EXIT

CLEAN_FLAG=""
SKIP_CHECKS_FLAG=""
SKIP_BOOTSTRAP_FLAG=""
SKIP_E2E_FLAG=""

for arg in "$@"; do
    case $arg in
        --clean) CLEAN_FLAG="true" ;;
        --skip-checks) SKIP_CHECKS_FLAG="true" ;;
        --skip-bootstrap) SKIP_BOOTSTRAP_FLAG="true" ;;
        --skip-e2e) SKIP_E2E_FLAG="true" ;;
    esac
done

if [ "$CLEAN_FLAG" = "true" ]; then
    # Stop network before cleaning so git clean -fdX doesn't orphan the process
    icp network stop local 2>/dev/null || true
    ./scripts/clean.sh
fi

# Format, lint, typecheck, build
if [ "$SKIP_CHECKS_FLAG" != "true" ]; then
    ./scripts/check.sh
fi

if [ "$SKIP_BOOTSTRAP_FLAG" != "true" ]; then
    echo "Starting local network..."

    ./scripts/setup-identity.sh

    # Stop any running network
    icp network stop local 2>/dev/null || true

    # Start fresh local network (PocketIC with NNS + II)
    icp network start local -d

    # Write test.env with NNS II URL and discovered canister IDs
    ./scripts/write-test-env.sh

    # Transfer ICP to ident-1 for testing
    echo "Transferring ICP to ident-1..."
    IDENT1_PRINCIPAL=$(icp identity principal --identity ident-1)
    icp token transfer 100 "$IDENT1_PRINCIPAL" -n local
    echo "ident-1 balance:"
    icp token balance --identity ident-1 -n local
fi

# Export test env vars so Vite builds use the correct identity provider URL
# (test.env was written by write-test-env.sh with the NNS II canister ID)
set -a
source tests/test.env
set +a

# --- Phase 1: Build all frontend assets in parallel ---
echo "Building frontend assets..."
./scripts/prebuild-mcd.sh &
pid_mcd=$!
npm run build --workspace=my-hello-world-frontend &
pid_hw=$!
npm run build --workspace=my-notepad-frontend &
pid_np=$!
wait $pid_mcd $pid_hw $pid_np

# --- Phase 2: Batch-build all Rust canister wasms ---
echo "Batch-building all canister wasms..."
./scripts/build-all-wasm.sh

# --- Phase 3: Deploy canisters using prebuilt wasms ---
echo "Deploying wasm-registry canister..."
icp canister create wasm-registry -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install wasm-registry --wasm wasm/wasm-registry.wasm.gz -e local --identity ident-1

echo "Deploying my-hello-world canister..."
icp canister create my-hello-world -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install my-hello-world --wasm wasm/my-hello-world.wasm.gz -e local --identity ident-1

# --- Phase 4: Dashboard setup (II principals, controllers) ---
echo "Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh --skip-build

echo "Uploading my-hello-world WASM to registry..."
./scripts/upload-wasm-to-registry.sh \
  "my-hello-world" \
  "The Internet Computer Hello World Dapp" \
  "5.0.0" \
  "wasm/my-hello-world.wasm.gz" \
  -e local --identity ident-1

echo "Deploying my-notepad canister..."
icp canister create my-notepad -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
icp canister install my-notepad --wasm wasm/my-notepad.wasm.gz -e local --identity ident-1

echo "Uploading my-notepad WASM to registry..."
./scripts/upload-wasm-to-registry.sh \
  "my-notepad" \
  "A personal notepad on the Internet Computer" \
  "1.0.0" \
  "wasm/my-notepad.wasm.gz" \
  -e local --identity ident-1

# Append wasm-registry canister ID to test.env
WASM_REGISTRY_ID=$(icp canister status wasm-registry -e local --id-only)
if ! grep -q "VITE_WASM_REGISTRY_CANISTER_ID" tests/test.env; then
  echo "VITE_WASM_REGISTRY_CANISTER_ID=${WASM_REGISTRY_ID}" >> tests/test.env
fi

echo "Setup my-canister-app canister..."
# Re-source test.env (setup-dashboard-dev-env.sh and registry deploy may have added canister IDs)
set -a
source tests/test.env
set +a
# Build my-canister-app with test env vars (asset canister recipe doesn't run build)
npm run build --workspace=my-canister-app
icp deploy my-canister-app -e local
# Append my-canister-app canister ID to test.env (not available when write-test-env.sh ran)
APP_CANISTER_ID=$(icp canister status my-canister-app -e local --id-only)
if ! grep -q "VITE_MY_CANISTER_APP_CANISTER_ID" tests/test.env; then
  echo "VITE_MY_CANISTER_APP_CANISTER_ID=${APP_CANISTER_ID}" >> tests/test.env
fi
# Re-source with the app canister ID now available
set -a
source tests/test.env
set +a

echo "Running tests..."
./scripts/run-test.sh

if [ "$SKIP_E2E_FLAG" != "true" ]; then
    ./scripts/run-test-e2e.sh
fi

echo "Validation finished correctly!"
