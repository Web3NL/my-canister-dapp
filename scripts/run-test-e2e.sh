#!/bin/bash

set -euo pipefail

source "$(dirname "$0")/constants.sh"

echo "Running End-to-End Tests"

# Batch 1: Vite dev server dashboard + installer app
# The Vite principal is already set by setup-dashboard-dev-env.sh
DASHBOARD_VITE_SERVER=true npx playwright test \
    --project=my-canister-app-dfx \
    --project=canister-dashboard-frontend-vite

# Swap II principal to DFX origin for the second batch
PRINCIPAL_DFX=$(cat test-output/derived-ii-principal-dfx.txt)
echo "Switching II principal to DFX origin for second test batch..."
dfx canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_DFX\" })"

# Batch 2: DFX-served dashboard + hello-world frontend
npx playwright test \
    --project=canister-dashboard-frontend-dfx \
    --project=my-hello-world-frontend-dfx \

echo "E2E test completed successfully!"
