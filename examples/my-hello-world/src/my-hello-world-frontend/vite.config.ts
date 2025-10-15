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
      ]
    },
  };
});
