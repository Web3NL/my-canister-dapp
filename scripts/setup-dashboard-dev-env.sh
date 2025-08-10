#!/bin/bash
set -e

echo "Setting up dashboard development environment..."

echo "Using dfx identity ident-1..."
dfx identity use ident-1

echo "Creating my-hello-world canister..."
dfx canister create my-hello-world --with-cycles 900000000000
dfx build my-hello-world
dfx canister install my-hello-world --mode reinstall --yes

echo "Running Internet Identity setup..."
npx playwright install 
npm run test:create-ii-account
npm run build:derive-ii-principal
DAPP_ORIGIN=http://localhost:5173 DAPP_DEV_ENV=vite npm run test:derive-ii-principal
DAPP_ORIGIN=http://22ajg-aqaaa-aaaap-adukq-cai.localhost:8080 DAPP_DEV_ENV=dfx npm run test:derive-ii-principal

echo "Reading canister ID from global .env.development..."
CANISTER_ID=$(grep VITE_MY_HELLO_WORLD_CANISTER_ID .env.development | cut -d '=' -f2)

echo "Reading principals from both files..."
PRINCIPAL_VITE=$(cat test-output/derived-ii-principal-vite.txt)
PRINCIPAL_DFX=$(cat test-output/derived-ii-principal-dfx.txt)

IDENT1=$(dfx identity get-principal)

echo "Setting controllers for my-hello-world canister..."
dfx canister update-settings my-hello-world \
  --set-controller $CANISTER_ID \
  --set-controller $PRINCIPAL_VITE \
  --set-controller $PRINCIPAL_DFX \
  --set-controller $IDENT1

echo "Setting authorized Internet Identity principals..."
# dfx canister call my-hello-world manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_VITE\" })"
dfx canister call my-hello-world manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_DFX\" })"

echo "✓ Dashboard development environment setup complete"