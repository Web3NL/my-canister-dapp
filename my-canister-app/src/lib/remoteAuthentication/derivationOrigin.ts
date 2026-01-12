import { HOST } from '$lib/constants';
import { createDerivationOriginFromHost } from '@web3nl/my-canister-installer';

/**
 * Creates derivation origin for a canister using the configured HOST.
 */
export function createDerivationOrigin(canisterId: string): string {
  return createDerivationOriginFromHost(canisterId, HOST);
}
