/// <reference types="vite/client" />

declare module 'virtual:dapp-config' {
  interface DappConfig {
    identityProvider: string;
    dfxHost: string;
    canisterIdDev?: string;
  }
  const config: DappConfig;
  export default config;
}