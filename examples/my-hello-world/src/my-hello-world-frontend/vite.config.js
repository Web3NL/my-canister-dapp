import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: true,
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8080",
      },
    },
  },
  publicDir: "assets",
  plugins: [],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations/", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
  define: {
    global: 'globalThis',
    'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
  },
});
