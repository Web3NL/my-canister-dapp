export async function getConfig() {
  return {
    canisterId: import.meta.env.VITE_CANISTER_ID,
    identityProvider: import.meta.env.VITE_IDENTITY_PROVIDER,
    dfxHost: import.meta.env.VITE_DFX_HOST,
  };
}

export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
