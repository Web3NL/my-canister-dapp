#!/bin/bash
set -euo pipefail

# Add or update a dashboard asset hash entry in asset-hashes.json.
# Used by the pre-release hook to record hashes for each published version.
#
# Usage: ./scripts/add-asset-hash-entry.sh [version]
#   If version is omitted, reads from packages-rs/my-canister-dashboard/Cargo.toml.

cd "$(dirname "$0")/.."

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  VERSION="${RELEASE_VERSION:-}"
fi
if [ -z "$VERSION" ]; then
  VERSION=$(grep '^version' packages-rs/my-canister-dashboard/Cargo.toml | head -1 | sed 's/.*"\(.*\)"/\1/')
  echo "Using version from Cargo.toml: $VERSION"
fi

ASSETS_DIR="packages-rs/my-canister-dashboard/assets"
HASHES_FILE="packages-rs/my-canister-dashboard/asset-hashes.json"

if [ ! -f "$ASSETS_DIR/index.html" ] || [ ! -f "$ASSETS_DIR/index.js" ] || [ ! -f "$ASSETS_DIR/style.css" ]; then
  echo "ERROR: Dashboard assets not found in $ASSETS_DIR"
  echo "Run ./scripts/prebuild-mcd.sh first."
  exit 1
fi

HTML_HASH=$(shasum -a 256 "$ASSETS_DIR/index.html" | cut -d' ' -f1)
JS_HASH=$(shasum -a 256 "$ASSETS_DIR/index.js" | cut -d' ' -f1)
CSS_HASH=$(shasum -a 256 "$ASSETS_DIR/style.css" | cut -d' ' -f1)

python3 -c "
import json

with open('$HASHES_FILE') as f:
    entries = json.load(f)

entries = [e for e in entries if e['version'] != '$VERSION']
entries.append({
    'version': '$VERSION',
    'html': '$HTML_HASH',
    'js': '$JS_HASH',
    'css': '$CSS_HASH'
})

with open('$HASHES_FILE', 'w') as f:
    json.dump(entries, f, indent=2)
    f.write('\n')
"

git add "$HASHES_FILE"

echo "Updated $HASHES_FILE with version $VERSION"
echo "  html: $HTML_HASH"
echo "  js:   $JS_HASH"
echo "  css:  $CSS_HASH"
