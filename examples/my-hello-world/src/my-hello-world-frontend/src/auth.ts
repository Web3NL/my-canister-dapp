import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import type { Identity } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { MyDashboardBackend } from '@web3nl/my-canister-dashboard';
import { showError } from './errorHandler';
import { getCanisterId } from './utils';
import { getConfig, isDevMode } from './environment';

interface AuthorizationResult {
  Ok?: Principal;
  Err?: string;
}

class AuthManager {
  private authClient: AuthClient | null = null;
  private agent: HttpAgent | null = null;
  private identity: Identity | null = null;
  private principal: Principal | null = null;
  private isAuthenticated = false;

  async init(): Promise<boolean> {
    this.authClient = await AuthClient.create();

    if (await this.authClient.isAuthenticated()) {
      await this.updateAuthState();
    }

    return this.isAuthenticated;
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      await this.init();
    }

    const config = await getConfig();

    return new Promise((resolve, reject) => {
      this.authClient!.login({
        identityProvider: config.identityProvider,
        onSuccess: async () => {
          await this.updateAuthState();
          resolve(this.isAuthenticated);
        },
        onError: (error?: string) => {
          showError('Login failed. Please try again.');
          reject(error);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this.clearAuthState();
    }
  }

  private async updateAuthState(): Promise<void> {
    if (!this.authClient) return;

    this.identity = this.authClient.getIdentity();
    this.principal = this.identity.getPrincipal();
    this.isAuthenticated = !this.principal.isAnonymous();

    if (this.isAuthenticated) {
      const config = await getConfig();

      this.agent = new HttpAgent({
        identity: this.identity,
        host: config.dfxHost,
      });

      // Fetch root key for certificate validation during development
      if (isDevMode()) {
        try {
          await this.agent.fetchRootKey();
        } catch {
          showError('Unable to connect to local network');
        }
      }
    }
  }

  private clearAuthState(): void {
    this.identity = null;
    this.principal = null;
    this.agent = null;
    this.isAuthenticated = false;
  }

  getAgent(): HttpAgent | null {
    return this.agent;
  }

  getPrincipalText(): string {
    return this.principal?.toString() ?? '';
  }

  async checkAuthorization(): Promise<boolean> {
    if (!this.agent || !this.isAuthenticated) {
      return false;
    }

    try {
      const canisterId = await getCanisterId();
      const backend = MyDashboardBackend.create({
        agent: this.agent,
        canisterId: canisterId,
      });

      const result = (await backend.manageIIPrincipal({
        Get: null,
      })) as AuthorizationResult;

      if ('Ok' in result) {
        return true;
      } else {
        showError(`Authorization check failed: ${result.Err}`);
        return false;
      }
    } catch {
      showError('Failed to check authorization');
      return false;
    }
  }
}

// Singleton instance
export const authManager = new AuthManager();
