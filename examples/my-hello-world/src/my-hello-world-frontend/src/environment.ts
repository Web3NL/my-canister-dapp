import config, { isDevMode as pluginIsDevMode } from 'virtual:dapp-config';
import type { DappConfig } from '@web3nl/vite-plugin-dapp-config';

export async function getConfig(): Promise<DappConfig> {
  return config;
}

export function isDevMode(): boolean {
  return pluginIsDevMode;
}
