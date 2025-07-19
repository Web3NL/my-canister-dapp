import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      emptyOutDir: true,
      rollupOptions: {
        external: [],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_DFXHOST,
          changeOrigin: true,
        },
        "/canister-dashboard": {
          target: env.VITE_DFXHOST,
          changeOrigin: true,
          rewrite: (path) => `${path}?canisterId=${env.VITE_CANISTER_ID}`,
        },
        "/.well-known/ii-alternative-origins": {
          target: env.VITE_DFXHOST,
          changeOrigin: true,
          rewrite: (path) => `${path}?canisterId=${env.VITE_CANISTER_ID}`,
        },
      },
    },
    publicDir: "assets",
    plugins: [],
    resolve: {
      alias: [
        {
          find: "declarations",
          replacement: fileURLToPath(
            new URL("../declarations/", import.meta.url)
          ),
        },
      ],
      dedupe: ['@dfinity/agent'],
    },
    define: {
      global: 'globalThis',
      'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    },
  };
});
