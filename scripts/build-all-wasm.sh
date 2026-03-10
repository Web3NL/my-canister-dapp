#!/bin/bash
set -euo pipefail

# Build all Rust canister wasms using icp-cli, then gzip for deployment.
#
# Prerequisites: all frontend assets that get embedded in Rust crates
# must be built before running this script (icp build triggers cargo
# which uses include_dir! to embed frontend/dist).

CANISTERS="wasm-registry my-hello-world my-notepad demos"
ARTIFACT_DIR=".icp/cache/artifacts"
OUT_DIR="wasm"
mkdir -p "$OUT_DIR"

echo "Building canister wasms with icp-cli..."
icp build $CANISTERS

for name in $CANISTERS; do
  echo "Compressing ${name}..."
  gzip -9 -c "${ARTIFACT_DIR}/${name}" > "${OUT_DIR}/${name}.wasm.gz"
done

echo "All wasms built and compressed in ${OUT_DIR}/"
