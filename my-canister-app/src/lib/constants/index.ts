// Re-export canister IDs
export * from './canisterIds';

// Network constants
const MAINNET_HOST = 'https://icp0.io';
const LOCAL_HOST = 'http://localhost:8080';

const MAINNET_IDENTITY_PROVIDER = 'https://identity.internetcomputer.org';
const LOCAL_IDENTITY_PROVIDER =
  'http://qhbym-qaaaa-aaaaa-aaafq-cai.localhost:8080';

export const HOST = PROD ? MAINNET_HOST : LOCAL_HOST;
export const IDENTITY_PROVIDER = PROD
  ? MAINNET_IDENTITY_PROVIDER
  : LOCAL_IDENTITY_PROVIDER;

// Auth client constants (in nanoseconds)
const DEV_MAX_TIME_TO_LIVE = BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000); // 1 week
const PROD_MAX_TIME_TO_LIVE = BigInt(15 * 60 * 1000 * 1000 * 1000); // 15 minutes

export const MAX_TIME_TO_LIVE = PROD
  ? PROD_MAX_TIME_TO_LIVE
  : DEV_MAX_TIME_TO_LIVE;

// Registry constants
const PROD_REGISTRY_URL = '/wasm-registry/registry.json';
const DEV_REGISTRY_URL = '/wasm-registry/registry-dev.json';

export const REGISTRY_URL = PROD ? PROD_REGISTRY_URL : DEV_REGISTRY_URL;

// ICP constants
export const CREATE_CANISTER_MEMO = new Uint8Array([
  0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x00,
]); // 'CREA' in little-endian with padding
export const TRANSACTION_FEE = BigInt(10_000);
export const E8S_PER_TOKEN = BigInt(100000000);
export const MIN_CANISTER_CREATION_BALANCE = BigInt(20_000_000);
