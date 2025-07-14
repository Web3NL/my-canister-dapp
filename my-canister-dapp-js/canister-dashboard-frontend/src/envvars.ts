export const PROD = import.meta.env.MODE == 'production';

export const IDENTITY_PROVIDER =
  import.meta.env.VITE_IDENTITY_PROVIDER ??
  'https://identity.internetcomputer.org';

export const HOST = import.meta.env.VITE_DFXHOST ?? 'https://icp0.io';

export const CANISTER_ID_DEV = import.meta.env.VITE_CANISTER_ID;
