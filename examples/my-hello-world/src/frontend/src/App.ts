// Main Application Manager
// Vanilla TypeScript implementation following canister-dashboard-frontend patterns

import { createActor } from '$declarations/index.js';
import { authManager } from './auth';
import { createCyclesChecker } from './cyclesChecker';
import {
  addEventListener,
  getInputValue,
  setText,
  toggleVisibility,
  showError,
  clearAllNotifications,
  showLoading,
  hideLoading,
} from './dom';
import {
  NOT_AUTHORIZED_MESSAGE,
  BACKEND_CALL_FAILED_MESSAGE,
  CYCLES_CHECK_FAILED_MESSAGE,
} from './constants';
import { inferCanisterId } from '@web3nl/vite-plugin-canister-dapp/runtime';

export class AppManager {
  private greeting = '';

  private constructor() {
    // Private constructor enforces use of static create method
  }

  static async create(): Promise<AppManager> {
    const instance = new AppManager();
    await instance.initialize();
    return instance;
  }

  private async initialize(): Promise<void> {
    const isAuthenticated = await authManager.init();

    if (isAuthenticated) {
      const isAuthorized = await authManager.checkAuthorization();
      if (!isAuthorized) {
        showError(NOT_AUTHORIZED_MESSAGE);
        await authManager.logout();
        this.setLoggedOutState();
        return;
      }
      this.setLoggedInState();
      await this.checkCycles();
    } else {
      this.setLoggedOutState();
    }
  }

  private setLoggedInState(): void {
    const principal = authManager.getPrincipalText();

    // Update UI
    toggleVisibility('auth-logged-out', false);
    toggleVisibility('auth-logged-in', true);
    setText('principal', principal);
    toggleVisibility('dashboard-section', true);
    toggleVisibility('greeting-section', true);

    // Setup event listeners
    addEventListener('logout-btn', 'click', () => this.handleLogout());
    addEventListener('dashboard-btn', 'click', () =>
      this.handleOpenDashboard()
    );
    addEventListener('greeting-form', 'submit', e => this.handleSubmit(e));
  }

  private setLoggedOutState(): void {
    // Update UI
    toggleVisibility('auth-logged-out', true);
    toggleVisibility('auth-logged-in', false);
    setText('principal', '');
    toggleVisibility('dashboard-section', false);
    toggleVisibility('greeting-section', false);
    toggleVisibility('greeting', false);

    // Setup login listener
    addEventListener('login-btn', 'click', () => this.handleLogin());
  }

  private async checkCycles(): Promise<void> {
    try {
      const agent = authManager.getAgent();
      if (agent) {
        const cyclesChecker = createCyclesChecker();
        await cyclesChecker.checkAndWarn(agent);
      }
    } catch {
      showError(CYCLES_CHECK_FAILED_MESSAGE);
    }
  }

  private async handleLogin(): Promise<void> {
    showLoading();
    try {
      const success = await authManager.login();

      if (success) {
        const isAuthorized = await authManager.checkAuthorization();
        if (!isAuthorized) {
          showError(NOT_AUTHORIZED_MESSAGE);
          await authManager.logout();
          this.setLoggedOutState();
          return;
        }
        this.setLoggedInState();
        await this.checkCycles();
      }
    } finally {
      hideLoading();
    }
  }

  private async handleLogout(): Promise<void> {
    showLoading();
    try {
      await authManager.logout();
      this.greeting = '';
      clearAllNotifications();
      this.setLoggedOutState();
    } finally {
      hideLoading();
    }
  }

  private handleOpenDashboard(): void {
    window.open('/canister-dashboard', '_blank', 'noopener,noreferrer');
  }

  private async handleSubmit(e?: Event): Promise<void> {
    e?.preventDefault();

    const name = getInputValue('name');
    if (!name) return;

    showLoading();
    try {
      const canisterId = inferCanisterId();
      const agent = authManager.getAgent();
      if (!agent) {
        throw new Error('No authenticated agent available');
      }

      const backend = createActor(canisterId, { agent });
      this.greeting = (await backend.greet(name)) as string;

      // Update greeting display
      setText('greeting', this.greeting);
      toggleVisibility('greeting', true);
    } catch (error) {
      showError(BACKEND_CALL_FAILED_MESSAGE);
      console.error('Backend call failed:', error);
    } finally {
      hideLoading();
    }
  }
}
