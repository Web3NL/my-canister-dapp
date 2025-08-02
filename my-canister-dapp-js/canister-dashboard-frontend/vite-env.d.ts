/// <reference types="vite/client" />

declare module 'virtual:canister-dapp-config' {
  interface CanisterDappConfig {
    identityProvider: string;
    dfxHost: string;
    canisterIdDev?: string;
  }
  const config: CanisterDappConfig;
  export default config;
  export const isDevMode: boolean;
}