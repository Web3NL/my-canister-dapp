#!/bin/bash
set -euo pipefail

# Rust formatting and linting (no tests — those run in the test phase)
cargo fmt
cargo clippy --all-targets --all-features -- -D warnings
