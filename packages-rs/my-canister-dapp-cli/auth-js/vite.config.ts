import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'cli-auth.ts'),
      name: 'CliAuth',
      fileName: 'cli-auth',
      formats: ['iife'],
    },
    outDir: __dirname,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: false,
  },
});
