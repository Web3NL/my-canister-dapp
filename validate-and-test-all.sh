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
fi

if [ "$SKIP_DFX_BOOTSTRAP_FLAG" != "true" ]; then
    echo "Starting DFX bootstrap"

    dfxvm install 0.28.0
    dfxvm default 0.28.0

    ./scripts/setup-dfx-identity.sh

    rm -rf .dfx
    cd dfx-env

    dfx killall
    dfx start --clean --background > dfx.log 2>&1

    ./deploy-all.sh

    cd ..

    dfx start
fi

echo "Setting up dashboard dev environment..."
./scripts/setup-dashboard-dev-env.sh

echo "Setup my-canister-app canister..."
./scripts/generate-registry-dev.sh
dfx deploy my-canister-app

echo "Running tests..."
./scripts/run-test.sh

if [ "$E2E_FLAG" = "true" ]; then
    ./scripts/run-test-e2e.sh
fi

echo "Validation finished correctly!"