#!/bin/bash
# System canisters (CMC, Ledger, Index) are provided by dfx start --system-canisters
# This script deploys our custom II and transfers ICP to test accounts.
#
# The anonymous identity is pre-funded with 1,000,000,000 ICP by --system-canisters.
# We transfer some of that to ident-1 for local testing.
#
# Note: We deploy our own II because the built-in II has a newer UI incompatible
# with our e2e tests, and we cannot override it (controlled by NNS root).

set -e

echo "Deploying custom Internet Identity..."
dfx deploy internet-identity

export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id --identity ident-1)

echo "Transferring ICP from anonymous identity to ident-1..."
dfx ledger transfer "$DEFAULT_ACCOUNT_ID" --identity anonymous --memo 0 --amount 100

echo "ident-1 balance:"
dfx ledger balance --identity ident-1

echo ""
echo "System canisters ready:"
echo "  - CMC:        rkp4c-7iaaa-aaaaa-aaaca-cai (built-in)"
echo "  - Ledger:     ryjl3-tyaaa-aaaaa-aaaba-cai (built-in)"
echo "  - Index:      qhbym-qaaaa-aaaaa-aaafq-cai (built-in)"
echo "  - II:         uxrrr-q7777-77774-qaaaq-cai (custom)"