# Testing Overview

**Last Updated:** 2026-01-12

## Test Summary

| Package | Unit Tests | Notes |
|---------|------------|-------|
| @web3nl/vite-plugin-canister-dapp | 30 | Vite plugin config & runtime |
| @web3nl/my-canister-dashboard | 42 | Actor, dashboard, utils |
| canister-dashboard-frontend | 115 | API classes, helpers, utils |
| my-canister-app | 43 | Pure functions, balance, pendingCanister |
| my-canister-dashboard (Rust) | 30 | Pure functions, asset configs |
| my-canister-frontend (Rust) | 16 | Asset router, MIME types |
| canister-dapp-test | 1 | PocketIC integration test |

**Total: 277 unit tests**

## E2E Tests (Playwright)

- canister-dashboard-frontend: topup, controllers, alternative-origins, topup-rule
- my-canister-app: install-dapp flow
- my-hello-world-frontend: example dapp

## Running Tests

```bash
# All tests
./scripts/run-test.sh

# JS/TS unit tests only
npm run test --workspaces

# Rust unit tests only
cargo test -p my-canister-dashboard
cargo test -p my-canister-frontend

# E2E tests (requires dfx)
npm run test:e2e
```

## Coverage Gaps

- **my-hello-world-frontend**: No unit tests (example code)
- **Rust guards/error paths**: Require PocketIC testing
- **my-canister-app API classes**: Not yet covered (CmcApi, LedgerApi, etc.)
