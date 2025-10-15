import type { CanisterDappEnvironmentConfig } from './plugin';

declare global {
  /**
   * Development environment configuration injected by the Vite plugin
   * @internal
   */
  const __CANISTER_DAPP_DEV_CONFIG__: CanisterDappEnvironmentConfig;

  /**
   * Production environment configuration injected by the Vite plugin
   * @internal
   */
  const __CANISTER_DAPP_PROD_CONFIG__: CanisterDappEnvironmentConfig;

  /**
   * Canister ID for Vite dev server environments, injected by the Vite plugin
   * @internal
   */
  const __VITE_DEV_CANISTER_ID__: string | null;
}

export {};
