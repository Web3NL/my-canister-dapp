import type { Principal } from '@dfinity/principal';
import type { Readable } from 'svelte/store';
import { writable } from 'svelte/store';
import {
  RemoteAuthClientImpl,
  type RemoteAuthClient,
} from '$lib/remoteAuthentication/remoteAuthClient';

interface RemoteAuthStore
  extends Readable<Principal | null | undefined>,
    RemoteAuthClient {}

async function createRemoteAuthStore(): Promise<RemoteAuthStore> {
  const { subscribe, set } = writable<Principal | null | undefined>(undefined);

  let remoteAuthClient: RemoteAuthClient | null = null;

  remoteAuthClient = await RemoteAuthClientImpl.create();
  const principal = await remoteAuthClient.getPrincipal();
  set(principal);

  return {
    subscribe,

    login: async (canisterId: Principal) => {
      remoteAuthClient ??= await RemoteAuthClientImpl.create();
      await remoteAuthClient.login(canisterId);
      const principal = await remoteAuthClient.getPrincipal();
      set(principal);
    },

    logout: async () => {
      if (remoteAuthClient) {
        await remoteAuthClient.logout();
      }
      set(null);
    },

    getPrincipal: async () => {
      remoteAuthClient ??= await RemoteAuthClientImpl.create();
      return await remoteAuthClient.getPrincipal();
    },
  };
}

export const remoteAuthStore = await createRemoteAuthStore();
