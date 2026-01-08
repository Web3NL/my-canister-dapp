/**
 * @file test/helpers.ts
 *
 * Shared test utilities for vite-plugin-canister-dapp tests.
 * Provides helpers for mocking Vite config hooks, browser location, and global variables.
 */

import type { UserConfig, Plugin } from 'vite';

/**
 * Calls the config hook of a Vite plugin with the specified mode.
 * Handles the type casting needed to call the hook function.
 */
export function callConfigHook(
  plugin: Plugin,
  viteConfig: UserConfig,
  mode: string
): void {
  const configFn = plugin.config as (
    config: UserConfig,
    env: { mode: string }
  ) => void;
  configFn(viteConfig, { mode });
}

/**
 * Mocks window.location for testing URL-based logic.
 */
export function mockLocation(
  protocol: string,
  hostname: string,
  origin?: string
): void {
  const calculatedOrigin = origin ?? `${protocol}//${hostname}`;
  Object.defineProperty(window, 'location', {
    value: {
      hostname,
      protocol,
      origin: calculatedOrigin,
    },
    writable: true,
    configurable: true,
  });
}

/**
 * Mocks the global configuration variables injected by the Vite plugin.
 */
export function mockGlobals(config: {
  devConfig?: object;
  prodConfig?: object;
  viteDevCanisterId?: string | null;
}): void {
  const globals = globalThis as Record<string, unknown>;

  if (config.devConfig !== undefined) {
    globals.__CANISTER_DAPP_DEV_CONFIG__ = config.devConfig;
  }
  if (config.prodConfig !== undefined) {
    globals.__CANISTER_DAPP_PROD_CONFIG__ = config.prodConfig;
  }
  if (config.viteDevCanisterId !== undefined) {
    globals.__VITE_DEV_CANISTER_ID__ = config.viteDevCanisterId;
  }
}

/**
 * Clears all mocked global configuration variables.
 */
export function clearGlobals(): void {
  const globals = globalThis as Record<string, unknown>;

  delete globals.__CANISTER_DAPP_DEV_CONFIG__;
  delete globals.__CANISTER_DAPP_PROD_CONFIG__;
  delete globals.__VITE_DEV_CANISTER_ID__;
}
