#!/bin/bash

set -euo pipefail

echo "Running End-to-End Tests"

DASHBOARD_VITE_SERVER=true npx playwright test \
    --project=my-canister-app-dfx \
    --project=canister-dashboard-frontend-vite

npx playwright test \
    --project=canister-dashboard-frontend-dfx \
    --project=my-hello-world-frontend-dfx \

echo "E2E test completed successfully!"