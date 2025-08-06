#!/bin/bash

set -e

E2E_FLAG=""
CLEAN_FLAG=""

for arg in "$@"; do
    case $arg in
        --e2e)
            E2E_FLAG="true"
            ;;
        --clean)
            CLEAN_FLAG="true"
            ;;
    esac
done

if [ "$CLEAN_FLAG" = "true" ]; then
    ./scripts/clean.sh
fi

./scripts/create-canister-dapp-dev-env.sh my-canister-dapp-js/canister-dashboard-frontend/src
./scripts/create-canister-dapp-dev-env.sh examples/my-hello-world/src/my-hello-world-frontend

./scripts/check.sh
./scripts/setup-dfx-env.sh
./scripts/run-test.sh

if [ "$E2E_FLAG" = "true" ]; then
    ./scripts/run-test-e2e.sh
fi

echo "All tests passed successfully!"