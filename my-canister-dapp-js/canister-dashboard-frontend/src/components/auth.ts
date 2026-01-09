import { AuthClient } from '@icp-sdk/auth/client';
import type { Principal } from '@icp-sdk/core/principal';
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import { MAX_TIME_TO_LIVE } from '../constants';
import { createHttpAgent, canisterId, getConfig } from '../utils';
import {
  showError,
  NOT_AUTHORIZED_MESSAGE,
  reportError,
  USER_NOT_AUTHENTICATED_MESSAGE,
} from '../error';

export class AuthManager {
  private authClient: AuthClient | null = null;

  private constructor() {
    // Private constructor to enforce use of static create method
  }

  static async create(): Promise<AuthManager> {
    const instance = new AuthManager();
    instance.authClient = await AuthClient.create({
      idleOptions: { disableIdle: true },
    });
    return instance;
  }

  private async ensureAuthClient(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: { disableIdle: true },
      });
    }
    return this.authClient;
  }

  private async isIIPrincipal(): Promise<boolean> {
    try {
      // Double-check authentication state before making canister calls
      if (!this.authClient || !(await this.authClient.isAuthenticated())) {
        return false;
      }

      const agent = await createHttpAgent();
      const canister = canisterId();
      const dashboard = MyCanisterDashboard.create(agent, canister);

      return await dashboard.isAuthenticated();
    } catch (error) {
      // Log the error for debugging but return false gracefully
      console.warn('Failed to check II principal authorization:', error);
      return false;
    }
  }

  public async login(): Promise<void> {
    const client = await this.ensureAuthClient();
    const isAuthed = await client.isAuthenticated();

    // If there's an existing II session, verify authorization first.
    // - If authorized: we're done (no need to open II flow).
    // - If NOT authorized: logout to force a fresh II login flow below.
    if (isAuthed) {
      const authorized = await this.isIIPrincipal();
      if (authorized) {
        return;
      }
      await client.logout();
      this.authClient = null;
    }

    const config = getConfig();

    // Ensure we have a fresh AuthClient after a potential logout above
    const freshClient = await this.ensureAuthClient();

    await new Promise<void>((resolve, reject) => {
      freshClient.login({
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

    const isAuthorized = await this.isIIPrincipal();
    if (!isAuthorized) {
      showError(NOT_AUTHORIZED_MESSAGE);
      // Logout to clear II local storage so the next click restarts the flow
      await (await this.ensureAuthClient()).logout();
      this.authClient = null;
      return;
    }
  }

  public async logout(): Promise<void> {
    const client = await this.ensureAuthClient();
    await client.logout();
    // Drop the local reference so a new client will be created on next login
    this.authClient = null;
  }

  public async isAuthenticated(): Promise<boolean> {
    const client = await this.ensureAuthClient();

    // First check Internet Identity authentication
    const isAuthed = await client.isAuthenticated();
    if (!isAuthed) {
      // If not authenticated with II, no need to check canister authorization
      return false;
    }

    // Only check canister authorization if authenticated with II
    return await this.isIIPrincipal();
  }

  public async getPrincipal(): Promise<Principal> {
    const client = await this.ensureAuthClient();
    const isAuthed = await client.isAuthenticated();
    if (!isAuthed) {
      reportError(USER_NOT_AUTHENTICATED_MESSAGE);
      // Fallback: return the anonymous principal shape by asking identity
      return client.getIdentity().getPrincipal();
    }

    return client.getIdentity().getPrincipal();
  }
}
