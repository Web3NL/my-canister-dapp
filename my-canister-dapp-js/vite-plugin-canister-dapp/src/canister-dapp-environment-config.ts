import type { Plugin } from 'vite';
import { Principal } from '@dfinity/principal';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';

/**
 * Environment configuration interface for Internet Computer Canister Dapp
 */
export interface CanisterDappEnvironmentConfig {
  /** Host URL for the Internet Computer API (e.g., http://localhost:8080 in dev, https://icp-api.io in prod) */
  host: string;
  /** Internet Identity provider URL (e.g., http://iiCanisterId.localhost:8080 in dev, https://identity.internetcomputer.org in prod) */
  identityProvider: string;
}

/**
 * Plugin configuration interface for enabling/disabling features
 */
export interface CanisterDappEnvironmentPluginConfig {
  /**
   * Environment configurations for development and production.
   * Both are optional and will use sensible defaults if not provided.
   */
  environment?: {
    /** Development environment configuration (optional, defaults provided) */
    development?: CanisterDappEnvironmentConfig;
    /** Production environment configuration (optional, defaults provided) */
    production?: CanisterDappEnvironmentConfig;
  };
  /**
   * Canister ID for Vite dev server environments.
   * This is only needed when running in a Vite dev server where the canister ID
   * cannot be inferred from the URL (e.g., http://localhost:5173).
   * In production and local dfx environments, the canister ID is inferred from the URL.
   * This is also used for proxy rewrites in the Vite dev server.
   */
  viteDevCanisterId?: string;
  /** Server proxy to IC configuration (default: all enabled, only applies in Vite dev server) */
  serverProxies?: {
    /** Enable /api proxy (default: true) */
    api?: boolean;
    /** Enable /canister-dashboard proxy (default: true) */
    canisterDashboard?: boolean;
    /** Enable /.well-known/ii-alternative-origins proxy (default: true) */
    iiAlternativeOrigins?: boolean;
  };
}

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

/**
 * Vite plugin that provides Internet Computer Canister Dapp environment configuration
 *
 * Features:
 * - Works in all build modes (development and production)
 * - Accepts optional environment configurations for both dev and prod in vite.config.ts
 * - Provides sensible defaults for both environments if not specified
 * - Embeds both configurations into the build for runtime environment detection
 * - Automatic server proxy setup for IC development (only in Vite dev server)
 *   - `/api` -> proxied to configured host
 *   - `/canister-dashboard` -> proxied to `${host}/canister-dashboard?canisterId=${viteDevCanisterId}`
 *   - `/.well-known/ii-alternative-origins` -> proxied to `${host}/.well-known/ii-alternative-origins?canisterId=${viteDevCanisterId}`
 *   Note: The last two proxy rules are only set if viteDevCanisterId is provided
 *   Note: Existing user-defined proxy rules for these paths will not be overwritten
 *
 * This plugin enables building a single WASM that works in all environments by:
 * - Embedding both dev and prod configurations in the build
 * - Detecting environment at runtime based on URL origin (http://, localhost, 127.0.0.1 = dev)
 * - Automatically switching between configurations based on where the app is accessed
 * - Providing canister ID inference with automatic URL-based detection and Vite dev server fallback
 *
 * This plugin is designed to:
 * - Enable runtime environment inference for any canister dapp frontend
 * - Signal the environment to the canister dashboard (which shares the same environment)
 * - Support development of the dashboard frontend itself
 * - Provide canister ID inference that works in all deployment scenarios
 *
 * Default configurations:
 * - Development: { host: 'http://localhost:8080', identityProvider: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080' }
 * - Production: { host: 'https://icp-api.io', identityProvider: 'https://identity.internetcomputer.org' }
 *
 * Example usage in vite.config.ts:
 * ```typescript
 * import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';
 *
 * export default defineConfig({
 *   plugins: [
 *     canisterDappEnvironmentConfig({
 *       viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai', // Only needed for Vite dev server
 *       environment: {
 *         development: {
 *           host: 'http://localhost:4943',
 *           identityProvider: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'
 *         },
 *         production: {
 *           host: 'https://icp-api.io',
 *           identityProvider: 'https://identity.internetcomputer.org'
 *         }
 *       }
 *     })
 *   ]
 * });
 * ```
 *
 * Frontend usage with helper functions:
 * ```typescript
 * import { inferEnvironment, isDevMode, inferCanisterId } from '@web3nl/vite-plugin-canister-dapp';
 *
 * const config = inferEnvironment(); // Synchronous! Returns { host, identityProvider }
 * const canisterId = inferCanisterId(); // Synchronous! Returns Principal
 * console.log(isDevMode() ? 'Development' : 'Production');
 * ```
 *
 * @param config Plugin configuration with optional environment settings
 * @returns Vite plugin instance
 */
export function canisterDappEnvironmentConfig(
  config: CanisterDappEnvironmentPluginConfig = {}
): Plugin {
  // Merge user configs with defaults
  const devConfig: CanisterDappEnvironmentConfig = {
    ...DEFAULT_DEV_CONFIG,
    ...(config.environment?.development || {}),
  };

  const prodConfig: CanisterDappEnvironmentConfig = {
    ...DEFAULT_PROD_CONFIG,
    ...(config.environment?.production || {}),
  };

  const { serverProxies = {} } = config;

  const {
    api: enableApiProxy = true,
    canisterDashboard: enableCanisterDashboardProxy = true,
    iiAlternativeOrigins: enableIiAlternativeOriginsProxy = true,
  } = serverProxies;

  return {
    name: 'canister-dapp-environment-config',

    // Configure Vite to inject environment configs and setup proxy for dev server
    config(viteConfig, { mode }) {
      // Inject both dev and prod configs as global constants
      viteConfig.define = {
        ...viteConfig.define,
        __CANISTER_DAPP_DEV_CONFIG__: JSON.stringify(devConfig),
        __CANISTER_DAPP_PROD_CONFIG__: JSON.stringify(prodConfig),
        __VITE_DEV_CANISTER_ID__: JSON.stringify(
          config.viteDevCanisterId || null
        ),
      };

      // Setup proxy only in development mode (Vite dev server)
      if (mode !== 'development') {
        return;
      }

      const proxyTarget = devConfig.host;
      const viteDevCanisterId = config.viteDevCanisterId;

      // Warn if viteDevCanisterId is undefined and skip canister-specific proxies
      if (!notEmptyString(viteDevCanisterId)) {
        console.warn(
          'Warning: viteDevCanisterId is undefined. Skipping canister-specific proxy setup for "/canister-dashboard" and "/.well-known/ii-alternative-origins".'
        );
      }

      // Add proxy configuration to Vite config
      viteConfig.server ??= {};
      viteConfig.server.proxy ??= {};

      const existingProxy = viteConfig.server.proxy;
      const baseProxyKeys: string[] = [];
      const canisterProxyKeys: string[] = [];

      // Only include enabled proxy keys
      if (enableApiProxy) {
        baseProxyKeys.push('/api');
      }
      if (enableCanisterDashboardProxy) {
        canisterProxyKeys.push('/canister-dashboard');
      }
      if (enableIiAlternativeOriginsProxy) {
        canisterProxyKeys.push('/.well-known/ii-alternative-origins');
      }

      // Only include canister-specific proxies if viteDevCanisterId is defined
      const proxyKeys = notEmptyString(viteDevCanisterId)
        ? [...baseProxyKeys, ...canisterProxyKeys]
        : baseProxyKeys;
      const conflictingKeys: string[] = [];

      // Check for existing proxy configurations that would conflict
      for (const key of proxyKeys) {
        if (key in existingProxy) {
          conflictingKeys.push(key);
        }
      }

      if (conflictingKeys.length > 0) {
        console.warn(
          `Warning: Existing proxy configurations found for [${conflictingKeys.join(', ')}]. Skipping canister-dapp proxy setup for these paths to avoid conflicts.`
        );
      }

      // Only add proxy configurations that don't conflict
      const newProxyConfig: Record<
        string,
        {
          target: string;
          changeOrigin: boolean;
          rewrite?: (path: string) => string;
        }
      > = {};

      if (enableApiProxy && !('/api' in existingProxy)) {
        newProxyConfig['/api'] = {
          target: proxyTarget,
          changeOrigin: true,
        };
      }

      // Only add canister-specific proxies if viteDevCanisterId is defined
      if (notEmptyString(viteDevCanisterId)) {
        if (
          enableCanisterDashboardProxy &&
          !('/canister-dashboard' in existingProxy)
        ) {
          newProxyConfig['/canister-dashboard'] = {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path: string) =>
              `${path}?canisterId=${viteDevCanisterId}`,
          };
        }

        if (
          enableIiAlternativeOriginsProxy &&
          !('/.well-known/ii-alternative-origins' in existingProxy)
        ) {
          newProxyConfig['/.well-known/ii-alternative-origins'] = {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path: string) =>
              `${path}?canisterId=${viteDevCanisterId}`,
          };
        }
      }

      // Use spread operator to safely merge configurations
      viteConfig.server.proxy = {
        ...existingProxy,
        ...newProxyConfig,
      };
    },
  };
}

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
 * import { inferEnvironment } from '@web3nl/vite-plugin-canister-dapp';
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
  if (isDev) {
    configCache =
      typeof __CANISTER_DAPP_DEV_CONFIG__ !== 'undefined'
        ? __CANISTER_DAPP_DEV_CONFIG__
        : DEFAULT_DEV_CONFIG;
  } else {
    configCache =
      typeof __CANISTER_DAPP_PROD_CONFIG__ !== 'undefined'
        ? __CANISTER_DAPP_PROD_CONFIG__
        : DEFAULT_PROD_CONFIG;
  }

  return configCache;
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
 * import { isDevMode } from '@web3nl/vite-plugin-canister-dapp';
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
 * import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp';
 *
 * async function initializeAgent() {
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

// Cache for environment configuration
let configCache: CanisterDappEnvironmentConfig | null = null;

// Cache for dev mode detection
let devModeCache: boolean | null = null;

function notEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
