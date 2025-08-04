interface CanisterDashboardDevConfig {
  canisterId: unknown;
  dfxHost: string;
  identityProvider: string;
}

// Hardcoded production configuration
const PRODUCTION_CONFIG: CanisterDashboardDevConfig = {
  canisterId: undefined,
  identityProvider: 'https://identity.internetcomputer.org',
  dfxHost: 'https://icp-api.io',
};

let configCache: CanisterDashboardDevConfig | null = null;
let devModeCache: boolean | null = null;

export async function getConfig(): Promise<CanisterDashboardDevConfig> {
  if (configCache) {
    return configCache;
  }

  // Try to fetch canister-dashboard-config.json for runtime dev detection
  try {
    const response = await fetch('/canister-dashboard-config.json');
    if (response.ok) {
      const devConfig = (await response.json()) as CanisterDashboardDevConfig;
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
