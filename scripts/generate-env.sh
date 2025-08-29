#!/bin/bash
set -e

# Generates root .env.development and per-app .env.development files.

ROOT_ENV_FILE=".env.development"

echo "Generating $ROOT_ENV_FILE at repository root..."
cat > "$ROOT_ENV_FILE" << 'EOF'
VITE_IDENTITY_PROVIDER=http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080

VITE_DFXHOST=http://localhost:8080
VITE_HOSTNAME=localhost:8080
VITE_DFX_PROTOCOL=http
VITE_DFX_HOSTNAME=localhost
VITE_DFX_PORT=8080
VITE_DFX_HOST=http://localhost:8080

VITE_MY_HELLO_WORLD_CANISTER_ID=22ajg-aqaaa-aaaap-adukq-cai
VITE_CANISTER_ID=22ajg-aqaaa-aaaap-adukq-cai
VITE_DASHBOARD_CANISTER_ID=22ajg-aqaaa-aaaap-adukq-cai
VITE_II_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai

VITE_MY_CANISTER_APP_CANISTER_ID=c7lwu-3qaaa-aaaam-qbgia-cai
EOF
echo "✓ Wrote $ROOT_ENV_FILE"

# Reuse existing helper to generate per-app envs (kept minimal, consolidated entrypoint)
echo "Generating per-app .env.development files..."
bash ./scripts/create-canister-dapp-dev-env.sh my-canister-dapp-js/canister-dashboard-frontend/src
bash ./scripts/create-canister-dapp-dev-env.sh examples/my-hello-world/src/my-hello-world-frontend
echo "✓ Per-app .env.development files generated"
