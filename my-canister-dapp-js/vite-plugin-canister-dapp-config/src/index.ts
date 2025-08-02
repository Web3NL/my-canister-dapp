import type { Plugin, ViteDevServer } from 'vite';

export interface CanisterDappConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

const DEFAULT_PROD_CONFIG: CanisterDappConfig = {
  identityProvider: 'https://identity.internetcomputer.org',
  dfxHost: 'https://icp-api.io',
};

/**
 * Vite plugin that provides canister dapp configuration in two ways:
 * 1. Virtual module 'virtual:canister-dapp-config' for build-time config resolution
 * 2. Static asset 'canister-dapp-config.json' for runtime environment detection by dashboard
 */
export function canisterDappConfigPlugin(
  devConfig: CanisterDappConfig,
  prodConfig?: Partial<CanisterDappConfig>
): Plugin {
  const prod = { ...DEFAULT_PROD_CONFIG, ...prodConfig };
  const dev = devConfig;
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
        const isDev = currentMode === 'development';
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
      // Always generate canister-dapp-config.json for development builds
      // This allows dashboard to detect dev environment at runtime
      const isDev = currentMode === 'development';

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
