#!/bin/bash
set -euo pipefail

# Deploy custom Internet Identity with dummy_auth for e2e tests.
# This creates a separate II canister (not the NNS-managed one at the mainnet ID).
# The NNS II at rdmx6-jaaaa-aaaaa-aaadq-cai exists but doesn't have dummy_auth.

echo "Deploying custom Internet Identity (CAPTCHA disabled, dummy auth for e2e tests)..."
icp deploy internet-identity -e local

# Discover the auto-assigned canister IDs
II_CANISTER_ID=$(icp canister status internet-identity -e local --id-only)
HELLO_WORLD_ID=$(icp canister status my-hello-world -e local --id-only 2>/dev/null || echo "")
APP_CANISTER_ID=$(icp canister status my-canister-app -e local --id-only 2>/dev/null || echo "")

echo "Custom II deployed at: $II_CANISTER_ID"

# Write test.env with discovered canister IDs
cat > tests/test.env <<EOF
VITE_IDENTITY_PROVIDER=http://${II_CANISTER_ID}.localhost:8080
VITE_HOSTNAME=localhost:8080
EOF

# Add hello-world ID if it exists (may not exist yet during bootstrap)
if [ -n "$HELLO_WORLD_ID" ]; then
  echo "VITE_MY_HELLO_WORLD_CANISTER_ID=${HELLO_WORLD_ID}" >> tests/test.env
fi

# Add app canister ID if it exists
if [ -n "$APP_CANISTER_ID" ]; then
  echo "VITE_MY_CANISTER_APP_CANISTER_ID=${APP_CANISTER_ID}" >> tests/test.env
fi

echo ""
echo "System canisters ready:"
echo "  - CMC:        rkp4c-7iaaa-aaaaa-aaaca-cai (NNS)"
echo "  - Ledger:     ryjl3-tyaaa-aaaaa-aaaba-cai (NNS)"
echo "  - Index:      qhbym-qaaaa-aaaaa-aaafq-cai (NNS)"
echo "  - II (NNS):   rdmx6-jaaaa-aaaaa-aaadq-cai (no dummy_auth)"
echo "  - II (test):  ${II_CANISTER_ID} (with dummy_auth)"
