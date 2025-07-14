#!/bin/bash

set -e

if [ "$1" = "clean" ]; then
    ./scripts/clean.sh
fi

# Run full validation and test suite
./scripts/check.sh
./scripts/setup-dfx-env.sh
./scripts/run-tests.sh

echo "All tests passed successfully!"