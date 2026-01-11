#!/bin/bash
set -euo pipefail

# Main workspace
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
cargo check --all-targets --all-features
cargo test --workspace --exclude canister-dapp-test
