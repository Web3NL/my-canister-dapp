#!/bin/bash
set -euo pipefail

echo "Copying WASM to registry..."

# The @dfinity/rust recipe builds via cargo but doesn't leave a .wasm.gz artifact on disk.
# We take the cargo-built wasm, shrink it with ic-wasm, and gzip it ourselves.
CARGO_WASM="target/wasm32-unknown-unknown/release/deps/my_hello_world.wasm"

if [ ! -f "$CARGO_WASM" ]; then
  echo "ERROR: Could not find my-hello-world wasm at $CARGO_WASM"
  echo "Run 'icp build my-hello-world' first."
  exit 1
fi

# Shrink and compress the wasm
TMPDIR=$(mktemp -d)
ic-wasm "$CARGO_WASM" -o "$TMPDIR/my-hello-world.wasm" shrink
gzip -9 "$TMPDIR/my-hello-world.wasm"
WASM_GZ="$TMPDIR/my-hello-world.wasm.gz"

# Copy to root wasm directory (for vite dev server)
mkdir -p wasm
cp "$WASM_GZ" wasm/my-hello-world.wasm.gz

# Copy to static directory (for production build)
mkdir -p my-canister-app/static/wasm
cp "$WASM_GZ" my-canister-app/static/wasm/my-hello-world.wasm.gz

rm -rf "$TMPDIR"

echo "WASM copied successfully! (shrunk and compressed from $CARGO_WASM)"
