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

./scripts/check.sh
./scripts/setup-dfx-env.sh
./scripts/run-tests.sh

if [ "$E2E_FLAG" = "true" ]; then
    echo "Running E2E dashboard frontend test..."
    npx playwright test tests/canister-dashboard-frontend/dashboard-frontend.spec.ts
    echo "E2E test completed successfully!"
fi

echo "All tests passed successfully!"