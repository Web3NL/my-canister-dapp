import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import { resolve } from 'path';
import { dappConfigPlugin } from './vite-plugin-dapp-config.js';

export default defineConfig(({ mode }) => {

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
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        "/canister-dashboard": {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => `${path}?canisterId=22ajg-aqaaa-aaaap-adukq-cai`,
        },
        "/.well-known/ii-alternative-origins": {
          target: 'http://localhost:8080',
          changeOrigin: true,
          rewrite: (path) => `${path}?canisterId=22ajg-aqaaa-aaaap-adukq-cai`,
        },
      },
    },
    plugins: [
      dappConfigPlugin({
        prod: {
          identityProvider: 'https://identity.internetcomputer.org',
          dfxHost: 'https://icp-api.io'
        },
        dev: {
          identityProvider: 'http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080',
          dfxHost: 'http://localhost:8080',
          canisterIdDev: '22ajg-aqaaa-aaaap-adukq-cai'
        }
      })
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
      ],
      dedupe: ['@dfinity/agent'],
    },
    define: {
      global: 'globalThis',
      'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    },
  };
});
