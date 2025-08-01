import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'derive-ii-principal.ts'),
      name: 'DeriveIIPrincipal',
      fileName: 'derive-ii-principal',
      formats: ['iife']
    },
    outDir: __dirname,
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    },
    minify: false
  }
});