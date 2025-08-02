import type { Plugin, ViteDevServer } from 'vite';

export interface CanisterDappConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

export interface CanisterDappConfigPluginConfig {
  prod: CanisterDappConfig;
  dev: CanisterDappConfig;
}

/**
 * Vite plugin that provides canister dapp configuration in two ways:
 * 1. Virtual module 'virtual:canister-dapp-config' for build-time config resolution
 * 2. Static asset 'canister-dapp-config.json' for runtime environment detection by dashboard
 */
export function canisterDappConfigPlugin(
  config: CanisterDappConfigPluginConfig
): Plugin {
  const { prod, dev } = config;
  let currentMode = 'production';

  return {
    name: 'canister-dapp-config',

    configResolved(resolvedConfig) {
      currentMode = resolvedConfig.mode;
    },

    resolveId(id: string) {
      if (id === 'virtual:canister-dapp-config') {
        return id;
      }
      return null;
    },

    load(id: string) {
      if (id === 'virtual:canister-dapp-config') {
        const isDev =
          currentMode === 'development' || currentMode === 'dfx_replica';
        const configValues = isDev ? dev : prod;

        return `export default ${JSON.stringify(configValues, null, 2)};
export const isDevMode = ${isDev};`;
      }
      return null;
    },

    configureServer(server: ViteDevServer) {
      // Serve canister-dapp-config.json in dev server
      server.middlewares.use('/canister-dapp-config.json', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify(dev, null, 2));
        } else {
          next();
        }
      });
    },

    generateBundle() {
      // Only generate canister-dapp-config.json for development and dfx_replica builds
      // This allows dashboard to detect dev environment at runtime
      const isDev =
        currentMode === 'development' || currentMode === 'dfx_replica';

      if (isDev) {
        this.emitFile({
          type: 'asset',
          fileName: 'canister-dapp-config.json',
          source: JSON.stringify(dev, null, 2),
        });
      }
    },
  };
}

export default canisterDappConfigPlugin;
