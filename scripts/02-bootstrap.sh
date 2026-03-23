#!/bin/bash
set -euo pipefail

# Phase 2: Start local network, set up identities, generate test.env, fund test account.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# ================================================================
# 🔑 Identity Setup
# ================================================================
echo "🔑 Setting up test identity..."

PEM_FILE=$(mktemp)
cat <<EOF > "$PEM_FILE"
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEICJxApEbuZznKFpV+VKACRK30i6+7u5Z13/DOl18cIC+oAcGBSuBBAAK
oUQDQgAEPas6Iag4TUx+Uop+3NhE6s3FlayFtbwdhRVjvOar0kPTfE/N8N6btRnd
74ly5xXEBNSXiENyxhEuzOZrIWMCNQ==
-----END EC PRIVATE KEY-----
EOF

icp identity import ident-1 --from-pem "$PEM_FILE" --storage plaintext 2>/dev/null || true
rm -f "$PEM_FILE"
icp identity default ident-1
echo "✅ Identity setup complete"

# ================================================================
# 🌐 Local Network
# ================================================================
echo "🌐 Starting local network..."
icp network stop local 2>/dev/null || true
icp network start local -d

# 📝 Write test.env with NNS II URL and any discovered canister IDs
./scripts/write-test-env.sh

# ================================================================
# 💰 Fund Test Account
# ================================================================
echo "💰 Transferring ICP to ident-1..."
IDENT1_PRINCIPAL=$(icp identity principal --identity ident-1)
icp token transfer 100 "$IDENT1_PRINCIPAL" -n local
echo "💰 ident-1 balance:"
icp token balance --identity ident-1 -n local
