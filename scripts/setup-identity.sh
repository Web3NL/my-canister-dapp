#!/bin/bash
set -euo pipefail

# 🔑 Setup icp-cli identity for testing

echo "🔑 Setting up test identity..."

# Create a temporary PEM file for import
PEM_FILE=$(mktemp)
cat <<EOF > "$PEM_FILE"
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEICJxApEbuZznKFpV+VKACRK30i6+7u5Z13/DOl18cIC+oAcGBSuBBAAK
oUQDQgAEPas6Iag4TUx+Uop+3NhE6s3FlayFtbwdhRVjvOar0kPTfE/N8N6btRnd
74ly5xXEBNSXiENyxhEuzOZrIWMCNQ==
-----END EC PRIVATE KEY-----
EOF

# Import identity (ignore error if already exists)
icp identity import ident-1 --from-pem "$PEM_FILE" --storage plaintext 2>/dev/null || true
rm -f "$PEM_FILE"

echo "✅ Identity setup complete"
