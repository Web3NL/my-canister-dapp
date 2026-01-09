#!/bin/bash
set -euo pipefail

# Setup DFX identity for testing
# Reference: https://internetcomputer.org/docs/building-apps/developer-tools/dfx/dfx-nns#example-accessing-icp-on-the-command-line

echo "Setting up DFX identity..."
mkdir -p ~/.config/dfx/identity/ident-1

cat <<EOF > ~/.config/dfx/identity/ident-1/identity.pem
-----BEGIN EC PRIVATE KEY-----
MHQCAQEEICJxApEbuZznKFpV+VKACRK30i6+7u5Z13/DOl18cIC+oAcGBSuBBAAK
oUQDQgAEPas6Iag4TUx+Uop+3NhE6s3FlayFtbwdhRVjvOar0kPTfE/N8N6btRnd
74ly5xXEBNSXiENyxhEuzOZrIWMCNQ==
-----END EC PRIVATE KEY-----
EOF

dfx identity use ident-1

echo "DFX identity setup complete"