import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dappConfigPlugin } from '@web3nl/vite-plugin-dapp-config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {

  return {
    root: 'src',
    base: '/canister-dashboard',
    envDir: __dirname,
    publicDir: false,
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
    test: {
      include: ['../test/**/*.{test,spec}.{js,ts}'],
      environment: 'jsdom',
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
