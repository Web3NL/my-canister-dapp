import { AuthClient } from '@dfinity/auth-client';
import type { Principal } from '@dfinity/principal';
import { getConfig } from '../envvars';
import { MAX_TIME_TO_LIVE } from '../constants';

export class AuthManager {
  private authClient: AuthClient | null = null;

  async create(): Promise<void> {
    this.authClient = await AuthClient.create();
  }

  public async login(): Promise<void> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    const isAuthed = await this.authClient.isAuthenticated();

    if (isAuthed) {
      return;
    }

    const config = await getConfig();

    return new Promise<void>((resolve, reject) => {
      this.authClient!.login({
        identityProvider: config.identityProvider,
        maxTimeToLive: MAX_TIME_TO_LIVE,
        onSuccess: () => {
          resolve();
        },
        onError: error => {
          reject(error);
        },
      });
    });
  }

  public async logout(): Promise<void> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    await this.authClient.logout();
  }

  public async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    return this.authClient.isAuthenticated();
  }

  public async getPrincipal(): Promise<Principal> {
    if (!this.authClient) {
      throw new Error('Auth client not initialized');
    }

    const isAuthed = await this.authClient.isAuthenticated();
    if (!isAuthed) {
      throw new Error('User is not authenticated');
    }

    return this.authClient.getIdentity().getPrincipal();
  }
}
