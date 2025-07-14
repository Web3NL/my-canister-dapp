import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import devtoolsJson from 'vite-plugin-devtools-json';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
  build: {
    target: 'es2022',
  },
  define: {
    global: 'globalThis',
    PROD: process.env.DFX_NETWORK === 'ic',
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import'],
      },
    },
  },

  optimizeDeps: {
    include: ['@dfinity/gix-components', '@web3nl/my-canister-dashboard'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      target: 'es2022',
    },
  },

  server: {
    port: 5174,
    host: 'localhost',
    fs: {
      allow: ['..', './test', '../examples'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  },

  plugins: [
    sveltekit(),
    devtoolsJson(),
    {
      name: 'serve-wasm',
      configureServer(server) {
        // Serve wasm directory from project root
        server.middlewares.use('/wasm', (req, res, next) => {
          if (!req.url) {
            next();
            return;
          }

          const wasmPath = path.resolve(process.cwd(), '../wasm');
          const filePath = path.join(wasmPath, req.url);

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath);
            res.writeHead(200, {
              'Content-Type': req.url!.endsWith('.wasm')
                ? 'application/wasm'
                : 'application/octet-stream',
            });
            res.end(content);
          } else {
            next();
          }
        });
      },
    },
  ],
});
