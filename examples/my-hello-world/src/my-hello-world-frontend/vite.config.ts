import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import { canisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => {
  return {
    plugins: [
      canisterDashboardDevConfig()
    ],
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: "globalThis",
        },
      },
    },
    define: {
      global: 'globalThis',
      'process.env.DFX_NETWORK': JSON.stringify(process.env.DFX_NETWORK),
    },
    resolve: {
      alias: [
        {
          find: "$declarations",
          replacement: fileURLToPath(
            new URL("../declarations/", import.meta.url)
          ),
        },
      ]
    },
  };
});
