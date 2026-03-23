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

# 🧪 Run unit + acceptance tests
echo "🧪 Running tests..."
if [ "$SKIP_ACCEPTANCE" = "true" ]; then
  ./scripts/run-test.sh --skip-acceptance
else
  ./scripts/run-test.sh
fi

# 🧪 Run E2E tests
if [ "$SKIP_E2E" != "true" ]; then
  if [ "$INCLUDE_VITE_E2E" = "true" ]; then
    ./scripts/run-test-e2e.sh --include-vite-e2e
  else
    ./scripts/run-test-e2e.sh
  fi
fi

echo "✅ All tests passed!"
