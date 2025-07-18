w#!/bin/bash
set -e

echo "Setting up dashboard development environment..."

echo "Running Internet Identity setup..."
npx playwright install 
npx playwright test tests/internet-identity-setup/setup-ii.spec.ts

echo "Using dfx identity ident-1..."
dfx identity use ident-1

echo "Creating my-hello-world canister..."
cargo install ic-wasm
./scripts/build-wasms-dev.sh
dfx canister create my-hello-world --with-cycles 900000000000
dfx build my-hello-world
dfx canister install my-hello-world

echo "Reading canister ID from .env.development..."
CANISTER_ID=$(grep VITE_CANISTER_ID my-canister-dapp-js/canister-dashboard-frontend/.env.development | cut -d '=' -f2)

echo "Reading principal from ii-principal.txt..."
PRINCIPAL=$(cat test-output/ii-principal.txt)

IDENT1=$(dfx identity get-principal)

echo "Setting controllers for my-hello-world canister..."
dfx canister update-settings my-hello-world --set-controller $CANISTER_ID --set-controller $PRINCIPAL --set-controller $IDENT1

echo "✓ Dashboard development environment setup complete"