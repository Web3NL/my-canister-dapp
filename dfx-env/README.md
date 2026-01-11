# dfx-env

Local development environment for testing with system canisters.

## Setup

Start dfx with system canisters (dfx 0.30+):

```bash
dfx start --clean --background --system-canisters
./deploy-all.sh
```

## System Canisters

| Canister | ID | Source |
|----------|-----|--------|
| nns-cycles-minting (CMC) | `rkp4c-7iaaa-aaaaa-aaaca-cai` | Built-in |
| nns-ledger (ICP Ledger) | `ryjl3-tyaaa-aaaaa-aaaba-cai` | Built-in |
| nns-index (ICP Index) | `qhbym-qaaaa-aaaaa-aaafq-cai` | Built-in |
| internet-identity | `uxrrr-q7777-77774-qaaaq-cai` | Custom |

**Note**: Internet Identity uses a custom deployment because the built-in II
has a newer UI incompatible with our e2e tests, and cannot be overridden
(controlled by NNS root).

## Pre-funding

The anonymous identity is initialized with 1,000,000,000 ICP.
`deploy-all.sh` transfers ICP from anonymous to `ident-1` for local testing.

## Artifact Sources

### ICP Ledger (fallback only)

- Candid: https://raw.githubusercontent.com/dfinity/ic/5ba1412f9175d987661ae3c0d8dbd1ac3e092b7d/rs/rosetta-api/icp_ledger/ledger.did
- WASM: https://download.dfinity.systems/ic/5ba1412f9175d987661ae3c0d8dbd1ac3e092b7d/canisters/ledger-canister.wasm.gz

### Internet Identity (deployed by deploy-all.sh)

- Candid: https://raw.githubusercontent.com/dfinity/internet-identity/release-2024-05-13/src/internet_identity/internet_identity.did
- WASM: https://github.com/dfinity/internet-identity/releases/download/release-2024-05-13/internet_identity_dev.wasm.gz

### ICP Index (fallback only)

- Candid: https://github.com/dfinity/ic/releases/download/ledger-suite-icp-2025-05-15/index.did
- WASM: https://github.com/dfinity/ic/releases/download/ledger-suite-icp-2025-05-15/ic-icp-index-canister.wasm.gz
