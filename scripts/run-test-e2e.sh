#!/bin/bash

set -euo pipefail

echo "Running End-to-End Tests"

# First run the standalone app tests
npx playwright test --project=my-canister-app-dfx

# Then run the dashboard + hello world related projects with vite server flag
DASHBOARD_VITE_SERVER=true npx playwright test \
    --project=canister-dashboard-frontend-dfx \
    --project=my-hello-world-frontend-dfx \
    --project=canister-dashboard-frontend-vite

echo "E2E test completed successfully!"