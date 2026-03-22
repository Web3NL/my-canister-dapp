#!/bin/bash
set -euo pipefail

# Set up Internet Identity principals and canister controllers for E2E testing.
# Assumes canisters are already built and deployed (handled by 03-build.sh + 04-deploy.sh).

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

echo "Setting up dashboard development environment..."

# Compute canister origins from deployed canister IDs
HELLO_WORLD_ID=$(icp canister status my-hello-world -e local --id-only)
DAPP_ORIGIN_CANISTER="http://${HELLO_WORLD_ID}.localhost:8080"

NOTEPAD_ID=$(icp canister status my-notepad -e local --id-only)
DAPP_ORIGIN_NOTEPAD="http://${NOTEPAD_ID}.localhost:8080"

APP_ID=$(icp canister status icp-dapp-launcher -e local --id-only)
DAPP_ORIGIN_APP="http://${APP_ID}.localhost:8080"

echo "Running Internet Identity setup..."
npx playwright install chromium
DAPP_BIN="$REPO_ROOT/target/debug/dapp"
mkdir -p tests/output
"$DAPP_BIN" derive-ii-principal "$DAPP_ORIGIN_VITE"     > tests/output/derived-ii-principal-vite.txt
"$DAPP_BIN" derive-ii-principal "$DAPP_ORIGIN_CANISTER" > tests/output/derived-ii-principal-canister.txt
"$DAPP_BIN" derive-ii-principal "$DAPP_ORIGIN_NOTEPAD"  > tests/output/derived-ii-principal-notepad.txt
"$DAPP_BIN" derive-ii-principal "$DAPP_ORIGIN_APP"      > tests/output/derived-ii-principal-app.txt

echo "Reading principals..."
PRINCIPAL_VITE=$(cat tests/output/derived-ii-principal-vite.txt)
PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
PRINCIPAL_NOTEPAD=$(cat tests/output/derived-ii-principal-notepad.txt)
PRINCIPAL_APP=$(cat tests/output/derived-ii-principal-app.txt)
IDENT1=$(icp identity principal --identity ident-1)

echo "Setting controllers for $HELLO_WORLD_CANISTER canister..."
icp canister settings update "$HELLO_WORLD_CANISTER" -e local --identity ident-1 \
  --set-controller "$HELLO_WORLD_ID" \
  --set-controller "$PRINCIPAL_VITE" \
  --set-controller "$PRINCIPAL_CANISTER" \
  --set-controller "$IDENT1" \
  -f

echo "Setting authorized Internet Identity principal for $HELLO_WORLD_CANISTER (Vite origin for first E2E batch)..."
icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_VITE\" })" -e local --identity ident-1

echo "Setting controllers for $NOTEPAD_CANISTER canister..."
icp canister settings update "$NOTEPAD_CANISTER" -e local --identity ident-1 \
  --set-controller "$NOTEPAD_ID" \
  --set-controller "$PRINCIPAL_VITE" \
  --set-controller "$PRINCIPAL_NOTEPAD" \
  --set-controller "$IDENT1" \
  -f

echo "Setting authorized Internet Identity principal for $NOTEPAD_CANISTER (Vite origin for first E2E batch)..."
icp canister call "$NOTEPAD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_VITE\" })" -e local --identity ident-1

echo "Setting demos canister admins..."
icp canister call demos set_admins "(vec { principal \"$PRINCIPAL_APP\" })" -e local --identity ident-1

echo "Dashboard development environment setup complete"
