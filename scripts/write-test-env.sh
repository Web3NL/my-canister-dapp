#!/bin/bash
set -euo pipefail

# Write tests/test.env with the NNS II URL and any discovered canister IDs.
# The NNS II (rdmx6-jaaaa-aaaaa-aaadq-cai) is provisioned automatically by
# the local network (nns: true, ii: true in icp.yaml).

# Ensure we're in the project root directory
cd "$(dirname "$0")/.."

II_CANISTER_ID="rdmx6-jaaaa-aaaaa-aaadq-cai"
HELLO_WORLD_ID=$((cd examples && icp canister status my-hello-world -e local --id-only) 2>/dev/null || echo "")
APP_CANISTER_ID=$((cd canisters && icp canister status my-canister-app -e local --id-only) 2>/dev/null || echo "")

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

# Add wasm-registry canister ID if it exists
WASM_REGISTRY_ID=$((cd canisters && icp canister status wasm-registry -e local --id-only) 2>/dev/null || echo "")
if [ -n "$WASM_REGISTRY_ID" ]; then
  echo "VITE_WASM_REGISTRY_CANISTER_ID=${WASM_REGISTRY_ID}" >> tests/test.env
fi

echo ""
echo "System canisters ready:"
echo "  - CMC:     rkp4c-7iaaa-aaaaa-aaaca-cai (NNS)"
echo "  - Ledger:  ryjl3-tyaaa-aaaaa-aaaba-cai (NNS)"
echo "  - Index:   qhbym-qaaaa-aaaaa-aaafq-cai (NNS)"
echo "  - II:      ${II_CANISTER_ID} (NNS)"
