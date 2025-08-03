interface CanisterDappConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

// Hardcoded production configuration
const PRODUCTION_CONFIG: CanisterDappConfig = {
  identityProvider: 'https://identity.internetcomputer.org',
  dfxHost: 'https://icp-api.io',
};

let configCache: CanisterDappConfig | null = null;
let devModeCache: boolean | null = null;

export async function getConfig(): Promise<CanisterDappConfig> {
  if (configCache) {
    return configCache;
  }

  // Try to fetch canister-dapp-config.json for runtime dev detection
  try {
    const response = await fetch('/canister-dashboard-dev-env.json');
    if (response.ok) {
      const devConfig = (await response.json()) as CanisterDappConfig;
      configCache = devConfig;
      devModeCache = true;
      return devConfig;
    }
  } catch {
    // If fetch fails, use production config
  }

  // Fallback to hardcoded production config
  configCache = PRODUCTION_CONFIG;
  devModeCache = false;
  return configCache;
}

export function isDevMode(): boolean {
  if (devModeCache !== null) {
    return devModeCache;
  }

  // Fallback to false (production mode)
  return false;
}
