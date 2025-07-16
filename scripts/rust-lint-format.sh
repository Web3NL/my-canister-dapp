#!/bin/bash
set -e

cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
cargo check --all-targets --all-features
cargo test --workspace --exclude my-wasm-test

npm run build --workspace=canister-dashboard-frontend
cargo build --release -p my-canister-dashboard
