import type { Principal } from '@dfinity/principal';
import type { Plugin, ViteDevServer } from 'vite';
import { config } from 'dotenv';
import { join } from 'path';
import { existsSync } from 'fs';

export interface CanisterDashboardDevConfig {
  canisterId: Principal | unknown;
  dfxHost: string;
  identityProvider: string;
}

function loadEnvConfig(): CanisterDashboardDevConfig {
  // Check if .env.development exists in the consuming project root
  const envPath = join(process.cwd(), '.env.development');

  if (!existsSync(envPath)) {
    throw new Error('.env.development file not found in project root');
  }

  config({ path: envPath });

  const canisterId = process.env.CANISTER_ID;
  const iiCanisterId = process.env.II_CANISTER_ID;
  const dfxProtocol = process.env.DFX_PROTOCOL;
  const dfxHostname = process.env.DFX_HOSTNAME;
  const dfxPort = process.env.DFX_PORT;

  if (canisterId == null || iiCanisterId == null) {
    throw new Error(
      'CANISTER_ID and II_CANISTER_ID must be set in .env.development'
    );
  }

  const identityProvider = `${dfxProtocol}://${iiCanisterId}.${dfxHostname}:${dfxPort}`;
  const dfxHost = `${dfxProtocol}://${dfxHostname}:${dfxPort}`;

  return {
    canisterId,
    dfxHost,
    identityProvider,
  };
}

/**
 * Vite plugin that provides canister dashboard configuration as a static asset
 * for runtime environment detection by the dashboard
 */
export function canisterDapp(): Plugin {
  let dashboardConfig: CanisterDashboardDevConfig;
  let currentMode = 'production';

  return {
    name: 'canister-dashboard',

    config(config) {
      // Load environment config early
      dashboardConfig = loadEnvConfig();

      const proxyTarget = dashboardConfig.dfxHost;
      const canisterId = dashboardConfig.canisterId;

      // Add proxy configuration to Vite config
      config.server ??= {};
      config.server.proxy ??= {};

      Object.assign(config.server.proxy, {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/canister-dashboard': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path: string) => `${path}?canisterId=${String(canisterId)}`,
        },
        '/.well-known/ii-alternative-origins': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (path: string) => `${path}?canisterId=${String(canisterId)}`,
        },
      });
    },

    configResolved(resolvedConfig) {
      currentMode = resolvedConfig.mode;
    },

    configureServer(server: ViteDevServer) {
      // Serve canister-dashboard-config.json in dev server
      server.middlewares.use(
        '/canister-dashboard-config.json',
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

    generateBundle() {
      // Generate canister-dashboard-config.json for development builds
      // This allows dashboard to detect dev environment at runtime
      const isDev = currentMode === 'development';

      if (isDev) {
        this.emitFile({
          type: 'asset',
          fileName: 'canister-dashboard-config.json',
          source: JSON.stringify(dashboardConfig, null, 2),
        });
      }
    },
  };
}

export default canisterDapp;
