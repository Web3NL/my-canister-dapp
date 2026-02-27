import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      canisterDappEnvironmentConfig({
        viteDevCanisterId: process.env.VITE_MY_NOTEPAD_CANISTER_ID || '',
      })
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
    },
    resolve: {
      alias: [
        {
          find: "$declarations",
          replacement: fileURLToPath(
            new URL("../declarations/", import.meta.url)
          ),
        },
        { find: "@dfinity/agent", replacement: "@icp-sdk/core/agent" },
        { find: "@dfinity/principal", replacement: "@icp-sdk/core/principal" },
        { find: "@dfinity/candid", replacement: "@icp-sdk/core/candid" },
      ]
    },
  };
});
