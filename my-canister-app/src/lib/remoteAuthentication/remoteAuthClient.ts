import type { Principal } from '@icp-sdk/core/principal';
import { AuthClient } from '@icp-sdk/auth/client';
import { IDENTITY_PROVIDER, MAX_TIME_TO_LIVE } from '$lib/constants';
import { RemoteCanisterAuthStorage } from './storage';
import { createDerivationOrigin } from './derivationOrigin';

export interface RemoteAuthClient {
  login(canisterId: Principal): Promise<void>;
  logout(): Promise<void>;
  getPrincipal(): Promise<Principal | undefined>;
}

export class RemoteAuthClientImpl implements RemoteAuthClient {
  private authClient: AuthClient | null = null;
  private storage: RemoteCanisterAuthStorage;

  private constructor() {
    this.storage = new RemoteCanisterAuthStorage();
  }

  static async create(): Promise<RemoteAuthClient> {
    const client = new RemoteAuthClientImpl();
    await client.init();
    return client;
  }

  private async init() {
    this.authClient = await this.createAuthClient();
  }

  private async createAuthClient(): Promise<AuthClient> {
    return await AuthClient.create({
      storage: this.storage,
      keyType: 'Ed25519',
      idleOptions: { disableIdle: true },
    });
  }

  async login(canisterId: Principal): Promise<void> {
    const derivationOrigin = createDerivationOrigin(canisterId.toText());

    return new Promise((resolve, reject) => {
      this.authClient!.login({
        identityProvider: IDENTITY_PROVIDER,
        derivationOrigin,
        maxTimeToLive: MAX_TIME_TO_LIVE,
        onSuccess: () => resolve(),
        onError: error => reject(error),
      });
    });
  }

  async logout(): Promise<void> {
    await this.authClient!.logout();
  }

  async getPrincipal(): Promise<Principal | undefined> {
    return this.authClient?.getIdentity().getPrincipal();
  }
}
