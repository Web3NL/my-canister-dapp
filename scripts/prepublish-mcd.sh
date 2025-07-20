#!/bin/bash

set -e

# Check if dev argument is passed, default to prod mode
if [ "$1" = "dev" ]; then
    DEV_MODE="dev"
    echo "🔧 Building canister dashboard in development mode..."
else
    DEV_MODE="prod"
    echo "🚀 Building canister dashboard in production mode..."
fi

# Frontend quality checks
echo "🔍 Running lint check..."
npm run lint --workspace=canister-dashboard-frontend

echo "📝 Running format check..."
npm run format --workspace=canister-dashboard-frontend

echo "🔧 Running type check..."
npm run typecheck --workspace=canister-dashboard-frontend

# Build frontend
if [ "$DEV_MODE" = "dev" ]; then
    echo "🏗️ Building frontend in development mode..."
    npm run build:dev --workspace=canister-dashboard-frontend
else
    echo "🏗️ Building frontend in production mode..."
    npm run build --workspace=canister-dashboard-frontend
fi

# Copy assets from frontend dist to Rust crate assets
echo "📦 Copying assets from frontend dist to Rust crate..."
rm -rf my-canister-dapp-rs/my-canister-dashboard/assets/*
cp -r my-canister-dapp-js/canister-dashboard-frontend/dist/* my-canister-dapp-rs/my-canister-dashboard/assets/

# Build Rust crate
echo "🦀 Building my-canister-dashboard crate..."
cargo check --package my-canister-dashboard --release

echo "✅ Crate my-canister-dashboard built successfully!"