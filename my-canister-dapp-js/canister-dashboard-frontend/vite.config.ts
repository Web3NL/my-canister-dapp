import { defineConfig } from 'vitest/config';
import path from 'path';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => {
  return {
    root: 'src',
    base: '/canister-dashboard',
    publicDir: false as const,
    plugins: [
      canisterDappEnvironmentConfig({
        viteDevCanisterId: '22ajg-aqaaa-aaaap-adukq-cai',
        serverProxies: {
          canisterDashboard: false,
        }
      })
    ],
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      cssCodeSplit: false,
      minify: true,
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
    // Removed $declarations alias; all functionality now sourced from @web3nl/my-canister-dashboard package
    resolve: {
      alias: {},
    },
    test: {
      root: path.resolve(__dirname),
      include: ['test/**/*.{test,spec}.{js,ts}'],
      environment: 'jsdom',
    },
  };
});
