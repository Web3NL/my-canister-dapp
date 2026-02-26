#!/bin/bash
set -euo pipefail

# Main workspace
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
cargo test --workspace --exclude canister-dapp-test
