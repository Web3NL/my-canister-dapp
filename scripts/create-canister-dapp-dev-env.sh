#!/bin/bash
set -e

TARGET_PATH="$1"

if [ -z "$TARGET_PATH" ]; then
  echo "Usage: $0 <target-path>"
  echo "Creates .env.development file at target path with VITE_ prefixed variables"
  exit 1
fi

echo "Creating .env.development at $TARGET_PATH..."

# Create .env.development file with VITE_ prefixed values for Vite auto-loading
cat > "$TARGET_PATH/.env.development" << EOF
VITE_CANISTER_ID=22ajg-aqaaa-aaaap-adukq-cai
VITE_II_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_DFX_PROTOCOL=http
VITE_DFX_HOSTNAME=localhost
VITE_DFX_PORT=8080
EOF

echo "✓ Created .env.development at $TARGET_PATH"