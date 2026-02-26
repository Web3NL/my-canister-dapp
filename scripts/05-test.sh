#!/bin/bash
set -euo pipefail

# Phase 5: Run all tests — unit, acceptance, and E2E.
# Accepts --include-vite-e2e to also run Vite dev server E2E batch.
# Accepts --skip-e2e to skip E2E tests entirely.

INCLUDE_VITE_E2E=""
SKIP_E2E=""
for arg in "$@"; do
  case $arg in
    --include-vite-e2e) INCLUDE_VITE_E2E="true" ;;
    --skip-e2e) SKIP_E2E="true" ;;
  esac
done

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# Source test env for canister IDs
set -a
source tests/test.env
set +a

echo "Running tests..."
./scripts/run-test.sh

if [ "$SKIP_E2E" != "true" ]; then
  E2E_ARGS=""
  if [ "$INCLUDE_VITE_E2E" = "true" ]; then
    E2E_ARGS="--include-vite-e2e"
  fi
  ./scripts/run-test-e2e.sh $E2E_ARGS
fi

echo "All tests passed!"
