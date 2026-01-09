import { Principal } from '@icp-sdk/core/principal';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';
import type { CanisterDappEnvironmentConfig } from './plugin';

/**
 * Default development environment configuration
 */
const DEFAULT_DEV_CONFIG: CanisterDappEnvironmentConfig = {
  host: 'http://localhost:8080',
  identityProvider: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080',
};

/**
 * Default production environment configuration
 */
const DEFAULT_PROD_CONFIG: CanisterDappEnvironmentConfig = {
  host: 'https://icp-api.io',
  identityProvider: 'https://identity.internetcomputer.org',
};

// Cache for environment configuration
let configCache: CanisterDappEnvironmentConfig | null = null;

// Cache for dev mode detection
let devModeCache: boolean | null = null;

/**
 * Detect if the application is running in development mode based on URL origin
 *
 * Development mode is detected when the origin:
 * - Starts with 'http://' (not https)
 * - Contains 'localhost'
 * - Contains '127.0.0.1'
 *
 * This function is used internally by `inferEnvironment()` and `isDevMode()`.
 *
 * @returns true if running in development mode, false otherwise
 */
function detectDevModeFromOrigin(): boolean {
  if (typeof window === 'undefined' || !window.location) {
    // SSR or non-browser environment, default to production
    return false;
  }

  const origin = window.location.origin.toLowerCase();
  return (
    origin.startsWith('http://') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  );
}

/**
 * Infer the canister dapp environment at runtime based on URL origin
 *
 * This helper function automatically determines the environment configuration by
 * analyzing the current URL origin. It returns the development configuration if
 * the origin indicates a development environment (http://, localhost, or 127.0.0.1),
 * otherwise it returns the production configuration.
 *
 * Both configurations are embedded in the build by the Vite plugin, so no network
 * requests are needed. This enables building a single WASM that works in all environments.
 *
 * The result is cached for performance, so subsequent calls will return the cached value.
 *
 * Example usage:
 * ```typescript
 * import { inferEnvironment } from '@web3nl/vite-plugin-canister-dapp/runtime';
 *
 * export function getConfig() {
 *   const config = inferEnvironment();
 *   console.log('Running in:', config.host);
 *   return config;
 * }
 * ```
 *
 * @returns The environment configuration (dev or prod based on URL origin)
 */
export function inferEnvironment(): CanisterDappEnvironmentConfig {
  if (configCache !== null) {
    return configCache;
  }

  // Detect environment based on URL origin
  const isDev = detectDevModeFromOrigin();

  // Get the appropriate config from the injected global constants
  const config = isDev
    ? typeof __CANISTER_DAPP_DEV_CONFIG__ !== 'undefined'
      ? __CANISTER_DAPP_DEV_CONFIG__
      : DEFAULT_DEV_CONFIG
    : typeof __CANISTER_DAPP_PROD_CONFIG__ !== 'undefined'
      ? __CANISTER_DAPP_PROD_CONFIG__
      : DEFAULT_PROD_CONFIG;

  configCache = config;
  return config;
}

/**
 * Check if the application is running in development mode based on URL origin
 *
 * This function checks the URL origin to determine if the application is running
 * in development mode. Development mode is detected when the origin:
 * - Starts with 'http://' (not https)
 * - Contains 'localhost'
 * - Contains '127.0.0.1'
 *
 * The result is cached for performance, so subsequent calls will return the cached value.
 *
 * Example usage:
 * ```typescript
 * import { isDevMode } from '@web3nl/vite-plugin-canister-dapp/runtime';
 *
 * if (isDevMode()) {
 *   console.log('Running in development mode');
 * } else {
 *   console.log('Running in production mode');
 * }
 * ```
 *
 * @returns true if running in development mode, false otherwise
 */
export function isDevMode(): boolean {
  if (devModeCache !== null) {
    return devModeCache;
  }

  devModeCache = detectDevModeFromOrigin();
  return devModeCache;
}

/**
 * Infer the canister ID from the current location or fallback to viteDevCanisterId
 *
 * This function attempts to infer the canister ID from the URL hostname using
 * `inferCanisterIdFromLocation` from @web3nl/my-canister-dashboard. This works in:
 * - Production: `canister-id.icp0.io` (https only)
 * - Local dfx: `canister-id.localhost:port` (http only)
 *
 * If URL-based inference fails (e.g., when running in a Vite dev server at
 * `localhost:5173`), it falls back to the `viteDevCanisterId` configured in the
 * Vite plugin.
 *
 * Example usage:
 * ```typescript
 * import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';
 *
 * function initializeAgent() {
 *   const canisterId = inferCanisterId();
 *   // Use canisterId to create actor...
 * }
 * ```
 *
 * @returns The canister ID as a Principal
 * @throws Error if canister ID cannot be inferred from URL and viteDevCanisterId is not configured
 */
export function inferCanisterId(): Principal {
  try {
    return inferCanisterIdFromLocation();
  } catch {
    // URL inference failed - only happens in Vite dev server
    if (
      typeof __VITE_DEV_CANISTER_ID__ !== 'undefined' &&
      __VITE_DEV_CANISTER_ID__ !== null
    ) {
      return Principal.fromText(__VITE_DEV_CANISTER_ID__);
    }

    throw new Error(
      'Could not infer canister ID from URL. ' +
        'When using Vite dev server, set viteDevCanisterId in plugin config.'
    );
  }
}
