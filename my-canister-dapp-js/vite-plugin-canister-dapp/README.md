# @web3nl/vite-plugin-canister-dapp

A Vite plugin for Internet Computer Canister Dapp development configuration.

Currently only provides development configuration for the My Canister Dashboard. The dashboard infers it's environment at runtime, because it is statically included the Rust crate. This plugin sets up a static `canister-dashboard-dev-config.json` file that the dashboard can use to determine its development environment.

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

## Features

- **Development-only**: Only operates in development mode, does nothing in production
- **Runtime config**: Serves development configuration at `/canister-dashboard-dev-config.json`
- **Automatic proxy setup**: Configures proxy routes for `/api`, `/canister-dashboard`, and `/.well-known/ii-alternative-origins`

## License

MIT
