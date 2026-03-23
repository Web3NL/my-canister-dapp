#!/bin/bash
set -euo pipefail

# 🔍 Rust formatting and linting (no tests — those run in the test phase)

echo "🔍 Running cargo fmt..."
cargo fmt

echo "🔍 Running cargo clippy..."
cargo clippy --all-targets --all-features -- -D warnings

echo "✅ Rust checks passed"
