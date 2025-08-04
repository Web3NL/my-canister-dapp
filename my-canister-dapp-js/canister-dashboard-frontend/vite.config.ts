import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(() => {
  // Hardcoded dev environment configuration
  const devConfig = {
    identityProvider: "http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080",
    dfxHost: "http://localhost:8080",
    canisterId: "22ajg-aqaaa-aaaap-adukq-cai"
  };

  return {
    root: 'src',
    base: '/canister-dashboard',
    publicDir: false as const,
    plugins: [
      {
        name: 'serve-config',
        configureServer(server) {
          server.middlewares.use('/canister-dashboard-config.json', (req, res, next) => {
            if (req.method === 'GET') {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(JSON.stringify(devConfig, null, 2));
            } else {
              next();
            }
          });
        }
      }
    ],
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      cssCodeSplit: false,
      minify: false,

      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.html'),
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        $declarations: path.resolve(__dirname, '../../declarations'),
      },

    },
    server: {
      port: 5173,
      proxy: {
        '/.well-known/ii-alternative-origins': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: path => `${path}?canisterId=22ajg-aqaaa-aaaap-adukq-cai`,
        },
      },
    },
  };
});
