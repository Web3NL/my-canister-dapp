#!/bin/bash
set -e

echo "Starting dfx environment setup..."
dfxvm install 0.28.0
dfxvm default 0.28.0

./scripts/setup-dfx-identity.sh

echo "Cleaning up dfx processes..."
dfx killall

echo "Starting dfx..."
dfx start --clean --background > dfx.log 2>&1

echo "Installing NNS extension..."
dfx extension install nns
dfx nns install

echo "Deploying icp-index canister..."
dfx deploy icp-index

echo "Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh

echo "Setup my-canister-app canister..."
./scripts/generate-registry-dev.sh
dfx deploy my-canister-app

echo "✓ Initialization complete"
