#!/bin/bash

set -euo pipefail

source "$(dirname "$0")/constants.sh"

echo "Running End-to-End Tests"

# Batch 1: Vite dev server dashboard + installer app
# The Vite principal is already set by setup-dashboard-dev-env.sh
DASHBOARD_VITE_SERVER=true npx playwright test \
    --project=my-canister-app-canister \
    --project=canister-dashboard-frontend-vite

# Swap II principal to canister-served origin for the second batch
PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
echo "Switching II principal to canister-served origin for second test batch..."
icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_CANISTER\" })" -e local --identity ident-1

# Batch 2: Canister-served dashboard + hello-world frontend
npx playwright test \
    --project=canister-dashboard-frontend-canister \
    --project=my-hello-world-frontend-canister \

echo "E2E test completed successfully!"
