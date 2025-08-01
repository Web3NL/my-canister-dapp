#!/bin/bash
set -e

echo "Setting up dashboard development environment..."

echo "Using dfx identity ident-1..."
dfx identity use ident-1

echo "Creating my-hello-world canister..."
dfx canister create my-hello-world --with-cycles 900000000000
dfx build my-hello-world
dfx canister install my-hello-world

echo "Running Internet Identity setup..."
npx playwright install 
npm run build:derive-ii-principal
DAPP_ORIGIN=http://localhost:5173 npm run test:derive-ii-principal

echo "Reading canister ID from global .env.development..."
CANISTER_ID=$(grep VITE_MY_HELLO_WORLD_CANISTER_ID .env.development | cut -d '=' -f2)

echo "Reading principal from ii-principal.txt..."
PRINCIPAL=$(cat test-output/derived-ii-principal.txt)

IDENT1=$(dfx identity get-principal)

echo "Setting controllers for my-hello-world canister..."
dfx canister update-settings my-hello-world --set-controller $CANISTER_ID --set-controller $PRINCIPAL --set-controller $IDENT1

echo "Setting authorized Internet Identity principal..."
dfx canister call my-hello-world manage_ii_principal "(variant { Set = principal \"$PRINCIPAL\" })"

echo "✓ Dashboard development environment setup complete"