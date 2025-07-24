import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'url';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../../..', 'VITE_');

  return {
    build: {
      emptyOutDir: true,
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
          rewrite: (path) => `${path}?canisterId=${env.VITE_MY_HELLO_WORLD_CANISTER_ID}`,
        },
        "/.well-known/ii-alternative-origins": {
          target: env.VITE_DFXHOST,
          changeOrigin: true,
          rewrite: (path) => `${path}?canisterId=${env.VITE_MY_HELLO_WORLD_CANISTER_ID}`,
        },
      },
    },
    plugins: [
      ...(mode === 'development' ? [
        viteStaticCopy({
          targets: [
            {
              src: 'config/*',
              dest: '.'
            }
          ]
        })
      ] : [])
    ],
    resolve: {
      alias: [
        {
          find: "declarations",
          replacement: fileURLToPath(
            new URL("../declarations/", import.meta.url)
          ),
        },
        {
          find: "$declarations",
          replacement: fileURLToPath(
            new URL("../declarations/", import.meta.url)
          ),
        },
        {
          find: "/dashboard-config.json",
          replacement: resolve(process.cwd(), "config/dashboard-config.json"),
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
