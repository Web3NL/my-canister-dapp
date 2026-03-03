import { HOST } from '$lib/constants';

export function createDerivationOriginFromHost(
  canisterId: string,
  host: string
): string {
  const url = new URL(host);

  if (url.hostname === 'localhost') {
    return `${url.protocol}//${canisterId}.${url.hostname}:${url.port}`;
  } else {
    return `${url.protocol}//${canisterId}.${url.hostname}`;
  }
}

export function createDerivationOrigin(canisterId: string): string {
  return createDerivationOriginFromHost(canisterId, HOST);
}
