#!/bin/bash
set -e

cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
cargo check --all-targets --all-features
cargo test --workspace --exclude canister-dapp-test
