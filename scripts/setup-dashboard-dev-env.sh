#!/bin/bash
set -euo pipefail

# Set up Internet Identity principals and canister controllers for E2E testing.
# Assumes canisters are already built and deployed (handled by 03-build.sh + 04-deploy.sh).

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

echo "Setting up dashboard development environment..."

# Compute canister origin from the deployed hello-world canister ID
HELLO_WORLD_ID=$(icp canister status my-hello-world -e local --id-only)
DAPP_ORIGIN_CANISTER="http://${HELLO_WORLD_ID}.localhost:8080"

echo "Running Internet Identity setup..."
npx playwright install
DAPP_ORIGIN_VITE="$DAPP_ORIGIN_VITE" DAPP_ORIGIN_CANISTER="$DAPP_ORIGIN_CANISTER" npm run test:setup-ii

echo "Reading principals..."
PRINCIPAL_VITE=$(cat tests/output/derived-ii-principal-vite.txt)
PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
IDENT1=$(icp identity principal --identity ident-1)

echo "Setting controllers for $HELLO_WORLD_CANISTER canister..."
icp canister settings update "$HELLO_WORLD_CANISTER" -e local --identity ident-1 \
  --set-controller "$HELLO_WORLD_ID" \
  --set-controller "$PRINCIPAL_VITE" \
  --set-controller "$PRINCIPAL_CANISTER" \
  --set-controller "$IDENT1" \
  -f

echo "Setting authorized Internet Identity principal (Vite origin for first E2E batch)..."
icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_VITE\" })" -e local --identity ident-1

echo "Dashboard development environment setup complete"
