export interface DashboardConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

let configCache: DashboardConfig | null = null;
let isConfigFromJson = false;

async function loadDashboardConfig(): Promise<DashboardConfig> {
  if (configCache) {
    return configCache;
  }

  // First try: Check if we're in vite dev server and use environment variables
  if (
    typeof import.meta.env.VITE_IDENTITY_PROVIDER === 'string' &&
    typeof import.meta.env.VITE_DFXHOST === 'string'
  ) {
    const config: DashboardConfig = {
      identityProvider: import.meta.env.VITE_IDENTITY_PROVIDER,
      dfxHost: import.meta.env.VITE_DFXHOST,
      ...(typeof import.meta.env.VITE_CANISTER_ID === 'string' && {
        canisterIdDev: import.meta.env.VITE_CANISTER_ID,
      }),
    };
    configCache = config;
    isConfigFromJson = true; // Consider this as dev mode
    return config;
  }

  // Second try: Fetch dashboard-config.json
  try {
    const response = await fetch('/dashboard-config.json');
    if (response.ok) {
      const config = (await response.json()) as DashboardConfig;
      configCache = config;
      isConfigFromJson = true;
      return config;
    }
  } catch {
    // If fetch fails entirely, fall through to production constants
  }

  // Fallback to production constants
  const config: DashboardConfig = {
    identityProvider: 'https://identity.internetcomputer.org',
    dfxHost: 'https://icp0.io',
  };

  configCache = config;
  isConfigFromJson = false;
  return config;
}

export async function getConfig(): Promise<DashboardConfig> {
  return loadDashboardConfig();
}

export function isDevMode(): boolean {
  return isConfigFromJson;
}
