import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'ii-auth-bundle.ts'),
      name: 'IIAuthBundle',
      fileName: 'ii-auth-bundle',
      formats: ['iife']
    },
    outDir: 'dist',
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    },
    minify: false
  }
});