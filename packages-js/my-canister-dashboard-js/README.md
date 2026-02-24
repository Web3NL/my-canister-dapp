# My Canister Dashboard

[![npm version](https://img.shields.io/npm/v/@web3nl/my-canister-dashboard)](https://www.npmjs.com/package/@web3nl/my-canister-dashboard)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://web3nl.github.io/my-canister-dapp/web3nl-my-canister-dashboard-js/)
[![Build Status](https://github.com/Web3NL/my-canister-dapp/workflows/Publish%20Dashboard%20Package/badge.svg)](https://github.com/Web3NL/my-canister-dapp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

Utility functions for Canister Dapps on the Internet Computer.

Used in conjunction with [my-canister-dashboard Rust crate](https://crates.io/crates/my-canister-dashboard)

## Installation

```bash
npm install @web3nl/my-canister-dashboard
```

## Usage

### Check Cycles Balance

```typescript
import { HttpAgent } from '@dfinity/agent';
import {
  MyCanisterDashboard,
  inferCanisterIdFromLocation,
} from '@web3nl/my-canister-dashboard';

// IMPORTANT: Infer canister ID from current browser window location
const canisterId = inferCanisterIdFromLocation();

// Initialize agent with identity (identity should be obtained from auth-client)
const agent = new HttpAgent({
  host: 'https://icp0.io',
  identity, // Assumes identity is available in scope
});

// Create dashboard instance
const dashboard = MyCanisterDashboard.create(agent, canisterId);

// Check cycles balance
const result = await dashboard.checkCyclesBalance();

if ('ok' in result) {
  console.log(`Cycles balance: ${result.ok}`);
} else {
  console.error(`Error: ${result.error}`);
}

// Check with custom threshold
const customResult = await dashboard.checkCyclesBalance({
  threshold: BigInt(1_000_000_000), // 1B cycles
});
```
