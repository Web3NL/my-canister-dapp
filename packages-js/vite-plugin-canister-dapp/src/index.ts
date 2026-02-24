/**
 * @web3nl/vite-plugin-canister-dapp
 *
 * A Vite plugin for Internet Computer Canister Dapp environment configuration.
 *
 * This plugin enables building a single WASM/frontend that works in all environments by:
 * - Embedding both development and production configurations at build time
 * - Providing runtime helpers to detect environment and infer canister ID
 * - Setting up Vite dev server proxies for local IC development
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';
 *
 * export default defineConfig({
 *   plugins: [
 *     canisterDappEnvironmentConfig({
 *       viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
 *     })
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Frontend code
 * import { inferEnvironment, isDevMode, inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
 *
 * const config = inferEnvironment(); // { host, identityProvider }
 * const canisterId = inferCanisterId(); // Principal
 * if (isDevMode()) {
 *   await agent.fetchRootKey();
 * }
 * ```
 *
 * @packageDocumentation
 */

export {
  canisterDappEnvironmentConfig,
  type CanisterDappEnvironmentConfig,
  type CanisterDappEnvironmentPluginConfig,
} from './plugin.js';
