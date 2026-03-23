#!/bin/bash
set -euo pipefail

source "$(dirname "$0")/constants.sh"

# 🚩 Parse flags
INCLUDE_VITE_E2E="false"
if [[ "$*" == *"--include-vite-e2e"* ]]; then INCLUDE_VITE_E2E="true"; fi

echo "🧪 Running End-to-End Tests..."

# 🧪 Installer app test must run first — it writes the installed canister ID
# needed by dashboard and hello-world frontend tests
npx playwright test --project=icp-dapp-launcher-canister

# 🧪 Vite dev server batch (local only, skipped in CI)
if [ "$INCLUDE_VITE_E2E" = "true" ]; then
  # The Vite principal is already set by setup-dashboard-dev-env.sh
  DASHBOARD_VITE_SERVER=true npx playwright test \
      --project=canister-dashboard-frontend-vite
fi

# 🔑 Swap II principal to canister-served origin for canister batch
PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
echo "🔑 Switching II principal to canister-served origin..."
icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_CANISTER\" })" -e local --identity ident-1

# 🧪 Canister-served dashboard + hello-world frontend
npx playwright test \
    --project=canister-dashboard-frontend-canister \
    --project=my-hello-world-frontend-canister

echo "✅ E2E tests completed successfully!"
