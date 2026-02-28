#!/bin/bash
set -euo pipefail

# Batch-build all Rust canister wasm targets in a single cargo invocation,
# then shrink and compress each for deployment.
#
# Prerequisites: all frontend assets that get embedded in Rust canisters
# must be built before running this script.

echo "Building all Rust canister wasms..."
cargo build --target wasm32-unknown-unknown --release \
  -p wasm-registry \
  -p my-hello-world \
  -p my-notepad \
  -p demos

WASM_DIR="target/wasm32-unknown-unknown/release/deps"
OUT_DIR="wasm"
mkdir -p "$OUT_DIR"

# Process each wasm: cargo output name (underscore) → output name (hyphenated)
shrink_and_compress() {
  local cargo_name="$1"
  local output_name="$2"
  echo "Shrinking and compressing ${output_name}..."
  local tmpdir
  tmpdir=$(mktemp -d)
  ic-wasm "${WASM_DIR}/${cargo_name}.wasm" -o "${tmpdir}/${output_name}.wasm" shrink
  gzip -9 "${tmpdir}/${output_name}.wasm"
  cp "${tmpdir}/${output_name}.wasm.gz" "${OUT_DIR}/${output_name}.wasm.gz"
  rm -rf "$tmpdir"
}

shrink_and_compress "wasm_registry" "wasm-registry"
shrink_and_compress "my_hello_world" "my-hello-world"
shrink_and_compress "my_notepad" "my-notepad"
shrink_and_compress "demos" "demos"

echo "All wasms built and compressed in ${OUT_DIR}/"
