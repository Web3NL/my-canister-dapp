import { Principal } from '@dfinity/principal';
import { HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import {
  inferCanisterId,
  inferEnvironment,
  isDevMode,
} from '@web3nl/vite-plugin-canister-dapp/runtime';
import type { CanisterDappEnvironmentConfig } from '@web3nl/vite-plugin-canister-dapp';
import {
  reportError,
  CANISTER_ID_ERROR_MESSAGE,
  HTTP_AGENT_ERROR_MESSAGE,
} from './error';

export function getConfig(): CanisterDappEnvironmentConfig {
  return inferEnvironment();
}

export function canisterId(): Principal {
  try {
    return inferCanisterId();
  } catch (error) {
    reportError(CANISTER_ID_ERROR_MESSAGE, error);
    throw new Error(CANISTER_ID_ERROR_MESSAGE);
  }
}

export async function createHttpAgent(): Promise<HttpAgent> {
  try {
    const authClient = await AuthClient.create();
    const config = getConfig();

    const identity = authClient.getIdentity();

    const agent = await HttpAgent.create({
      identity,
      host: config.host,
    });

    if (isDevMode()) {
      await agent.fetchRootKey();
    }

    return agent;
  } catch (error) {
    reportError(HTTP_AGENT_ERROR_MESSAGE, error);
    throw error;
  }
}

export function isValidPrincipal(text: string): boolean {
  try {
    Principal.fromText(text);
    return true;
  } catch {
    return false;
  }
}

// Mirror backend my-canister-dapp-rs/my-canister-dashboard/src/dashboard/alternative_origins.rs
// Allowed:
// - http://localhost:<port>
// - http://<subdomain>.localhost:<port>
// - https://<any>
export function isValidOrigin(text: string): boolean {
  try {
    const url = new URL(text);
    const isHttps = url.protocol === 'https:';
    const isHttpLocalhost =
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) &&
      /:\d+$/.test(url.host);

    return isHttps || isHttpLocalhost;
  } catch {
    return false;
  }
}
