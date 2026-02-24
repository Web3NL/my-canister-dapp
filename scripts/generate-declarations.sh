#!/usr/bin/env bash

set -euo pipefail

# Ensure we're in the project root directory
cd "$(dirname "$0")/.."

INPUT_DID="packages-js/my-canister-dashboard-js/candid/my-canister-dashboard.did"
OUT_DIR="packages-js/my-canister-dashboard-js/declarations"
TS_OUT="$OUT_DIR/my-canister-dashboard.did.d.ts"
JS_OUT="$OUT_DIR/my-canister-dashboard.did.js"

# Ensure didc exists; if missing on Linux CI, copy from the repo's ./bin prepared artifact
if ! command -v didc >/dev/null 2>&1; then
  OS_NAME="$(uname -s || echo unknown)"
  if [[ "$OS_NAME" == "Linux" ]]; then
  # Use our repo-checked Linux didc if present
    BIN_DIR="$(pwd)/bin"
    DIDC_CANDIDATE=""
    if [[ -d "$BIN_DIR" ]]; then
      # pick highest version if multiple
      DIDC_CANDIDATE="$(ls -1 "$BIN_DIR"/didc-v*-linux-* 2>/dev/null | sort -V | tail -n 1 || true)"
    fi
    if [[ -n "$DIDC_CANDIDATE" && -r "$DIDC_CANDIDATE" ]]; then
      echo "didc not in PATH; installing from $DIDC_CANDIDATE"
      # Choose a writable install path
      INSTALL_DIR="/usr/local/bin"
      if [[ ! -w "$INSTALL_DIR" ]]; then
        # fallback to user local bin
        INSTALL_DIR="$HOME/.local/bin"
        mkdir -p "$INSTALL_DIR"
        # ensure it's in PATH for this script execution
        export PATH="$INSTALL_DIR:$PATH"
      fi
      install -m 0755 "$DIDC_CANDIDATE" "$INSTALL_DIR/didc"
    fi
  fi
fi

if ! command -v didc >/dev/null 2>&1; then
  echo "Error: didc is not installed or not in PATH." >&2
  echo "Ensure a Linux binary exists under ./bin (e.g. ./bin/didc-v0.4.0-linux-amd64), or install didc from https://github.com/dfinity/candid/tree/master/tools/didc." >&2
  exit 1
fi

if [[ ! -f "$INPUT_DID" ]]; then
  echo "Error: $INPUT_DID not found." >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "Generating TypeScript declarations (didc ts) -> $TS_OUT"
# didc's TS target emits a .ts file content; we want .d.ts for consumption
# We still write to .d.ts as in our repo convention
didc bind --target ts "$INPUT_DID" > "$TS_OUT"

echo "Generating JavaScript idlFactory (didc js) -> $JS_OUT"
didc bind --target js "$INPUT_DID" > "$JS_OUT"

echo "✅ Declarations generated in $OUT_DIR"

# --- wasm-registry ---
REGISTRY_DID="canisters/wasm-registry/wasm-registry.did"
REGISTRY_OUT_DIR="canisters/my-canister-app/src/lib/declarations/wasm-registry"
REGISTRY_TS_OUT="$REGISTRY_OUT_DIR/wasm-registry.did.d.ts"
REGISTRY_JS_OUT="$REGISTRY_OUT_DIR/wasm-registry.did.js"

if [[ ! -f "$REGISTRY_DID" ]]; then
  echo "Skipping wasm-registry declarations: $REGISTRY_DID not found."
else
  mkdir -p "$REGISTRY_OUT_DIR"

  echo "Generating TypeScript declarations (didc ts) -> $REGISTRY_TS_OUT"
  didc bind --target ts "$REGISTRY_DID" > "$REGISTRY_TS_OUT"
  # Fix imports: didc generates @dfinity/ but this project uses @icp-sdk/core/
  sed -i.bak \
    -e "s|from '@dfinity/principal'|from '@icp-sdk/core/principal'|g" \
    -e "s|from '@dfinity/agent'|from '@icp-sdk/core/agent'|g" \
    -e "s|from '@dfinity/candid'|from '@icp-sdk/core/candid'|g" \
    "$REGISTRY_TS_OUT"
  rm -f "${REGISTRY_TS_OUT}.bak"

  echo "Generating JavaScript idlFactory (didc js) -> $REGISTRY_JS_OUT"
  didc bind --target js "$REGISTRY_DID" > "$REGISTRY_JS_OUT"

  # Format generated JS to match project Prettier config (didc output uses
  # quoted keys and spacing that differs from the project style)
  if command -v npx >/dev/null 2>&1; then
    echo "Formatting $REGISTRY_JS_OUT with Prettier"
    npx prettier --write "$REGISTRY_JS_OUT" 2>/dev/null || true
  fi

  echo "✅ Declarations generated in $REGISTRY_OUT_DIR"
fi
