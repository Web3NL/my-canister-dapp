import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import { canisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';

export default defineConfig(() => {
  return {
    plugins: [
      canisterDappEnvironmentConfig({
        viteDevCanisterId: '22ajg-aqaaa-aaaap-adukq-cai',
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
        // Map @dfinity imports (from dfx-generated declarations) to @icp-sdk
        { find: "@dfinity/agent", replacement: "@icp-sdk/core/agent" },
        { find: "@dfinity/principal", replacement: "@icp-sdk/core/principal" },
        { find: "@dfinity/candid", replacement: "@icp-sdk/core/candid" },
      ]
    },
  };
});
