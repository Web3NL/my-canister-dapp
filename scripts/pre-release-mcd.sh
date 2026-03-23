#!/bin/bash
set -euo pipefail

# Pre-release hook for the my-canister-dashboard crate.
# Parallel: frontend build + cargo fmt run concurrently.
# Then: copy assets → record hashes → cargo clippy.

cd "$(dirname "$0")/.."

# ================================================================
# 🔨 Frontend Build + 🔍 cargo fmt — parallel
# ================================================================
echo "🔨 Building dashboard frontend + 🔍 running cargo fmt in parallel..."
npm run build --workspace=canister-dashboard-frontend &
pid_npm=$!
cargo fmt -p my-canister-dashboard &
pid_fmt=$!

wait $pid_npm
echo "✅ Dashboard frontend built"
wait $pid_fmt
echo "✅ cargo fmt complete"

# ================================================================
# 📦 Copy Assets to Rust Crate
# ================================================================
echo "📦 Copying assets from frontend dist to Rust crate..."
mkdir -p packages-rs/my-canister-dashboard/assets
rm -rf packages-rs/my-canister-dashboard/assets/*
cp -r packages-rs/my-canister-dashboard/frontend/dist/* packages-rs/my-canister-dashboard/assets/

# ================================================================
# 📝 Record Asset Hashes
# ================================================================
echo "📝 Recording asset hashes..."

# NEW_VERSION is set by cargo-release; fall back to reading Cargo.toml
VERSION="${NEW_VERSION:-}"
if [ -z "$VERSION" ]; then
  VERSION=$(grep '^version' packages-rs/my-canister-dashboard/Cargo.toml | head -1 | sed 's/.*"\(.*\)"/\1/')
  echo "📝 Using version from Cargo.toml: $VERSION"
fi

ASSETS_DIR="packages-rs/my-canister-dashboard/assets"
HASHES_FILE="packages-rs/my-canister-dashboard/asset-hashes.json"

if [ ! -f "$ASSETS_DIR/index.html" ] || [ ! -f "$ASSETS_DIR/index.js" ] || [ ! -f "$ASSETS_DIR/style.css" ]; then
  echo "❌ ERROR: Dashboard assets not found in $ASSETS_DIR"
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
echo "✅ Updated $HASHES_FILE with version $VERSION"
echo "  html: $HTML_HASH"
echo "  js:   $JS_HASH"
echo "  css:  $CSS_HASH"

# ================================================================
# 🔍 cargo clippy
# ================================================================
echo "🔍 Running cargo clippy for my-canister-dashboard..."
cargo clippy -p my-canister-dashboard --all-targets --all-features -- -D warnings

echo "✅ Pre-release hook complete"
