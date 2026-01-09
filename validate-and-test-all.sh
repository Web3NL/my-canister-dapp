#!/bin/bash
set -euo pipefail

# Source shared constants
source "$(dirname "$0")/scripts/constants.sh"

# Minimal total runtime reporting (MM:SS)
SCRIPT_START_TIME=$(date +%s)
print_total_time() {
    local duration=$(( $(date +%s) - SCRIPT_START_TIME ))
    printf "Total time: %02d:%02d\n" $(( duration / 60 )) $(( duration % 60 ))
}
trap print_total_time EXIT

CLEAN_FLAG=""
SKIP_CHECKS_FLAG=""
SKIP_DFX_BOOTSTRAP_FLAG=""
SKIP_E2E_FLAG=""

for arg in "$@"; do
    case $arg in
        --clean) CLEAN_FLAG="true" ;;
        --skip-checks) SKIP_CHECKS_FLAG="true" ;;
        --skip-dfx-bootstrap) SKIP_DFX_BOOTSTRAP_FLAG="true" ;;
        --skip-e2e) SKIP_E2E_FLAG="true" ;;
    esac
done

if [ "$CLEAN_FLAG" = "true" ]; then
    ./scripts/clean.sh
fi

# Format, lint, typecheck, build
if [ "$SKIP_CHECKS_FLAG" != "true" ]; then
    ./scripts/check.sh
fi

if [ "$SKIP_DFX_BOOTSTRAP_FLAG" != "true" ]; then
    echo "Starting DFX bootstrap"

    dfxvm install "$DFX_VERSION"
    dfxvm default "$DFX_VERSION"

    ./scripts/setup-dfx-identity.sh

    rm -rf .dfx
    cd dfx-env

    dfx killall
    dfx start --clean --background > dfx.log 2>&1

    ./deploy-all.sh

    cd ..
fi

echo "Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh

echo "Setup my-canister-app canister..."
./scripts/generate-registry-dev.sh
dfx deploy my-canister-app

echo "Running tests..."
./scripts/run-test.sh

if [ "$SKIP_E2E_FLAG" != "true" ]; then
    ./scripts/run-test-e2e.sh
fi

echo "Validation finished correctly!"