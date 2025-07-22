export interface DashboardConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

let configCache: DashboardConfig | null = null;

export async function getConfig(): Promise<DashboardConfig> {
  return loadDashboardConfig();
}

export function isDevMode(): boolean {
  return configCache !== null;
}

async function loadDashboardConfig(): Promise<DashboardConfig> {
  if (configCache) {
    return configCache;
  }

  // First try: Check if we're in vite dev server and use environment variables
  const viteConfig = loadViteConfig();
  if (viteConfig) {
    configCache = viteConfig;
    return viteConfig;
  }

  // Second try: Fetch dashboard-config.json if in running  in dfx
  try {
    const jsonConfig = await loadJsonConfig();
    if (jsonConfig) {
      configCache = jsonConfig;
      return jsonConfig;
    }
  } catch {
    // If fetch fails entirely, fall through to production constants
  }

  // Fallback to production constants
  const config: DashboardConfig = {
    identityProvider: 'https://identity.internetcomputer.org',
    dfxHost: 'https://icp-api.io',
  };

  configCache = config;
  return config;
}

function loadViteConfig(): DashboardConfig | null {
  const identityProvider = import.meta.env.VITE_IDENTITY_PROVIDER;
  const dfxHost = import.meta.env.VITE_DFXHOST;
  const canisterId = import.meta.env.VITE_CANISTER_ID;

  // Check for required env vars (canister ID is optional)
  if (isValidEnvVar(identityProvider) && isValidEnvVar(dfxHost)) {
    const config: DashboardConfig = {
      identityProvider,
      dfxHost,
    };

    if (isValidEnvVar(canisterId)) {
      config.canisterIdDev = canisterId;
    }

    return config;
  }
  return null;
}

async function loadJsonConfig(): Promise<DashboardConfig | null> {
  const response = await fetch('/dashboard-config.json');
  if (response.ok) {
    return (await response.json()) as DashboardConfig;
  }
  return null;
}

function isValidEnvVar(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}
