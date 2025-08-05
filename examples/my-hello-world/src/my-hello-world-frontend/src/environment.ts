// import type { CanisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';
import { notEmptyString } from '@dfinity/utils';

export async function getConfig() {
  const canisterId = import.meta.env.VITE_CANISTER_ID;
  const iiCanisterId = import.meta.env.VITE_II_CANISTER_ID;
  const dfxProtocol = import.meta.env.VITE_DFX_PROTOCOL;
  const dfxHostname = import.meta.env.VITE_DFX_HOSTNAME;
  const dfxPort = import.meta.env.VITE_DFX_PORT;

  return {
    canisterId: notEmptyString(canisterId) ? canisterId : undefined,
    identityProvider: `${dfxProtocol}://${iiCanisterId}.${dfxHostname}:${dfxPort}`,
    dfxHost: `${dfxProtocol}://${dfxHostname}:${dfxPort}`,
  };
}

export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
