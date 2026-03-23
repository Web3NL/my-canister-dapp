#!/bin/bash
set -euo pipefail

# 📤 Upload a gzipped WASM file to the wasm-registry canister.
#
# Usage: ./scripts/upload-wasm-to-registry.sh <name> <description> <version> <wasm-gz-path> [icp-args...]
#
# Example:
#   ./scripts/upload-wasm-to-registry.sh \
#     "my-hello-world" \
#     "The Internet Computer Hello World Dapp" \
#     "5.0.0" \
#     "wasm/my-hello-world.wasm.gz" \
#     -e local --identity ident-1

NAME="$1"
DESCRIPTION="$2"
VERSION="$3"
WASM_GZ_PATH="$4"
shift 4

# Remaining args are passed to icp canister call (e.g. -e local --identity ident-1)
EXTRA_ARGS=("$@")

if [ ! -f "$WASM_GZ_PATH" ]; then
  echo "❌ ERROR: WASM file not found: $WASM_GZ_PATH"
  exit 1
fi

# macOS/Linux compatible file size
FILE_SIZE=$(stat -f%z "$WASM_GZ_PATH" 2>/dev/null || stat -c%s "$WASM_GZ_PATH")
echo "📤 Uploading $NAME v$VERSION ($FILE_SIZE bytes) to wasm-registry..."

# Encode argument as Candid binary hex written to a temp file
# (hex string is ~1.6MB which exceeds ARG_MAX for command-line args)
SCRIPT_DIR="$(dirname "$0")"

TMPFILE=$(mktemp)
echo "📝 Encoding Candid argument to $TMPFILE..."
node "$SCRIPT_DIR/encode-upload-arg.mjs" "$NAME" "$DESCRIPTION" "$VERSION" "$WASM_GZ_PATH" > "$TMPFILE"

echo "📤 Calling wasm-registry upload_wasm..."
icp canister call wasm-registry upload_wasm --args-file "$TMPFILE" --args-format hex "${EXTRA_ARGS[@]}"
rm -f "$TMPFILE"

echo "✅ Upload complete!"
