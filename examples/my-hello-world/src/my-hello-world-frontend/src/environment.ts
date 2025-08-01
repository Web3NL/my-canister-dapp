import config from 'virtual:dapp-config';

export interface HelloWorldConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

let configCache: HelloWorldConfig | null = null;
let devModeCache: boolean | null = null;

export async function getConfig(): Promise<HelloWorldConfig> {
  if (configCache) {
    return configCache;
  }

  // Try to fetch dapp-config.json for runtime dev detection
  try {
    const response = await fetch('/dapp-config.json');
    if (response.ok) {
      const devConfig = (await response.json()) as HelloWorldConfig;
      configCache = devConfig;
      devModeCache = true;
      return devConfig;
    }
  } catch {
    // If fetch fails, use build-time config
  }

  // Fallback to build-time resolved config
  configCache = config as HelloWorldConfig;
  devModeCache = false;
  return configCache;
}

export function isDevMode(): boolean {
  if (devModeCache !== null) {
    return devModeCache;
  }

  // Synchronous check - if we haven't loaded config yet, assume prod
  return false;
}
