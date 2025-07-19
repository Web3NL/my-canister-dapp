import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
      "/canister-dashboard": {
        target: `http://${env.VITE_CANISTER_ID}.${env.VITE_HOSTNAME}`,
        changeOrigin: true,
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
  };
});
