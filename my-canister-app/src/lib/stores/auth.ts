import type { Principal } from '@icp-sdk/core/principal';
import type { Readable } from 'svelte/store';
import type { Identity } from '@icp-sdk/core/agent';
import { writable } from 'svelte/store';
import { AuthClient } from '@icp-sdk/auth/client';
import { IDENTITY_PROVIDER, MAX_TIME_TO_LIVE } from '$lib/constants';

interface AuthStore extends Readable<Principal | null | undefined> {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getIdentity: () => Promise<Identity>;
  getPrincipal: () => Promise<Principal>;
}

async function createAuthStore(): Promise<AuthStore> {
  const { subscribe, set } = writable<Principal | null | undefined>(undefined);

  let authClient: AuthClient | null = null;

  const init = async () => {
    authClient = await AuthClient.create();
    const isAuthenticated = await authClient.isAuthenticated();
    if (isAuthenticated) {
      const identity = authClient.getIdentity();
      set(identity.getPrincipal());
    } else {
      set(null);
    }
  };

  await init();

  return {
    subscribe,
    login: async () => {
      authClient ??= await AuthClient.create();

      await authClient.login({
        identityProvider: IDENTITY_PROVIDER,
        maxTimeToLive: MAX_TIME_TO_LIVE,
        onSuccess: () => {
          const identity = authClient!.getIdentity();
          set(identity.getPrincipal());
        },
      });
    },
    logout: async () => {
      if (authClient) {
        await authClient.logout();
        set(null);
      }
    },
    getIdentity: async () => {
      authClient ??= await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        await authClient.logout();
        set(null);
        throw new Error('User not authenticated');
      }
      return authClient.getIdentity();
    },
    getPrincipal: async () => {
      authClient ??= await AuthClient.create();
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        await authClient.logout();
        set(null);
        throw new Error('User not authenticated');
      }
      return authClient.getIdentity().getPrincipal();
    },
  };
}

export const authStore = await createAuthStore();
