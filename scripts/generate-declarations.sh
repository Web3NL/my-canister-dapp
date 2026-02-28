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

# Format generated files to match project Prettier config
npx prettier --write "$DASHBOARD_OUT/declarations/"*.js "$DASHBOARD_OUT/declarations/"*.ts 2>/dev/null || true

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

  # Format generated files to match project Prettier config
  npx prettier --write "$REGISTRY_OUT/"*.js "$REGISTRY_OUT/"*.ts 2>/dev/null || true

  echo "Declarations generated in $REGISTRY_OUT"
fi

# --- demos ---
DEMOS_DID="canisters/demos/demos.did"
DEMOS_OUT="canisters/my-canister-app/src/lib/declarations/demos"

if [[ ! -f "$DEMOS_DID" ]]; then
  echo "Skipping demos declarations: $DEMOS_DID not found."
else
  TMPDIR="$(mktemp -d)"
  npx icp-bindgen \
    --did-file "$DEMOS_DID" \
    --out-dir "$TMPDIR" \
    --actor-disabled \
    --force

  mkdir -p "$DEMOS_OUT"
  cp "$TMPDIR/declarations/"* "$DEMOS_OUT/"
  rm -rf "$TMPDIR"

  npx prettier --write "$DEMOS_OUT/"*.js "$DEMOS_OUT/"*.ts 2>/dev/null || true

  echo "Declarations generated in $DEMOS_OUT"
fi
