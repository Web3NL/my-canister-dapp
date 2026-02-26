#!/bin/bash
set -euo pipefail

echo "Running prerelease validation checks..."

echo "Installing dependencies..."
npm ci

echo "Building all workspace packages..."
npm run build

# Run JS checks, dependency checks, and Rust checks in parallel
echo "Running checks in parallel (JS + deps + Rust)..."

npm run check &
pid_js=$!

npm run deps:check &
pid_deps=$!

./scripts/rust-lint-format.sh &
pid_rust=$!

# Wait for each — set -e will exit on first failure
wait $pid_js
echo "JS checks passed"
wait $pid_deps
echo "Dependency checks passed"
wait $pid_rust
echo "Rust checks passed"

echo "Validation checks complete!"
