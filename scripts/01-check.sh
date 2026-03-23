#!/bin/bash
set -euo pipefail

# Phase 1: Static analysis — lint, format, typecheck, dependency checks, Rust clippy.
# No tests run here (those are in 05-test.sh).

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building all workspace packages..."
npm run build

# 🔍 Run JS checks, dependency checks, and Rust checks in parallel
echo "🔍 Running checks in parallel (JS + deps + Rust)..."

npm run check &
pid_js=$!

npm run deps:check &
pid_deps=$!

./scripts/rust-lint-format.sh &
pid_rust=$!

wait $pid_js
echo "✅ JS checks passed"
wait $pid_deps
echo "✅ Dependency checks passed"
wait $pid_rust
echo "✅ Rust checks passed"

echo "✅ All checks complete!"
