#!/bin/bash
set -euo pipefail

# Backward-compatible wrapper — delegates to 01-check.sh.
# Kept because it is referenced as a Cargo pre-release hook
# (packages-rs/my-canister-dashboard/Cargo.toml) and in CLAUDE.md.

exec "$(dirname "$0")/01-check.sh" "$@"
