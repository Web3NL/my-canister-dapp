#!/usr/bin/env bash

set -euo pipefail

# Ensure we're in the project root directory
cd "$(dirname "$0")/.."

INPUT_DID="candid/my-canister.did"
OUT_DIR="declarations/my-canister"
TS_OUT="$OUT_DIR/my-canister.did.d.ts"
JS_OUT="$OUT_DIR/my-canister.did.js"

if ! command -v didc >/dev/null 2>&1; then
  echo "Error: didc is not installed or not in PATH." >&2
  echo "Install from https://github.com/dfinity/candid/tree/master/tools/didc and try again." >&2
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
