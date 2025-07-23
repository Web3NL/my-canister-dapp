#!/bin/bash

set -e

echo "Running End-to-End Tests"
npm run test:e2e
echo "E2E test completed successfully!"