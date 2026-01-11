import type { CanisterDappEnvironmentConfig } from './plugin.js';

/**
 * Default development environment configuration
 */
export const DEFAULT_DEV_CONFIG: CanisterDappEnvironmentConfig = {
  host: 'http://localhost:8080',
  identityProvider: 'http://uxrrr-q7777-77774-qaaaq-cai.localhost:8080',
};

/**
 * Default production environment configuration
 */
export const DEFAULT_PROD_CONFIG: CanisterDappEnvironmentConfig = {
  host: 'https://icp-api.io',
  identityProvider: 'https://identity.internetcomputer.org',
};

/**
 * Type guard to check if a value is a non-empty string
 */
export function notEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
