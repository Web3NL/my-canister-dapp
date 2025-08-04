#!/bin/bash
set -e

TARGET_PATH="$1"

if [ -z "$TARGET_PATH" ]; then
  echo "Usage: $0 <target-path>"
  echo "Creates .env.development file at target path"
  exit 1
fi

echo "Creating .env.development at $TARGET_PATH..."

# Create .env.development file with hardcoded values
cat > "$TARGET_PATH/.env.development" << EOF
CANISTER_ID=22ajg-aqaaa-aaaap-adukq-cai
II_CANISTER_ID=qhbym-qaaaa-aaaaa-aaafq-cai
DFX_PROTOCOL=http
DFX_HOSTNAME=localhost
DFX_PORT=8080
EOF

echo "✓ Created .env.development at $TARGET_PATH"