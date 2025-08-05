import type { CanisterDashboardDevConfig } from '@web3nl/vite-plugin-canister-dapp';

export async function getConfig(): Promise<CanisterDashboardDevConfig> {
  return {
    canisterId: import.meta.env.VITE_CANISTER_ID,
    identityProvider: import.meta.env.VITE_IDENTITY_PROVIDER,
    dfxHost: import.meta.env.VITE_DFX_HOST,
  };
}

export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
