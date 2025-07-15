import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_');
  console.log('Mode:', mode);
  console.log('Loaded env:', env);

  const dfxHost = env.VITE_DFXHOST;
  const canisterId = env.VITE_CANISTER_ID;

  if (mode === 'development') {
    if (!dfxHost) {
      throw new Error(
        'VITE_DFXHOST environment variable is required in development mode'
      );
    }
    if (!canisterId) {
      throw new Error(
        'VITE_CANISTER_ID environment variable is required in development mode'
      );
    }
  }

  return {
    root: 'src',
    base: '/canister-dashboard',
    envDir: __dirname,
    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      cssCodeSplit: false,
      minify: false,

      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.html'),
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    define: {
      global: 'globalThis',
    },
    resolve: {
      alias: {
        $declarations: path.resolve(__dirname, '../../declarations'),
      },
    },
    test: {
      include: ['../test/**/*.{test,spec}.{js,ts}'],
      environment: 'jsdom',
    },
    server: {
      port: 5173,
      proxy: {
        '/.well-known/ii-alternative-origins': {
          target: dfxHost,
          changeOrigin: true,
          rewrite: path => `${path}?canisterId=${canisterId}`,
        },
      },
    },
  };
});
