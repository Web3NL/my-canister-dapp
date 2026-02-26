#!/bin/bash
set -euo pipefail

# Build canister-dashboard frontend and copy assets into the Rust crate.
# Quality checks (lint, format, typecheck) run separately in 01-check.sh.
#
# Also used as a Cargo pre-release hook
# (packages-rs/my-canister-dashboard/Cargo.toml).

cd "$(dirname "$0")/.."

echo "Building dashboard frontend..."
npm run build --workspace=canister-dashboard-frontend

echo "Copying assets from frontend dist to Rust crate..."
mkdir -p packages-rs/my-canister-dashboard/assets
rm -rf packages-rs/my-canister-dashboard/assets/*
cp -r packages-rs/my-canister-dashboard/frontend/dist/* packages-rs/my-canister-dashboard/assets/

echo "Dashboard assets ready"
