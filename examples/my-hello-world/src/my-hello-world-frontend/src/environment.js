/**
 * @typedef {Object} HelloWorldConfig
 * @property {string} identityProvider
 * @property {string} dfxHost
 * @property {string} [canisterIdDev]
 */

/** @type {HelloWorldConfig | null} */
let configCache = null;

/**
 * @returns {Promise<HelloWorldConfig>}
 */
export async function getConfig() {
  return loadHelloWorldConfig();
}

/**
 * @returns {boolean}
 */
export function isDevMode() {
  return configCache !== null;
}

/**
 * @returns {Promise<HelloWorldConfig>}
 */
async function loadHelloWorldConfig() {
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
  const config = {
    identityProvider: 'https://identity.internetcomputer.org',
    dfxHost: 'https://icp-api.io',
  };

  configCache = config;
  return config;
}

/**
 * @returns {HelloWorldConfig | null}
 */
function loadViteConfig() {
  const identityProvider = import.meta.env.VITE_IDENTITY_PROVIDER;
  const dfxHost = import.meta.env.VITE_DFXHOST;
  const canisterId = import.meta.env.VITE_MY_HELLO_WORLD_CANISTER_ID;

  // Check for required env vars (canister ID is optional)
  if (isValidEnvVar(identityProvider) && isValidEnvVar(dfxHost)) {
    const config = {
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

/**
 * @returns {Promise<HelloWorldConfig | null>}
 */
async function loadJsonConfig() {
  const response = await fetch('/my-hello-world-config.json');
  if (response.ok) {
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return /** @type {HelloWorldConfig} */ (data);
  }
  return null;
}

/**
 * @param {string | undefined} value
 * @returns {value is string}
 */
function isValidEnvVar(value) {
  return typeof value === 'string' && value.length > 0;
}
