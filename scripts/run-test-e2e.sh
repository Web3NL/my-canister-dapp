#!/bin/bash

set -e

echo "Running End-to-End Tests"

DASHBOARD_VITE_SERVER=true npx playwright test --project=canister-dashboard-frontend-vite  --project=my-canister-app
npx playwright test --project=canister-dashboard-frontend-dfx

echo "E2E test completed successfully!"