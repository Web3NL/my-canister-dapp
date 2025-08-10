#!/bin/bash

set -e

E2E_FLAG=""
CLEAN_FLAG=""
SKIP_DFX_BOOTSTRAP_FLAG=""
SKIP_CHECKS_FLAG=""

for arg in "$@"; do
    case $arg in
        --e2e)
            E2E_FLAG="true"
            ;;
        --clean)
            CLEAN_FLAG="true"
            ;;
        --skip-dfx-bootstrap)
            SKIP_DFX_BOOTSTRAP_FLAG="true"
            ;;
        --skip-checks)
            SKIP_CHECKS_FLAG="true"
            ;;
    esac
done

if [ "$CLEAN_FLAG" = "true" ]; then
    ./scripts/clean.sh
fi

# Generate the .env files upfront
./scripts/generate-env.sh

# Format, lint, typecheck, build
if [ "$SKIP_CHECKS_FLAG" != "true" ]; then
    ./scripts/check.sh
else
    echo "Skipping checks (--skip-checks flag provided)"
fi

# Install dfxvm
dfxvm install 0.28.0
dfxvm default 0.28.0

./scripts/setup-dfx-identity.sh

if [ "$SKIP_DFX_BOOTSTRAP_FLAG" != "true" ]; then
    echo "Starting DFX bootstrap"
    dfx killall
    dfx start --clean --background > dfx.log 2>&1
    dfx extension install nns
    dfx nns install
    dfx deploy icp-index
else
    echo "Skipping DFX bootstrap (--skip-dfx-bootstrap flag provided)"
fi

echo "Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh

echo "Setup my-canister-app canister..."
./scripts/generate-registry-dev.sh
dfx deploy my-canister-app
./scripts/run-test.sh

if [ "$E2E_FLAG" = "true" ]; then
    ./scripts/run-test-e2e.sh
fi

echo "All tests passed successfully!"