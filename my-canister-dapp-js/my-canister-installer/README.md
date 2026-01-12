# @web3nl/my-canister-installer

Reusable utilities for Internet Computer canister installation logic.

## Installation

```bash
npm install @web3nl/my-canister-installer
```

**Peer dependency:** This package requires `@icp-sdk/core` ^5.0.0.

## Usage

### ICP-to-Cycles Calculation

Calculate how much ICP (in e8s) is needed to obtain a target amount of cycles:

```typescript
import { calculateIcpFromCyclesRate, E8S_PER_TOKEN } from '@web3nl/my-canister-installer';

const targetCycles = 1_000_000_000_000n; // 1T cycles
const cmcRate = 50_000n; // From CMC.get_icp_xdr_conversion_rate()
const icpNeeded = calculateIcpFromCyclesRate(targetCycles, cmcRate);
// Returns: 20_000_000n (0.2 ICP in e8s)
```

### Derivation Origin

Create Internet Identity derivation origin URLs for canister authentication:

```typescript
import { createDerivationOriginFromHost } from '@web3nl/my-canister-installer';

// Production (mainnet)
const origin = createDerivationOriginFromHost(
  'rrkah-fqaaa-aaaaa-aaaaq-cai',
  'https://icp0.io'
);
// Returns: 'https://rrkah-fqaaa-aaaaa-aaaaq-cai.icp0.io'

// Local development
const localOrigin = createDerivationOriginFromHost(
  'rrkah-fqaaa-aaaaa-aaaaq-cai',
  'http://localhost:4943'
);
// Returns: 'http://rrkah-fqaaa-aaaaa-aaaaq-cai.localhost:4943'
```

### Pending Canister Recovery

Handle partial canister creation failures gracefully:

```typescript
import {
  setPendingCanister,
  getPendingCanister,
  clearPendingCanister,
  PartialCreationError,
} from '@web3nl/my-canister-installer';

// Before canister creation, check for pending recovery
const pending = getPendingCanister();
if (pending) {
  // Resume installation on existing canister
  await installCode(pending, wasmModule);
  clearPendingCanister();
  return pending;
}

// Store canister ID immediately after creation (before install)
setPendingCanister(canisterId);

try {
  await installCode(canisterId, wasmModule);
  clearPendingCanister(); // Success - clear pending state
} catch (error) {
  // Throw recoverable error with canister ID
  throw new PartialCreationError(canisterId, error);
}
```

### Custom Storage (Testing)

Inject custom storage for testing or non-browser environments:

```typescript
import { setStorage, resetStorage, type PendingCanisterStorage } from '@web3nl/my-canister-installer';

const mockStorage: PendingCanisterStorage = {
  get: (key) => myStore.get(key),
  set: (key, value) => myStore.set(key, value),
  remove: (key) => myStore.delete(key),
};

setStorage(mockStorage);
// ... run tests ...
resetStorage(); // Restore default localStorage
```

## API Reference

### Functions

| Function | Description |
|----------|-------------|
| `calculateIcpFromCyclesRate(targetCycles, rate, e8sPerToken?)` | Calculate ICP needed for cycles (ceiling division) |
| `createDerivationOriginFromHost(canisterId, host)` | Create II derivation origin URL |
| `setPendingCanister(canisterId)` | Store pending canister ID for recovery |
| `getPendingCanister()` | Retrieve pending canister (or null) |
| `clearPendingCanister()` | Clear pending canister state |
| `setStorage(storage)` | Inject custom storage implementation |
| `resetStorage()` | Reset to default localStorage |

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `E8S_PER_TOKEN` | `100_000_000n` | e8s per 1 ICP token |

### Types

| Type | Description |
|------|-------------|
| `PendingCanisterStorage` | Interface for storage abstraction |
| `PartialCreationError` | Error class for partial creation failures |

## License

MIT
