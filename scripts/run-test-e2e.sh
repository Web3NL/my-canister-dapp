#!/bin/bash

set -e

echo "Running End-to-End Tests"

npx playwright test --project=canister-dashboard-frontend  --project=my-canister-app

echo "E2E test completed successfully!"