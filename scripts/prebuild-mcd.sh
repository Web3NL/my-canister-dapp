#!/bin/bash
set -euo pipefail

# Ensure we're in the project root directory
cd "$(dirname "$0")/.."

# Frontend quality checks
echo "🔍 Running lint check..."
npm run lint --workspace=canister-dashboard-frontend

echo "📝 Running format check..."
npm run format --workspace=canister-dashboard-frontend

echo "🔧 Running type check..."
npm run typecheck --workspace=canister-dashboard-frontend

# Build frontend
echo "🏗️ Building frontend in production mode..."
npm run build --workspace=canister-dashboard-frontend

# Copy assets from frontend dist to Rust crate assets
echo "📦 Copying assets from frontend dist to Rust crate..."
mkdir -p my-canister-dapp-rs/my-canister-dashboard/assets
rm -rf my-canister-dapp-rs/my-canister-dashboard/assets/*
cp -r my-canister-dapp-js/canister-dashboard-frontend/dist/* my-canister-dapp-rs/my-canister-dashboard/assets/

echo "✅ Crate my-canister-dashboard built successfully!"