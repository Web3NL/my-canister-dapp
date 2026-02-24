# @web3nl/vite-plugin-canister-dapp

[![npm version](https://img.shields.io/npm/v/@web3nl/vite-plugin-canister-dapp)](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://web3nl.github.io/my-canister-dapp/web3nl-vite-plugin-canister-dapp/)

A Vite plugin for Internet Computer Canister Dapp environment configuration.

This plugin enables building a **single frontend/WASM that works in all environments** by:

- Embedding both development and production configurations at build time
- Providing runtime helpers to detect environment from URL origin
- Inferring canister ID from URL hostname (or fallback for Vite dev server)
- Setting up Vite dev server proxies for local IC development

## Installation

```bash
npm install --save-dev @web3nl/vite-plugin-canister-dapp
```

## Quick Start

### 1. Configure the Plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig({
  plugins: [
    canisterDappEnvironmentConfig({
      // Required for Vite dev server (localhost:5173)
      viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
    }),
  ],
});
```

### 2. Use Runtime Helpers in Your Frontend

```typescript
import {
  inferEnvironment,
  isDevMode,
  inferCanisterId,
} from '@web3nl/vite-plugin-canister-dapp/runtime';

// Get environment config (host and identity provider URLs)
const config = inferEnvironment();
console.log(config.host); // 'http://localhost:8080' or 'https://icp-api.io'
console.log(config.identityProvider); // II URL for current environment

// Check if running in development
if (isDevMode()) {
  await agent.fetchRootKey(); // Only needed in development
}

// Get the canister ID
const canisterId = inferCanisterId(); // Returns Principal
```

## Plugin Configuration

```typescript
interface CanisterDappEnvironmentPluginConfig {
  // Canister ID for Vite dev server (where URL-based inference doesn't work)
  viteDevCanisterId?: string;

  // Custom environment configurations (optional, sensible defaults provided)
  environment?: {
    development?: {
      host: string; // Default: 'http://localhost:8080'
      identityProvider: string; // Default: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080'
    };
    production?: {
      host: string; // Default: 'https://icp-api.io'
      identityProvider: string; // Default: 'https://identity.internetcomputer.org'
    };
  };

  // Dev server proxy configuration (default: all enabled)
  serverProxies?: {
    api?: boolean; // Proxy /api to IC host
    canisterDashboard?: boolean; // Proxy /canister-dashboard
    iiAlternativeOrigins?: boolean; // Proxy /.well-known/ii-alternative-origins
  };
}
```

### Example with Custom Configuration

```typescript
import { defineConfig } from 'vite';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig({
  plugins: [
    canisterDappEnvironmentConfig({
      viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      environment: {
        development: {
          host: 'http://localhost:4943',
          identityProvider: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943',
        },
      },
      serverProxies: {
        canisterDashboard: false, // Disable if not using dashboard
      },
    }),
  ],
});
```

## Runtime API

Import from `@web3nl/vite-plugin-canister-dapp/runtime`:

### `inferEnvironment()`

Returns the environment configuration based on URL origin detection.

```typescript
function inferEnvironment(): CanisterDappEnvironmentConfig;

interface CanisterDappEnvironmentConfig {
  host: string;
  identityProvider: string;
}
```

Development mode is detected when the origin:

- Starts with `http://` (not https)
- Contains `localhost`
- Contains `127.0.0.1`

### `isDevMode()`

Returns `true` if running in development mode.

```typescript
function isDevMode(): boolean;
```

### `inferCanisterId()`

Infers the canister ID from the URL hostname or falls back to `viteDevCanisterId`.

```typescript
function inferCanisterId(): Principal;
```

Works in these scenarios:

- **Production**: `canister-id.icp0.io` - inferred from subdomain
- **Local dfx**: `canister-id.localhost:8080` - inferred from subdomain
- **Vite dev server**: `localhost:5173` - uses `viteDevCanisterId` fallback

## How It Works

1. **Build time**: The plugin injects both dev and prod configs as global constants
2. **Runtime**: `inferEnvironment()` checks the URL origin to select the right config
3. **Canister ID**: `inferCanisterId()` extracts from URL or uses the configured fallback
4. **Proxies**: In dev mode, requests to `/api`, `/canister-dashboard`, etc. are proxied to the IC host

This enables a single build artifact to work seamlessly across:

- Local development with Vite dev server
- Local dfx deployment
- IC mainnet production

## API Documentation

Full API documentation is available at [GitHub Pages](https://web3nl.github.io/my-canister-dapp/web3nl-vite-plugin-canister-dapp/).
