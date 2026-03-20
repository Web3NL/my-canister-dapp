# Frontend Reference — JS Packages API

> This document covers the two npm packages for building dapp frontends.
> For IC concepts and architecture, see [ai-overview.md](ai-overview.md) first.
> For Rust backend setup, see [ai-backend-reference.md](ai-backend-reference.md).

## @web3nl/vite-plugin-canister-dapp

Vite plugin that configures environment detection (dev vs. production), dev server proxies, and runtime helpers for IC dapp frontends.

> Latest version: [npmjs.com/package/@web3nl/vite-plugin-canister-dapp](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp)

### Plugin Setup (vite.config.ts)

```typescript
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => {
  return {
    plugins: [
      canisterDappEnvironmentConfig({
        // Required for Vite dev server — the canister ID to connect to.
        // Set via env var or hardcode a default for development.
        viteDevCanisterId: process.env.VITE_CANISTER_ID || '<your-canister-id>',
      })
    ],

    // Required: polyfill 'global' for IC agent compatibility
    optimizeDeps: {
      esbuildOptions: {
        define: { global: "globalThis" },
      },
    },
    define: {
      global: 'globalThis',
    },

    // Required: map @dfinity → @icp-sdk (some IC libraries still reference @dfinity/*)
    resolve: {
      alias: [
        { find: "@dfinity/agent", replacement: "@icp-sdk/core/agent" },
        { find: "@dfinity/principal", replacement: "@icp-sdk/core/principal" },
        { find: "@dfinity/candid", replacement: "@icp-sdk/core/candid" },
      ]
    },
  };
});
```

### Plugin Configuration Interface

```typescript
interface CanisterDappEnvironmentPluginConfig {
  environment?: {
    development?: { host: string; identityProvider: string };
    production?: { host: string; identityProvider: string };
  };
  // Required for Vite dev server (localhost:5173/5174) — without this,
  // inferCanisterId() cannot determine which canister to talk to.
  viteDevCanisterId?: string;
  serverProxies?: {
    api?: boolean;                    // Proxy /api to IC host (default: true)
    canisterDashboard?: boolean;      // Proxy /canister-dashboard (default: true)
    iiAlternativeOrigins?: boolean;   // Proxy /.well-known/ii-alternative-origins (default: true)
  };
}
```

### Default Environment Configs

| Setting | Development | Production |
|---------|------------|------------|
| `host` | `http://localhost:8080` | `https://icp-api.io` |
| `identityProvider` | `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080` | `https://identity.internetcomputer.org` |

Override `identityProvider` in dev with the `VITE_IDENTITY_PROVIDER` env var.

### Runtime Helpers

Import from the `/runtime` subpath:

```typescript
import {
  inferEnvironment,
  isDevMode,
  inferCanisterId,
} from '@web3nl/vite-plugin-canister-dapp/runtime';
```

#### `inferEnvironment(): { host: string; identityProvider: string }`

Returns the correct environment config based on the current URL origin:
- `http://` or `localhost` → development config
- `https://` → production config

#### `isDevMode(): boolean`

Returns `true` if the current environment is development (HTTP, localhost, 127.0.0.1).

#### `inferCanisterId(): Principal`

Determines the canister ID the frontend should talk to:
1. First tries URL-based inference (extracts canister ID from `<id>.localhost` or `<id>.icp0.io`)
2. Falls back to `viteDevCanisterId` (set in plugin config) if URL inference fails
3. Throws if neither works

### Dev Server Proxies

In Vite dev mode, the plugin automatically proxies these paths to the IC host:
- `/api` → canister API calls
- `/canister-dashboard` → dashboard UI assets
- `/.well-known/ii-alternative-origins` → II alternative origins endpoint

This allows the Vite dev server (e.g., `localhost:5174`) to forward canister calls transparently.

---

## @web3nl/my-canister-dashboard

JS utilities for interacting with dashboard endpoints on user-owned canisters.

> Latest version: [npmjs.com/package/@web3nl/my-canister-dashboard](https://www.npmjs.com/package/@web3nl/my-canister-dashboard)

### MyCanisterDashboard

High-level API for common dashboard operations.

```typescript
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';

const dashboard = MyCanisterDashboard.create(agent, canisterId);

// Check if the current caller is the canister's II principal (owner)
const isOwner: boolean = await dashboard.isAuthenticated();

// Check cycles balance — returns error string if below threshold
const result = await dashboard.checkCyclesBalance();
// result: { ok: true } | { error: string }

// Custom threshold (default is 1 trillion cycles)
const result = await dashboard.checkCyclesBalance({
  threshold: 2_000_000_000_000n
});
```

### MyDashboardBackend

Lower-level actor wrapper for direct canister calls.

```typescript
import { MyDashboardBackend } from '@web3nl/my-canister-dashboard';

const backend = MyDashboardBackend.create({ agent, canisterId });

await backend.manageIIPrincipal({ Get: null });
await backend.manageAlternativeOrigins({ Add: "https://example.com" });
await backend.manageTopUpRule({ Get: null });
const status = await backend.wasmStatus();
```

### `inferCanisterIdFromLocation(): Principal`

Parse the canister ID from `window.location`:
- Matches `<canister-id>.localhost` (dev with http)
- Matches `<canister-id>.icp0.io` (production with https)
- Throws on invalid protocol or format

This is used internally by the Vite plugin's `inferCanisterId()`. You can use it directly if you're not using the Vite plugin.

### Constants

```typescript
export const LOW_CYCLES_THRESHOLD = 1_000_000_000_000n; // 1 trillion cycles
```

### Re-exported Types

All Candid types are re-exported:
`HttpRequest`, `HttpResponse`, `ManageAlternativeOriginsArg`, `ManageIIPrincipalArg`, `ManageTopUpRuleArg`, `WasmStatus`, `CyclesAmount`, `TopUpInterval`, `TopUpRule`, `ManageAlternativeOriginsResult`, `ManageIIPrincipalResult`, `ManageTopUpRuleResult`

---

## Dependency Tree for SDK Users

When building a dapp frontend, install these packages:

```json
{
  "dependencies": {
    "@web3nl/my-canister-dashboard": "<latest>"
  },
  "devDependencies": {
    "@web3nl/vite-plugin-canister-dapp": "<latest>"
  }
}
```

> Check npm for latest versions:
> - [npmjs.com/package/@web3nl/my-canister-dashboard](https://www.npmjs.com/package/@web3nl/my-canister-dashboard)
> - [npmjs.com/package/@web3nl/vite-plugin-canister-dapp](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp)

### What gets pulled in transitively

```
@web3nl/my-canister-dashboard
  └─ @icp-sdk/canisters

@web3nl/vite-plugin-canister-dapp
  ├─ @icp-sdk/core
  └─ @web3nl/my-canister-dashboard
```

### Peer dependencies you must install

- `@icp-sdk/core` — IC agent, principal, candid types
- `vite` (^7) — build tool

### For authentication

- `@icp-sdk/auth` — provides `AuthClient` for Internet Identity login

### Important: This SDK uses `@icp-sdk/*`, NOT `@dfinity/*`

The `@icp-sdk/*` packages are the current IC JavaScript SDK. The older `@dfinity/*` packages are deprecated. Some IC libraries may still reference `@dfinity/*` internally — that's why the Vite alias mappings are required (see vite.config.ts setup above).

---

## Vite Alias Mappings (Required)

These aliases are **required** in `vite.config.ts` because some IC libraries still reference `@dfinity/*`:

```typescript
resolve: {
  alias: [
    { find: "@dfinity/agent", replacement: "@icp-sdk/core/agent" },
    { find: "@dfinity/principal", replacement: "@icp-sdk/core/principal" },
    { find: "@dfinity/candid", replacement: "@icp-sdk/core/candid" },
  ]
}
```

Without these, builds will fail with "module not found" errors for `@dfinity/*`.

---

## Authentication Pattern

Complete II login flow. Based on: [examples/my-hello-world/src/frontend/src/main.ts](../examples/my-hello-world/src/frontend/src/main.ts)

### Vanilla TypeScript

```typescript
import { AuthClient } from '@icp-sdk/auth/client';
import { HttpAgent } from '@icp-sdk/core/agent';
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import { inferCanisterId, inferEnvironment, isDevMode } from '@web3nl/vite-plugin-canister-dapp/runtime';

// 1. Create auth client (do this once on page load)
const authClient = await AuthClient.create({
  idleOptions: { disableIdle: true },
});

// 2. Login with Internet Identity
const config = inferEnvironment();
await new Promise<void>((resolve, reject) => {
  authClient.login({
    identityProvider: config.identityProvider,
    onSuccess: () => resolve(),
    onError: (err?: string) => reject(err),
  });
});

// 3. Create agent with the authenticated identity
const identity = authClient.getIdentity();
const agent = await HttpAgent.create({
  identity,
  host: config.host,
  fetch: fetch.bind(globalThis),
  shouldFetchRootKey: isDevMode(),
});

// 4. Check authorization (verify caller is the canister's II principal)
const canisterId = inferCanisterId();
const dashboard = MyCanisterDashboard.create(agent, canisterId);
const isAuthorized = await dashboard.isAuthenticated();

if (!isAuthorized) {
  // User is logged in to II but is not the owner of this canister
  await authClient.logout();
  throw new Error('Not authorized');
}

// 5. Use the agent to call your canister
// Use the agent to call your canister methods
```

### React Pattern (Context-based)

Based on: [examples/my-notepad/src/frontend/](../examples/my-notepad/src/frontend/)

```typescript
// useBackend.ts hook
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';

export function useBackend() {
  const { agent } = useAuth(); // your auth context
  return useMemo(() => {
    if (!agent) return null;
    const canisterId = inferCanisterId();
    // Create your canister actor with the agent and canisterId
    return createMyActor(canisterId, { agent });
  }, [agent]);
}
```

---

## Cycles Balance Checking

```typescript
const canisterId = inferCanisterId();
const dashboard = MyCanisterDashboard.create(agent, canisterId);
const result = await dashboard.checkCyclesBalance();

if ('error' in result) {
  // result.error contains a message like "Low cycles warning: X cycles remaining"
  // Show a warning and link to /canister-dashboard for top-up
  showWarning(`${result.error} — <a href="/canister-dashboard">Top up</a>`);
}
```

---

## Complete vite.config.ts Templates

### Vanilla TypeScript (Svelte, etc.)

```typescript
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => ({
  plugins: [
    canisterDappEnvironmentConfig({
      viteDevCanisterId: process.env.VITE_CANISTER_ID || '<fallback-id>',
    })
  ],
  optimizeDeps: {
    esbuildOptions: { define: { global: "globalThis" } },
  },
  define: { global: 'globalThis' },
  resolve: {
    alias: [
      { find: "@dfinity/agent", replacement: "@icp-sdk/core/agent" },
      { find: "@dfinity/principal", replacement: "@icp-sdk/core/principal" },
      { find: "@dfinity/candid", replacement: "@icp-sdk/core/candid" },
    ]
  },
}));
```

### React

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => ({
  plugins: [
    react(),
    canisterDappEnvironmentConfig({
      viteDevCanisterId: process.env.VITE_CANISTER_ID || '<fallback-id>',
    })
  ],
  optimizeDeps: {
    esbuildOptions: { define: { global: "globalThis" } },
  },
  define: { global: 'globalThis' },
  resolve: {
    alias: [
      { find: "@dfinity/agent", replacement: "@icp-sdk/core/agent" },
      { find: "@dfinity/principal", replacement: "@icp-sdk/core/principal" },
      { find: "@dfinity/candid", replacement: "@icp-sdk/core/candid" },
    ]
  },
}));
```

---

## package.json Template

```json
{
  "name": "my-dapp-frontend",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "vite build",
    "dev": "vite"
  },
  "dependencies": {
    "@web3nl/my-canister-dashboard": "<latest from npm>"
  },
  "devDependencies": {
    "@web3nl/vite-plugin-canister-dapp": "<latest from npm>",
    "vite": "^7",
    "typescript": "^5"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
```

Note: `@icp-sdk/core` and `@icp-sdk/auth` are pulled in as transitive dependencies. If you import from them directly (e.g., `import { AuthClient } from '@icp-sdk/auth/client'`), add them to your `dependencies` explicitly.
