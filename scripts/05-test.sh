#!/bin/bash
set -euo pipefail

# Phase 5: Run all tests — unit, acceptance, and E2E.
# Accepts --skip-acceptance to skip acceptance tests.
# Accepts --include-vite-e2e to also run Vite dev server E2E batch.
# Accepts --skip-e2e to skip E2E tests entirely.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# 📝 Load canister IDs
source_env tests/test.env

# 🚩 Parse flags
SKIP_ACCEPTANCE="false"
INCLUDE_VITE_E2E="false"
SKIP_E2E="false"

if [[ "$*" == *"--skip-acceptance"* ]];  then SKIP_ACCEPTANCE="true"; fi
if [[ "$*" == *"--include-vite-e2e"* ]]; then INCLUDE_VITE_E2E="true"; fi
if [[ "$*" == *"--skip-e2e"* ]];         then SKIP_E2E="true"; fi

# ================================================================
# 🧪 Unit Tests (JS + Rust) — parallel
# ================================================================
echo "🧪 Running unit tests (JS + Rust) in parallel..."
npm run test --workspace=@web3nl/my-canister-dashboard &
pid1=$!
npm run test --workspace=@web3nl/vite-plugin-canister-dapp &
pid2=$!
npm run test --workspace=canister-dashboard-frontend &
pid3=$!
npm run test --workspace=icp-dapp-launcher &
pid4=$!
cargo test --workspace --exclude demos-test &
pid5=$!
wait $pid1
wait $pid2
wait $pid3
wait $pid4
wait $pid5
echo "✅ Unit tests passed"

# ================================================================
# 🧪 Acceptance Tests — sequential (each uses PocketIC)
# ================================================================
if [ "$SKIP_ACCEPTANCE" = "true" ]; then
  echo "⏭️ Acceptance tests skipped"
else
  echo "🧪 Acceptance testing my-hello-world..."
  cargo run -p my-canister-dapp-cli -- test wasm/my-hello-world.wasm.gz

  echo "🧪 Acceptance testing my-notepad..."
  cargo run -p my-canister-dapp-cli -- test wasm/my-notepad.wasm.gz

  echo "🧪 Acceptance testing demos canister..."
  cargo run -p demos-test
fi

# ================================================================
# 🧪 E2E Tests (Playwright)
# ================================================================
if [ "$SKIP_E2E" = "true" ]; then
  echo "⏭️ E2E tests skipped"
else
  echo "🧪 Running End-to-End Tests..."

  # Installer app test must run first — it writes the installed canister ID
  # needed by dashboard and hello-world frontend tests
  npx playwright test --project=icp-dapp-launcher-canister

  # Vite dev server batch (local only, skipped in CI)
  if [ "$INCLUDE_VITE_E2E" = "true" ]; then
    # The Vite principal is already set by the dashboard dev environment setup
    DASHBOARD_VITE_SERVER=true npx playwright test \
        --project=canister-dashboard-frontend-vite
  fi

  # 🔑 Swap II principal to canister-served origin for canister batch
  PRINCIPAL_CANISTER=$(cat tests/output/derived-ii-principal-canister.txt)
  echo "🔑 Switching II principal to canister-served origin..."
  icp canister call "$HELLO_WORLD_CANISTER" manage_ii_principal "(variant { Set = principal \"$PRINCIPAL_CANISTER\" })" -e local --identity ident-1

  # Canister-served dashboard + hello-world frontend
  npx playwright test \
      --project=canister-dashboard-frontend-canister \
      --project=my-hello-world-frontend-canister

  echo "✅ E2E tests completed successfully!"
fi

echo "✅ All tests passed!"
