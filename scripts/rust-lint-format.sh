#!/bin/bash
set -e

cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
cargo check --all-targets --all-features
cargo test --workspace --exclude my-wasm-test

npm run build --workspace=canister-dashboard-frontend
mkdir -p my-canister-dapp-rs/my-canister-dashboard/assets/
cp -r my-canister-dapp-js/canister-dashboard-frontend/dist/* my-canister-dapp-rs/my-canister-dashboard/assets/
./scripts/build-wasms.sh
