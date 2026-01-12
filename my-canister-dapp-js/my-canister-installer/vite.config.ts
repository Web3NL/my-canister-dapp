import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MyCanisterInstaller',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [/^@icp-sdk\/.*/],
    },
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [
    dts({
      outDir: 'dist',
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
});
