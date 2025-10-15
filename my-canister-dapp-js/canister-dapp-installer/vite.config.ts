import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  root: 'src',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [path.resolve(__dirname, 'test/**/*.{test,spec}.{js,ts}')],
  },
});
