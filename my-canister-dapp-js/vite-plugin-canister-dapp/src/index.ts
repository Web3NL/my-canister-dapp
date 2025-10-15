import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import type { CanisterDashboardDevConfig as _CanisterDashboardDevConfig } from '@web3nl/my-canister-dashboard';

/**
 * Configuration interface for My Canister Dashboard in development
 * @deprecated This type will be removed in a future version. Please use the equivalent type from the my-canister-dashboard package instead.
 */
export interface CanisterDashboardDevConfig {
  /** Canister ID (optional) */
  canisterId: string | undefined;
  /** DFX host URL for example http://localhost:8080 */
  dfxHost: string;
  /** Internet Identity provider URL for example http://iiCanisterId.localhost:8080 */
  identityProvider: string;
}

/**
 * Plugin configuration interface for enabling/disabling features
 * @deprecated Use CanisterDappEnvironmentPluginConfig instead
 */
export interface CanisterDashboardPluginConfig {
  /** Directory to load Vite environment variables from (defaults to config.root, otherwise current working directory) */
  root?: string;
  /** Whether to serve the canister dashboard dev config endpoint in dev server (default: true) */
  serveCanisterDashboardDevEnv?: boolean;
  /** Whether to emit the canister dashboard dev config during dev build as a static asset (default: true) */
  emitCanisterDashboardDevConfig?: boolean;
  /** Server proxy to dfx configuration (default: all enabled) */
  serverProxies?: {
    /** Enable /api proxy (default: true) */
    api?: boolean;
    /** Enable /canister-dashboard proxy (default: true) */
    canisterDashboard?: boolean;
    /** Enable /.well-known/ii-alternative-origins proxy (default: true) */
    iiAlternativeOrigins?: boolean;
  };
}

function loadCanisterDappDevEnv(
  mode: string,
  root: string
): _CanisterDashboardDevConfig | null {
  // Load environment variables using Vite's loadEnv
  const env = loadEnv(mode, root, '');

  const canisterId = env.VITE_CANISTER_ID;
  const iiCanisterId = env.VITE_II_CANISTER_ID;
  const dfxProtocol = env.VITE_DFX_PROTOCOL;
  const dfxHostname = env.VITE_DFX_HOSTNAME;
  const dfxPort = env.VITE_DFX_PORT;

  // Check if required II and DFX environment variables are present and non-empty
  if (
    !notEmptyString(iiCanisterId) ||
    !notEmptyString(dfxProtocol) ||
    !notEmptyString(dfxHostname) ||
    !notEmptyString(dfxPort)
  ) {
    console.warn(
      'Warning: Required VITE_ environment variables not set (VITE_II_CANISTER_ID, VITE_DFX_PROTOCOL, VITE_DFX_HOSTNAME, VITE_DFX_PORT).'
    );

    console.warn('Skipping canister dashboard development configuration.');
    return null;
  }

  const identityProvider = `${dfxProtocol}://${iiCanisterId}.${dfxHostname}:${dfxPort}`;
  const dfxHost = `${dfxProtocol}://${dfxHostname}:${dfxPort}`;

  return {
    canisterId: notEmptyString(canisterId) ? canisterId : undefined,
    dfxHost,
    identityProvider,
  };
}

/**
 * Vite plugin that provides Internet Computer Canister Dapp configuration for development
 *
 * @deprecated Use canisterDappEnvironmentConfig instead
 *
 * Features:
 * - Development-only operation (does nothing in production)
 * - Loads configuration from VITE_ prefixed environment variables
 * - Serves configuration at `/canister-dashboard-dev-config.json` during development
 * - Emits `canister-dashboard-dev-config.json` as static asset during development builds
 * - Automatic server proxy setup for IC development
 *   - `/api` -> proxied to `${VITE_DFX_PROTOCOL}://${VITE_DFX_HOSTNAME}:${VITE_DFX_PORT}`
 *   - `/canister-dashboard` -> proxied to `${VITE_DFX_PROTOCOL}://${VITE_DFX_HOSTNAME}:${VITE_DFX_PORT}/canister-dashboard?canisterId=${VITE_CANISTER_ID}`
 *   - `/.well-known/ii-alternative-origins` -> proxied to `${VITE_DFX_PROTOCOL}://${VITE_DFX_HOSTNAME}:${VITE_DFX_PORT}/.well-known/ii-alternative-origins?canisterId=${VITE_CANISTER_ID}`
 *   Note: The last two proxy rules are only set if VITE_CANISTER_ID is provided
 *   Note: Existing user-defined proxy rules for these paths will not be overwritten
 *
 * Required environment variables:
 * - VITE_II_CANISTER_ID // Internet Identity canister ID in dfx
 * - VITE_DFX_PROTOCOL
 * - VITE_DFX_HOSTNAME
 * - VITE_DFX_PORT
 *
 * Optional environment variables:
 * - VITE_CANISTER_ID: Your canister ID
 *
 * @param config Optional configuration to enable/disable plugin features
 * @returns Vite plugin instance
 */
export function canisterDashboardDevConfig(
  config: CanisterDashboardPluginConfig = {}
): Plugin {
  // Set default configuration values
  const {
    root: configRoot,
    serveCanisterDashboardDevEnv = true,
    emitCanisterDashboardDevConfig = true,
    serverProxies = {},
  } = config;

  const {
    api: enableApiProxy = true,
    canisterDashboard: enableCanisterDashboardProxy = true,
    iiAlternativeOrigins: enableIiAlternativeOriginsProxy = true,
  } = serverProxies;

  let dashboardConfig: _CanisterDashboardDevConfig | null = null;
  let currentMode = 'production';

  return {
    name: 'canister-dashboard-dev-config',

    // Configure Vite server proxy for development
    // This sets up the necessary proxy rules for development
    // based on the loaded dashboardConfig
    config(config, { mode }) {
      currentMode = mode;

      // Skip entirely if not in development mode
      if (mode !== 'development') {
        return;
      }

      // Use root from plugin config, fallback to vite config root, then cwd as last resort
      const root = configRoot ?? config.root ?? process.cwd();
      dashboardConfig = loadCanisterDappDevEnv(mode, root);

      // If config failed to load, skip proxy configuration
      if (dashboardConfig === null) {
        return;
      }

      const proxyTarget = dashboardConfig.dfxHost;
      const canisterId = dashboardConfig.canisterId;

      // Warn if canisterId is undefined and skip canister-specific proxies
      if (!notEmptyString(canisterId)) {
        console.warn(
          'Warning: VITE_CANISTER_ID is undefined. Skipping canister-specific proxy setup for "/canister-dashboard" and "/.well-known/ii-alternative-origins".'
        );
      }

      // Add proxy configuration to Vite config
      config.server ??= {};
      config.server.proxy ??= {};

      const existingProxy = config.server.proxy;
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

      // Only include canister-specific proxies if canisterId is defined
      const proxyKeys = notEmptyString(canisterId)
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

      // Only add canister-specific proxies if canisterId is defined
      if (notEmptyString(canisterId)) {
        if (
          enableCanisterDashboardProxy &&
          !('/canister-dashboard' in existingProxy)
        ) {
          newProxyConfig['/canister-dashboard'] = {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path: string) => `${path}?canisterId=${canisterId}`,
          };
        }

        if (
          enableIiAlternativeOriginsProxy &&
          !('/.well-known/ii-alternative-origins' in existingProxy)
        ) {
          newProxyConfig['/.well-known/ii-alternative-origins'] = {
            target: proxyTarget,
            changeOrigin: true,
            rewrite: (path: string) => `${path}?canisterId=${canisterId}`,
          };
        }
      }

      // Use spread operator to safely merge configurations
      config.server.proxy = {
        ...existingProxy,
        ...newProxyConfig,
      };
    },

    configResolved(resolvedConfig) {
      currentMode = resolvedConfig.mode;
    },

    // Serve `canister-dashboard-dev-config.json` in dev server
    configureServer(server: ViteDevServer) {
      // Skip entirely if not in development mode
      if (currentMode !== 'development') {
        return;
      }

      // Skip if feature is disabled
      if (!serveCanisterDashboardDevEnv) {
        return;
      }

      // Only serve config if dashboardConfig is available
      if (dashboardConfig === null) {
        return;
      }

      server.middlewares.use(
        '/canister-dashboard-dev-config.json',
        (req, res, next) => {
          if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(JSON.stringify(dashboardConfig, null, 2));
          } else {
            next();
          }
        }
      );
    },

    // Only generate `canister-dashboard-dev-config.json` static asset in development builds
    generateBundle() {
      // Skip entirely if not in development mode
      if (currentMode !== 'development') {
        return;
      }

      // Skip if feature is disabled
      if (!emitCanisterDashboardDevConfig) {
        return;
      }

      // Only generate config file if dashboardConfig is available
      if (dashboardConfig === null) {
        return;
      }

      // Generate canister-dashboard-dev-config.json for development builds
      // This allows dashboard to detect dev environment at runtime
      this.emitFile({
        type: 'asset',
        fileName: 'canister-dashboard-dev-config.json',
        source: JSON.stringify(dashboardConfig, null, 2),
      });
    },
  };
}

function notEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

// Export new general-purpose canister dapp environment config plugin
export {
  canisterDappEnvironmentConfig,
  inferEnvironment,
  isDevMode,
  inferCanisterId,
  type CanisterDappEnvironmentConfig,
  type CanisterDappEnvironmentPluginConfig,
} from './canister-dapp-environment-config.js';
