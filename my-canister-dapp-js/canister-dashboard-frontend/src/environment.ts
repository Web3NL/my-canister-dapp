import config, { isDevMode as pluginIsDevMode } from 'virtual:dapp-config';
import type { DappConfig } from '@web3nl/vite-plugin-dapp-config';

let configCache: DappConfig | null = null;
let devModeCache: boolean | null = null;

export async function getConfig(): Promise<DappConfig> {
  if (configCache) {
    return configCache;
  }

  // Try to fetch dapp-config.json for runtime dev detection
  try {
    const response = await fetch('/dapp-config.json');
    if (response.ok) {
      const devConfig = (await response.json()) as DappConfig;
      configCache = devConfig;
      devModeCache = true;
      return devConfig;
    }
  } catch {
    // If fetch fails, use build-time config
  }

  // Fallback to build-time resolved config
  configCache = config;
  devModeCache = Boolean(pluginIsDevMode);
  return configCache;
}

export function isDevMode(): boolean {
  if (devModeCache !== null) {
    return devModeCache;
  }

  // Fallback to build-time dev mode detection
  return Boolean(pluginIsDevMode);
}
