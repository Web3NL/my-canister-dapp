# @web3nl/vite-plugin-canister-dapp

[![npm version](https://img.shields.io/npm/v/@web3nl/vite-plugin-canister-dapp)](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://web3nl.github.io/my-canister-dapp/web3nl-vite-plugin-canister-dapp/)

A Vite plugin for Internet Computer user-owned dapp environment configuration.

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
      identityProvider: string; // Default: 'https://id.ai'
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

IC canisters serve their own web frontend — the JavaScript is compiled into the canister wasm. Rebuilding means recompiling the entire canister. This plugin eliminates that need by making a **single build work in all environments**.

1. **Build time**: The plugin injects both dev and prod configs (`host`, `identityProvider`) as global constants into the JS bundle
2. **Runtime**: `inferEnvironment()` checks the URL origin — `http://` or `localhost` = development, `https://` = production — and returns the matching config
3. **Canister ID**: `inferCanisterId()` extracts the canister ID from the URL subdomain (`<id>.localhost:8080` or `<id>.icp0.io`), falling back to `viteDevCanisterId` when running in a Vite dev server
4. **Root key**: `isDevMode()` returns `true` for local environments where `agent.fetchRootKey()` is required (forbidden in production)
5. **Proxies**: In Vite dev server mode, `/api`, `/canister-dashboard`, and `/.well-known/ii-alternative-origins` are proxied to the IC host

This enables a single build artifact to work seamlessly across:

| Scenario | Host | Canister ID Source |
|----------|------|--------------------|
| **Vite dev server** (`localhost:5173`) | `http://localhost:8080` | `viteDevCanisterId` config |
| **Local network** (`<id>.localhost:8080`) | `http://localhost:8080` | URL subdomain |
| **IC mainnet** (`<id>.icp0.io`) | `https://icp-api.io` | URL subdomain |

This plugin is part of the [@web3nl/my-canister-dapp](https://github.com/Web3NL/my-canister-dapp) SDK for building user-owned dapps on the Internet Computer.

## API Documentation

Full API documentation is available at [GitHub Pages](https://web3nl.github.io/my-canister-dapp/web3nl-vite-plugin-canister-dapp/).
