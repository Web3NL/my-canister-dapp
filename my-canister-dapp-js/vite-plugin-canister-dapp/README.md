# @web3nl/vite-plugin-canister-dapp

[![npm version](https://img.shields.io/npm/v/@web3nl/vite-plugin-canister-dapp)](https://www.npmjs.com/package/@web3nl/vite-plugin-canister-dapp)
[![Documentation](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://web3nl.github.io/my-canister-dapp/web3nl-vite-plugin-canister-dapp/)

A Vite plugin for Internet Computer Canister Dapp development configuration.

Provides development configuration for Canister Dapps that use [My Canister Dashboard](https://crates.io/crates/my-canister-dashboard). The dashboard infers it's environment at runtime, because it is statically included the Rust crate. This plugin serves (in dev server) and emits (in dev builds) a static `canister-dashboard-dev-config.json` file that the dashboard can use to determine its development environment. This way, you can use the dashboard locally with dfx.

## Installation

```bash
npm install --save-dev @web3nl/vite-plugin-canister-dapp
```

## Usage

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { canisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig({
  plugins: [canisterDashboardDevConfig()],
});
```

## Environment Variables

Create a `.env.development` file with the following required variables:

```env
VITE_II_CANISTER_ID=qhbym-qaaaa-aaaaa-aaafq-cai
VITE_DFX_PROTOCOL=http
VITE_DFX_HOSTNAME=localhost
VITE_DFX_PORT=8080
```

Optional variables:

```env
VITE_CANISTER_ID=your-canister-id
```

## API Documentation

Full API documentation is available at [GitHub Pages](https://web3nl.github.io/my-canister-dapp/web3nl-vite-plugin-canister-dapp/).
