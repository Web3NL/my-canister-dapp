import { Principal } from '@dfinity/principal';
import { HttpAgent } from '@dfinity/agent';
import { HOST, PROD, CANISTER_ID_DEV } from './envvars';
import { AuthClient } from '@dfinity/auth-client';
import { inferCanisterIdFromLocation } from '@web3nl/my-canister-dashboard';
import {
  showError,
  CANISTER_ID_ERROR_MESSAGE,
  HTTP_AGENT_ERROR_MESSAGE,
} from './error';

export function canisterId(): Principal {
  try {
    return inferCanisterIdFromLocation();
  } catch {
    // When in dev server inference fails and we use local canister ID
    if (CANISTER_ID_DEV !== undefined) {
      return Principal.fromText(CANISTER_ID_DEV);
    }

    showError(CANISTER_ID_ERROR_MESSAGE);
    throw new Error('No canister ID available');
  }
}

export async function createHttpAgent(): Promise<HttpAgent> {
  try {
    const authClient = await AuthClient.create();

    const identity = authClient.getIdentity();

    const agent = await HttpAgent.create({
      identity,
      host: HOST,
    });

    if (!PROD) {
      await agent.fetchRootKey();
    }

    return agent;
  } catch (error) {
    showError(HTTP_AGENT_ERROR_MESSAGE);
    throw error;
  }
}
