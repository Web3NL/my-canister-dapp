# @web3nl/my-canister-dashboard

Utility functions for canisters using My Canister Dashboard on the Internet Computer.

## Installation

```bash
npm install @web3nl/my-canister-dashboard
```

## Usage

### Basic Setup

```typescript
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';

const agent = await HttpAgent.create(...);
const canisterId = Principal.fromText('your-canister-id');

const dashboard = MyCanisterDashboard.create(agent, canisterId);
```

### Check Cycles Balance

```typescript
// Basic cycles check
const result = await dashboard.checkCyclesBalance();
```
