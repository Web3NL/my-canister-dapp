import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/lib/__tests__/setup.ts'],
  },
  build: {
    target: 'es2022',
  },
  define: {
    global: 'globalThis',
    PROD: process.env.DFX_NETWORK === 'ic' || process.env.ICP_NETWORK === 'ic',
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
      allow: ['..', './test'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
      },
    },
  },

  plugins: [sveltekit(), devtoolsJson()],
});
