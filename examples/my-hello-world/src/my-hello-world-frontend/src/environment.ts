export interface HelloWorldConfig {
  identityProvider: string;
  dfxHost: string;
  canisterIdDev?: string;
}

let configCache: HelloWorldConfig | null = null;

export async function getConfig(): Promise<HelloWorldConfig> {
  return loadHelloWorldConfig();
}

export function isDevMode(): boolean {
  return configCache !== null;
}

async function loadHelloWorldConfig(): Promise<HelloWorldConfig> {
  if (configCache !== null) {
    return configCache;
  }

  // First try: Check if we're in vite dev server and use environment variables
  const viteConfig = loadViteConfig();
  if (viteConfig) {
    configCache = viteConfig;
    return viteConfig;
  }

  // Second try: Fetch my-hello-world-config.json if running in dfx
  try {
    const jsonConfig = await loadJsonConfig();
    if (jsonConfig !== null) {
      configCache = jsonConfig;
      return jsonConfig;
    }
  } catch {
    // If fetch fails entirely, fall through to production constants
  }

  // Fallback to production constants
  const config: HelloWorldConfig = {
    identityProvider: 'https://identity.internetcomputer.org',
    dfxHost: 'https://icp-api.io',
  };

  configCache = config;
  return config;
}

function loadViteConfig(): HelloWorldConfig | null {
  const identityProvider = import.meta.env.VITE_IDENTITY_PROVIDER;
  const dfxHost = import.meta.env.VITE_DFXHOST;
  const canisterId = import.meta.env.VITE_MY_HELLO_WORLD_CANISTER_ID;

  // Check for required env vars (canister ID is optional)
  if (isValidEnvVar(identityProvider) && isValidEnvVar(dfxHost)) {
    const config: HelloWorldConfig = {
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

async function loadJsonConfig(): Promise<HelloWorldConfig | null> {
  const response = await fetch('/my-hello-world-config.json');
  if (response.ok) {
    const data = await response.json();
    return data as HelloWorldConfig;
  }
  return null;
}

function isValidEnvVar(value: string | undefined): value is string {
  return typeof value === 'string' && value.length > 0;
}
