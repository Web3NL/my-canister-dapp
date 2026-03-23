#!/bin/bash
set -euo pipefail

# Phase 2: Start local network, set up identities, generate test.env, fund test account.

source "$(dirname "$0")/constants.sh"
cd "$REPO_ROOT"

# 🔑 Set up test identity
echo "🔑 Setting up test identity..."
./scripts/setup-identity.sh
icp identity default ident-1

# 🌐 Start fresh local network (PocketIC with NNS + II)
echo "🌐 Starting local network..."
icp network stop local 2>/dev/null || true
icp network start local -d

# 📝 Write test.env with NNS II URL and any discovered canister IDs
./scripts/write-test-env.sh

# 💰 Transfer ICP to ident-1 for testing
echo "💰 Transferring ICP to ident-1..."
IDENT1_PRINCIPAL=$(icp identity principal --identity ident-1)
icp token transfer 100 "$IDENT1_PRINCIPAL" -n local
echo "💰 ident-1 balance:"
icp token balance --identity ident-1 -n local
