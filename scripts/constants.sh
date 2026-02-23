#!/bin/bash
# Shared constants for build/test scripts

# Cycle amounts
export CANISTER_INITIAL_CYCLES="1000000000000"

# Canister names
export HELLO_WORLD_CANISTER="my-hello-world"

# Test environment origins (canister origin is set dynamically after canister creation)
export DAPP_ORIGIN_VITE="http://localhost:5173"

# Resolve DAPP_ORIGIN_CANISTER from test.env if it exists (set during setup)
if [ -f "tests/test.env" ]; then
  HELLO_WORLD_ID=$(grep VITE_MY_HELLO_WORLD_CANISTER_ID tests/test.env | cut -d '=' -f2 || true)
  if [ -n "$HELLO_WORLD_ID" ]; then
    export DAPP_ORIGIN_CANISTER="http://${HELLO_WORLD_ID}.localhost:8080"
  fi
fi
