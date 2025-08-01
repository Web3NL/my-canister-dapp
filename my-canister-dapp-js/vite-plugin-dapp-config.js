/**
 * Vite plugin that provides dapp configuration in two ways:
 * 1. Virtual module 'virtual:dapp-config' for build-time config resolution
 * 2. Static asset 'dapp-config.json' for runtime environment detection by dashboard
 */
export function dappConfigPlugin(config = {}) {
  const { prod = {}, dev = {} } = config;
  let currentMode = 'production';

  return {
    name: 'dapp-config',
    
    configResolved(resolvedConfig) {
      currentMode = resolvedConfig.mode;
    },
    
    resolveId(id) {
      if (id === 'virtual:dapp-config') {
        return id;
      }
    },
    
    load(id) {
      if (id === 'virtual:dapp-config') {
        const isDev = currentMode === 'development' || currentMode === 'dfx_replica';
        const configValues = isDev ? dev : prod;
        
        return `export default ${JSON.stringify(configValues, null, 2)};`;
      }
    },
    
    configureServer(server) {
      // Serve dapp-config.json in dev server
      server.middlewares.use('/dapp-config.json', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify(dev, null, 2));
        } else {
          next();
        }
      });
    },
    
    generateBundle(options, bundle, isWrite) {
      // Only generate dapp-config.json for development and dfx_replica builds
      // This allows dashboard to detect dev environment at runtime
      const isDev = currentMode === 'development' || currentMode === 'dfx_replica';
      
      if (isDev) {
        this.emitFile({
          type: 'asset',
          fileName: 'dapp-config.json',
          source: JSON.stringify(dev, null, 2)
        });
      }
    }
  };
}