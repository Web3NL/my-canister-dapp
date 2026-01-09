#!/bin/bash
set -euo pipefail

# Source shared constants
source "$(dirname "$0")/constants.sh"

echo "Setting up dashboard development environment..."

echo "Using dfx identity ident-1..."
dfx identity use ident-1

echo "Creating $HELLO_WORLD_CANISTER canister..."
dfx generate "$HELLO_WORLD_CANISTER"
dfx canister create "$HELLO_WORLD_CANISTER" --with-cycles "$CANISTER_INITIAL_CYCLES"

./scripts/prebuild-mcd.sh
dfx build "$HELLO_WORLD_CANISTER"
./scripts/copy-example-wasm.sh
dfx canister install "$HELLO_WORLD_CANISTER" --mode reinstall --yes

echo "Running Internet Identity setup..."
npx playwright install 
npm run test:create-ii-account
npm run build:derive-ii-principal
DAPP_ORIGIN="$DAPP_ORIGIN_VITE" DAPP_DEV_ENV=vite npm run test:derive-ii-principal
DAPP_ORIGIN="$DAPP_ORIGIN_DFX" DAPP_DEV_ENV=dfx npm run test:derive-ii-principal

echo "Reading canister ID from tests/test.env..."
CANISTER_ID=$(grep VITE_MY_HELLO_WORLD_CANISTER_ID tests/test.env | cut -d '=' -f2)

echo "Reading principals from both files..."
PRINCIPAL_VITE=$(cat test-output/derived-ii-principal-vite.txt)
PRINCIPAL_DFX=$(cat test-output/derived-ii-principal-dfx.txt)

IDENT1=$(dfx identity get-principal)

echo "Setting controllers for $HELLO_WORLD_CANISTER canister..."
dfx canister update-settings "$HELLO_WORLD_CANISTER" \
  --set-controller "$CANISTER_ID" \
  --set-controller "$PRINCIPAL_VITE" \
  --set-controller "$PRINCIPAL_DFX" \
  --set-controller "$IDENT1"

echo "Setting authorized Internet Identity principals..."
# dfx canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_VITE\" })"
dfx canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_DFX\" })"

echo "✓ Dashboard development environment setup complete"