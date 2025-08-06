// import type { CanisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';
import { notEmptyString } from '@dfinity/utils';

export async function getConfig() {
  const canisterId = import.meta.env.VITE_CANISTER_ID;
  const iiCanisterId = import.meta.env.VITE_II_CANISTER_ID;
  const dfxProtocol = import.meta.env.VITE_DFX_PROTOCOL;
  const dfxHostname = import.meta.env.VITE_DFX_HOSTNAME;
  const dfxPort = import.meta.env.VITE_DFX_PORT;

  // Provide fallbacks similar to the working v3 version
  const isDevMode = import.meta.env.DEV;

  let identityProvider: string;
  let dfxHost: string;

  if (
    isDevMode &&
    notEmptyString(dfxProtocol) &&
    notEmptyString(iiCanisterId) &&
    notEmptyString(dfxHostname) &&
    notEmptyString(dfxPort)
  ) {
    // Development mode with full env vars
    identityProvider = `${dfxProtocol}://${iiCanisterId}.${dfxHostname}:${dfxPort}`;
    dfxHost = `${dfxProtocol}://${dfxHostname}:${dfxPort}`;
  } else {
    // Production fallbacks
    identityProvider = 'https://identity.internetcomputer.org';
    dfxHost = 'https://icp-api.io';
  }

  return {
    canisterId: notEmptyString(canisterId) ? canisterId : undefined,
    identityProvider,
    dfxHost,
  };
}

export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
