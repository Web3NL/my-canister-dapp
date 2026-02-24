#!/bin/bash
set -euo pipefail

# Source shared constants
source "$(dirname "$0")/constants.sh"

# Ensure we're in the project root directory
cd "$REPO_ROOT"

echo "Setting up dashboard development environment..."

echo "Deploying $HELLO_WORLD_CANISTER canister..."
./scripts/prebuild-mcd.sh
# Build hello-world frontend with test env vars (identity provider URL)
# before the Rust canister embeds it via include_dir!
npm run build --workspace=my-hello-world-frontend
icp deploy "$HELLO_WORLD_CANISTER" -e local --identity ident-1 --cycles "$CANISTER_INITIAL_CYCLES"
./scripts/copy-example-wasm.sh

# Update test.env with the hello-world canister ID
HELLO_WORLD_ID=$(icp canister status my-hello-world -e local --id-only)
if ! grep -q "VITE_MY_HELLO_WORLD_CANISTER_ID" tests/test.env 2>/dev/null; then
  echo "VITE_MY_HELLO_WORLD_CANISTER_ID=${HELLO_WORLD_ID}" >> tests/test.env
fi

# Re-source constants to pick up the new DAPP_ORIGIN_CANISTER
source "$(dirname "$0")/constants.sh"

echo "Running Internet Identity setup..."
npx playwright install
DAPP_ORIGIN_VITE="$DAPP_ORIGIN_VITE" DAPP_ORIGIN_CANISTER="$DAPP_ORIGIN_CANISTER" npm run test:setup-ii

echo "Reading canister ID from tests/test.env..."
CANISTER_ID=$(grep VITE_MY_HELLO_WORLD_CANISTER_ID tests/test.env | cut -d '=' -f2)

echo "Reading principals from both files..."
PRINCIPAL_VITE=$(cat test-output/derived-ii-principal-vite.txt)
PRINCIPAL_CANISTER=$(cat test-output/derived-ii-principal-canister.txt)

IDENT1=$(icp identity principal --identity ident-1)

echo "Setting controllers for $HELLO_WORLD_CANISTER canister..."
icp canister settings update "$HELLO_WORLD_CANISTER" -e local --identity ident-1 \
  --set-controller "$CANISTER_ID" \
  --set-controller "$PRINCIPAL_VITE" \
  --set-controller "$PRINCIPAL_CANISTER" \
  --set-controller "$IDENT1" \
  -f

echo "Setting authorized Internet Identity principal (Vite origin for first e2e batch)..."
icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_VITE\" })" -e local --identity ident-1

echo "✓ Dashboard development environment setup complete"
