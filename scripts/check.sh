#!/bin/bash

set -e

echo "🔍 Running prerelease validation checks..."

echo "📦 Installing dependencies..."
npm ci

echo "🏗️  Building all workspace packages..."
npm run build

echo "🔍 Running lint, format, and typecheck..."
npm run check

echo "🔗 Checking dependency consistency and usage..."
npm run deps:check

echo "Rust lint and format..."
./scripts/rust-lint-format.sh

echo "Validation checks complete!"