import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyCanisterDashboard',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        '@dfinity/agent',
        '@dfinity/ic-management',
        '@dfinity/principal',
        '@dfinity/candid',
        '@web3nl/my-canister-dashboard',
      ],
    },
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      '$declarations': resolve(__dirname, '../../declarations'),
    },
  },
  plugins: [
    dts({
      outDir: 'dist',
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});