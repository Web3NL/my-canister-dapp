# @web3nl/vite-plugin-canister-dapp

## 1.0.0

### Major Changes

- **BREAKING**: Removed deprecated `canisterDashboardDevConfig()` plugin. Use `canisterDappEnvironmentConfig()` instead.
- **BREAKING**: Removed deprecated `CanisterDashboardDevConfig` interface. Use `CanisterDappEnvironmentConfig` instead.
- **BREAKING**: Removed deprecated `CanisterDashboardPluginConfig` interface. Use `CanisterDappEnvironmentPluginConfig` instead.
- **BREAKING**: Removed VITE\_\* environment variable based configuration. Use plugin options instead:
  - `viteDevCanisterId` replaces `VITE_CANISTER_ID`
  - `environment.development` replaces `VITE_DFX_*` and `VITE_II_CANISTER_ID`
- **BREAKING**: Removed `/canister-dashboard-dev-config.json` endpoint. Configuration is now injected at build time.

### Migration Guide

**Before (v0.x):**

```typescript
// vite.config.ts
import { canisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig({
  plugins: [canisterDashboardDevConfig()],
});
```

```env
# .env.development
VITE_CANISTER_ID=rrkah-fqaaa-aaaaa-aaaaq-cai
VITE_II_CANISTER_ID=rdmx6-jaaaa-aaaaa-aaadq-cai
VITE_DFX_PROTOCOL=http
VITE_DFX_HOSTNAME=localhost
VITE_DFX_PORT=8080
```

**After (v1.0):**

```typescript
// vite.config.ts
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig({
  plugins: [
    canisterDappEnvironmentConfig({
      viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      // environment config is optional - sensible defaults provided
    }),
  ],
});
```

```typescript
// Frontend code
import {
  inferEnvironment,
  isDevMode,
  inferCanisterId,
} from '@web3nl/vite-plugin-canister-dapp/runtime';

const config = inferEnvironment();
const canisterId = inferCanisterId();
```

## 0.4.3

### Patch Changes

- [`2ab049c`](https://github.com/Web3NL/my-canister-dapp/commit/2ab049ca495cd8b223653b79fde10673a2c67183) Thanks [@Web3NL](https://github.com/Web3NL)! - fix: file extension

## 0.4.2

### Patch Changes

- [`6115ee0`](https://github.com/Web3NL/my-canister-dapp/commit/6115ee0e8fa843dcfdc27f2abb6a64061c43c072) Thanks [@Web3NL](https://github.com/Web3NL)! - fix: split runtime functions from build time plugin

## 0.4.1

### Patch Changes

- [`0995ed4`](https://github.com/Web3NL/my-canister-dapp/commit/0995ed415c16e3166533fbc694304bce44068e75) Thanks [@Web3NL](https://github.com/Web3NL)! - fix release order (update versions, then push tag)

## 0.4.0

### Minor Changes

- [#181](https://github.com/Web3NL/my-canister-dapp/pull/181) [`93e22ac`](https://github.com/Web3NL/my-canister-dapp/commit/93e22acc9f48cf864f2a9f9909807e213ffad7ad) Thanks [@Web3NL](https://github.com/Web3NL)! - New CanisterDappEnvironmentConfig plugin for browser runtime inference of environment for Canister Dapps. Replaces older CanisterDashboardDevConfig.

## 0.3.2

### Patch Changes

- Updated dependencies [[`eb4fe07`](https://github.com/Web3NL/my-canister-dapp/commit/eb4fe07958bac1b15af9992dd9d9d6a84155d900)]:
  - @web3nl/my-canister-dashboard@0.8.0

## 0.3.1

### Patch Changes

- [#164](https://github.com/Web3NL/my-canister-dapp/pull/164) [`4f0c43c`](https://github.com/Web3NL/my-canister-dapp/commit/4f0c43caae0483fd262029558a0195a5a4b429d2) Thanks [@Web3NL](https://github.com/Web3NL)! - use type import

## 0.3.0

### Minor Changes

- [#163](https://github.com/Web3NL/my-canister-dapp/pull/163) [`bab4902`](https://github.com/Web3NL/my-canister-dapp/commit/bab4902a8af2d065997f7f59454acb741b1a4ba9) Thanks [@Web3NL](https://github.com/Web3NL)! - - Allow specifying root dir for .env.development file in plugin config.
  - Use deprecated type from correct import path.

## 0.2.4

### Patch Changes

- [#160](https://github.com/Web3NL/my-canister-dapp/pull/160) [`bb64c98`](https://github.com/Web3NL/my-canister-dapp/commit/bb64c98ecbb448a5eff497567d74753350f15729) Thanks [@Web3NL](https://github.com/Web3NL)! - Deprecated `CanisterDashboardDevConfig` type in vite-plugin-canister-dapp, moved type to more appropriate my-canister-dashboard package

## 0.2.3

### Patch Changes

- fix late version bump commit

## 0.2.2

### Patch Changes

- [#150](https://github.com/Web3NL/my-canister-dapp/pull/150) [`3b82de6`](https://github.com/Web3NL/my-canister-dapp/commit/3b82de6cc465663b4c3fdda6ffeb25a0fb16a999) Thanks [@Web3NL](https://github.com/Web3NL)! - Document usage with config arg

## 0.2.1

### Patch Changes

- [`6c9e5ae`](https://github.com/Web3NL/my-canister-dapp/commit/6c9e5ae7346a62dec6292fb646b80ce8f86e6635) Thanks [@Web3NL](https://github.com/Web3NL)! - version bumps

## 0.2.0

### Minor Changes

- [#95](https://github.com/Web3NL/my-canister-dapp/pull/95) [`e07d119`](https://github.com/Web3NL/my-canister-dapp/commit/e07d11984d62d7cb83bec69c233120a38923b7fe) Thanks [@Web3NL](https://github.com/Web3NL)! - Add configuration options to enable/disable plugin features

## 0.1.3

### Patch Changes

- [#88](https://github.com/Web3NL/my-canister-dapp/pull/88) [`48b1fca`](https://github.com/Web3NL/my-canister-dapp/commit/48b1fca2696642141d1f6cd9416f2eb3afdb310b) Thanks [@Web3NL](https://github.com/Web3NL)! - Docs: remove hardcoded local values from env var examples, keeping only variable names.

## 0.1.2

### Patch Changes

- [#86](https://github.com/Web3NL/my-canister-dapp/pull/86) [`37ad093`](https://github.com/Web3NL/my-canister-dapp/commit/37ad093ee896d1765a6e24c157056842d26a8216) Thanks [@Web3NL](https://github.com/Web3NL)! - Align peerDependencies and devDependencies with workspace versions, remove release-it devDependency, and switch dependents to use semver ranges.
