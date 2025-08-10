import { defineConfig } from 'vite';
import path from 'path';
import { canisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => {
  return {
    root: 'src',
    base: '/canister-dashboard',
    publicDir: false as const,
    plugins: [
      canisterDashboardDevConfig({
        serverProxies: {
          canisterDashboard: false,
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
  };
});
