#!/bin/bash
set -euo pipefail

# Build all Rust canister wasms using icp-cli, then gzip for deployment.
#
# Prerequisites: all frontend assets that get embedded in Rust crates
# must be built before running this script (icp build triggers cargo
# which uses include_dir! to embed frontend/dist).

ARTIFACT_DIR=".icp/cache/artifacts"
OUT_DIR="wasm"
mkdir -p "$OUT_DIR"

# 🔨 Build all canister wasms
echo "🔨 Building canister wasms with icp-cli..."
icp build wasm-registry my-hello-world my-notepad demos

# 🗜️ Compress each wasm for deployment
echo "🗜️ Compressing wasm-registry..."
gzip -9 -c "${ARTIFACT_DIR}/wasm-registry" > "${OUT_DIR}/wasm-registry.wasm.gz"

echo "🗜️ Compressing my-hello-world..."
gzip -9 -c "${ARTIFACT_DIR}/my-hello-world" > "${OUT_DIR}/my-hello-world.wasm.gz"

echo "🗜️ Compressing my-notepad..."
gzip -9 -c "${ARTIFACT_DIR}/my-notepad" > "${OUT_DIR}/my-notepad.wasm.gz"

echo "🗜️ Compressing demos..."
gzip -9 -c "${ARTIFACT_DIR}/demos" > "${OUT_DIR}/demos.wasm.gz"

echo "✅ All wasms built and compressed in ${OUT_DIR}/"
