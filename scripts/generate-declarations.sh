#!/usr/bin/env bash

set -euo pipefail

# Ensure we're in the project root directory
cd "$(dirname "$0")/.."

# --- my-canister-dashboard ---
DASHBOARD_DID="packages-js/my-canister-dashboard-js/candid/my-canister-dashboard.did"
DASHBOARD_OUT="packages-js/my-canister-dashboard-js"

if [[ ! -f "$DASHBOARD_DID" ]]; then
  echo "Error: $DASHBOARD_DID not found." >&2
  exit 1
fi

echo "Generating declarations for my-canister-dashboard"
npx icp-bindgen \
  --did-file "$DASHBOARD_DID" \
  --out-dir "$DASHBOARD_OUT" \
  --actor-disabled \
  --force

echo "Declarations generated in $DASHBOARD_OUT/declarations"

# --- wasm-registry ---
REGISTRY_DID="canisters/wasm-registry/wasm-registry.did"
REGISTRY_OUT="canisters/my-canister-app/src/lib/declarations/wasm-registry"

if [[ ! -f "$REGISTRY_DID" ]]; then
  echo "Skipping wasm-registry declarations: $REGISTRY_DID not found."
else
  # icp-bindgen writes to <out-dir>/declarations/, so use a temp dir and move
  TMPDIR="$(mktemp -d)"
  npx icp-bindgen \
    --did-file "$REGISTRY_DID" \
    --out-dir "$TMPDIR" \
    --actor-disabled \
    --force

  mkdir -p "$REGISTRY_OUT"
  cp "$TMPDIR/declarations/"* "$REGISTRY_OUT/"
  rm -rf "$TMPDIR"

  echo "Declarations generated in $REGISTRY_OUT"
fi
