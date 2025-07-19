import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { MyDashboardBackend } from '@web3nl/my-canister-dashboard';
import { showError } from './errorHandler.js';
import { getCanisterId } from './utils.js';

const PROD = import.meta.env.MODE === 'production';
const II_URL =
  import.meta.env.VITE_IDENTITY_PROVIDER ??
  'https://identity.internetcomputer.org';
const HOST = import.meta.env.VITE_DFXHOST ?? 'https://icp0.io';

export class AuthManager {
  constructor() {
    this.authClient = null;
    this.agent = null;
    this.identity = null;
    this.principal = null;
    this.isAuthenticated = false;
  }

  async init() {
    this.authClient = await AuthClient.create();

    if (await this.authClient.isAuthenticated()) {
      await this.#updateAuthState();
    }

    return this.isAuthenticated;
  }

  async login() {
    if (!this.authClient) {
      await this.init();
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return new Promise((resolve, reject) => {
      this.authClient.login({
        identityProvider: II_URL,
        onSuccess: async () => {
          await this.#updateAuthState();
          resolve(this.isAuthenticated);
        },
        onError: error => {
          showError('Login failed. Please try again.');
          reject(error);
        },
      });
    });
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      this.#clearAuthState();
    }
  }

  async #updateAuthState() {
    if (!this.authClient) return;

    this.identity = this.authClient.getIdentity();
    this.principal = this.identity.getPrincipal();
    this.isAuthenticated = !this.principal.isAnonymous();

    if (this.isAuthenticated) {
      this.agent = new HttpAgent({
        identity: this.identity,
        host: HOST,
      });

      // Fetch root key for certificate validation during development
      if (!PROD) {
        try {
          await this.agent.fetchRootKey();
        } catch {
          showError('Unable to connect to local network');
        }
      }
    }
  }

  #clearAuthState() {
    this.identity = null;
    this.principal = null;
    this.agent = null;
    this.isAuthenticated = false;
  }

  getAgent() {
    return this.agent;
  }

  getPrincipalText() {
    return this.principal?.toString() ?? '';
  }

  async checkAuthorization() {
    if (!this.agent || !this.isAuthenticated) {
      return false;
    }

    try {
      const canisterId = getCanisterId();
      const backend = MyDashboardBackend.create({
        agent: this.agent,
        canisterId: canisterId,
      });

      const result = await backend.manageIIPrincipal({ Get: null });

      if ('Ok' in result) {
        const authorizedPrincipal = result.Ok.toString();
        const currentPrincipal = this.getPrincipalText();
        return authorizedPrincipal === currentPrincipal;
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
