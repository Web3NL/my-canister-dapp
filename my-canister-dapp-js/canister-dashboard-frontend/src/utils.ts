import { Principal } from '@dfinity/principal';
import { HttpAgent } from '@dfinity/agent';
import { getConfig, isDevMode } from './environment';
import { AuthClient } from '@dfinity/auth-client';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';
import {
  showError,
  CANISTER_ID_ERROR_MESSAGE,
  HTTP_AGENT_ERROR_MESSAGE,
} from './error';

export async function canisterId(): Promise<Principal> {
  try {
    return inferCanisterIdFromLocation();
  } catch {
    // When in dev server inference fails and we use local canister ID
    const config = await getConfig();
    if (config.canisterId !== undefined) {
      return Principal.fromText(config.canisterId);
    }

    showError(CANISTER_ID_ERROR_MESSAGE);
    throw new Error('No canister ID available');
  }
}

export async function createHttpAgent(): Promise<HttpAgent> {
  try {
    const authClient = await AuthClient.create();
    const config = await getConfig();

    const identity = authClient.getIdentity();

    const agent = await HttpAgent.create({
      identity,
      host: config.dfxHost,
    });

    if (isDevMode()) {
      await agent.fetchRootKey();
    }

    return agent;
  } catch (error) {
    showError(HTTP_AGENT_ERROR_MESSAGE);
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
