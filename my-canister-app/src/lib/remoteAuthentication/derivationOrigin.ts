import { HOST } from '$lib/constants';

export function createDerivationOrigin(canisterId: string): string {
  const url = new URL(HOST);

  if (url.hostname === 'localhost') {
    // Local development: canister-id.localhost:port
    return `${url.protocol}//${canisterId}.${url.hostname}:${url.port}`;
  } else {
    // Mainnet: canister-id.icp0.io
    return `${url.protocol}//${canisterId}.${url.hostname}`;
  }
}
