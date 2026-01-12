import { HOST } from '$lib/constants';

/**
 * Pure function to create derivation origin from host.
 * Extractable to @web3nl/canister-dapp-installer package.
 *
 * @param canisterId - The canister ID to create the origin for
 * @param host - The host URL (e.g., 'http://localhost:8080' or 'https://icp0.io')
 * @returns The derivation origin URL
 */
export function createDerivationOriginFromHost(
  canisterId: string,
  host: string
): string {
  const url = new URL(host);

  if (url.hostname === 'localhost') {
    // Local development: canister-id.localhost:port
    return `${url.protocol}//${canisterId}.${url.hostname}:${url.port}`;
  } else {
    // Mainnet: canister-id.icp0.io
    return `${url.protocol}//${canisterId}.${url.hostname}`;
  }
}

/**
 * Creates derivation origin for a canister using the configured HOST.
 */
export function createDerivationOrigin(canisterId: string): string {
  return createDerivationOriginFromHost(canisterId, HOST);
}
