import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';
import { showError } from './errorHandler.js';

const PROD = import.meta.env.MODE === 'production';
const II_URL = import.meta.env.VITE_IDENTITY_PROVIDER ?? 'https://identity.internetcomputer.org';
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

    return new Promise((resolve, reject) => {
      this.authClient.login({
        identityProvider: II_URL,
        onSuccess: async () => {
          await this.#updateAuthState();
          resolve(this.isAuthenticated);
        },
        onError: (error) => {
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
        } catch (err) {
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
    return this.principal?.toString() || '';
  }
}

// Singleton instance
export const authManager = new AuthManager();