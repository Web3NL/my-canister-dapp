import config, {
  isDevMode as pluginIsDevMode,
} from 'virtual:canister-dapp-config';
import type { CanisterDappConfig } from '@web3nl/vite-plugin-canister-dapp-config';

export async function getConfig(): Promise<CanisterDappConfig> {
  return config;
}

export function isDevMode(): boolean {
  return pluginIsDevMode;
}
