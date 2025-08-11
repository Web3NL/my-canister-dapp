#!/bin/bash

set -e

echo "Running End-to-End Tests"

DASHBOARD_VITE_SERVER=true npx playwright test --project=my-canister-app-dfx --project=canister-dashboard-frontend-vite
npx playwright test --project=my-hello-world-frontend-dfx --project=canister-dashboard-frontend-dfx 

echo "E2E test completed successfully!"