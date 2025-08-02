import config, {
  isDevMode as pluginIsDevMode,
} from 'virtual:canister-dapp-config';
import type { CanisterDappConfig } from '@web3nl/vite-plugin-canister-dapp-config';

let configCache: CanisterDappConfig | null = null;
let devModeCache: boolean | null = null;

export async function getConfig(): Promise<CanisterDappConfig> {
  if (configCache) {
    return configCache;
  }

  // Try to fetch canister-dapp-config.json for runtime dev detection
  try {
    const response = await fetch('/canister-dapp-config.json');
    if (response.ok) {
      const devConfig = (await response.json()) as CanisterDappConfig;
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
