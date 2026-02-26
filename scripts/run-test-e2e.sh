#!/bin/bash

set -euo pipefail

source "$(dirname "$0")/constants.sh"

SKIP_VITE_E2E=""
for arg in "$@"; do
  case $arg in
    --skip-vite-e2e) SKIP_VITE_E2E="true" ;;
  esac
done

echo "Running End-to-End Tests"

# Installer app test must run first — it writes the installed canister ID
# needed by dashboard and hello-world frontend tests
npx playwright test --project=my-canister-app-canister

if [ "$SKIP_VITE_E2E" != "true" ]; then
  # Batch 1: Vite dev server dashboard
  # The Vite principal is already set by setup-dashboard-dev-env.sh
  DASHBOARD_VITE_SERVER=true npx playwright test \
      --project=canister-dashboard-frontend-vite

  # Swap II principal to canister-served origin for the second batch
  PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
  echo "Switching II principal to canister-served origin for second test batch..."
  icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_CANISTER\" })" -e local --identity ident-1
else
  # When skipping Vite batch, still need to swap to canister-served principal
  PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
  echo "Skipping Vite E2E batch, switching II principal to canister-served origin..."
  icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_CANISTER\" })" -e local --identity ident-1
fi

# Canister-served dashboard + hello-world frontend
npx playwright test \
    --project=canister-dashboard-frontend-canister \
    --project=my-hello-world-frontend-canister

echo "E2E test completed successfully!"
