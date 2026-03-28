#!/bin/bash
# Shared constants and helpers for build/test scripts

# Repository root (constants.sh lives in scripts/)
export REPO_ROOT
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 🔧 Pinned tool versions
export ICP_CLI_VERSION="0.2.0"

# 💰 Cycle amounts
export CANISTER_INITIAL_CYCLES="1000000000000"

# 📦 Canister names
export HELLO_WORLD_CANISTER="my-hello-world"
export NOTEPAD_CANISTER="my-notepad"
export WASM_REGISTRY_CANISTER="wasm-registry"
export DEMOS_CANISTER="demos"

# 🌐 Test environment origins (canister origin is set dynamically after canister creation)
export DAPP_ORIGIN_VITE="http://localhost:5173"

# 📝 Helper: source a .env file and export all its variables
source_env() { set -a; source "$1"; set +a; }
export -f source_env

# 🌐 Resolve canister origins from test.env if it exists (set during setup)
if [ -f "$REPO_ROOT/tests/test.env" ]; then
  HELLO_WORLD_ID=$(grep VITE_MY_HELLO_WORLD_CANISTER_ID "$REPO_ROOT/tests/test.env" | cut -d '=' -f2 || true)
  if [ -n "$HELLO_WORLD_ID" ]; then
    export DAPP_ORIGIN_CANISTER="http://${HELLO_WORLD_ID}.localhost:8080"
  fi

  NOTEPAD_ID=$(grep VITE_MY_NOTEPAD_CANISTER_ID "$REPO_ROOT/tests/test.env" | cut -d '=' -f2 || true)
  if [ -n "$NOTEPAD_ID" ]; then
    export DAPP_ORIGIN_NOTEPAD="http://${NOTEPAD_ID}.localhost:8080"
  fi
fi
