import { AuthManager } from './components/auth';
import { StatusManager } from './components/status';
import { TopupManager } from './components/top-up';
import { ControllersManager } from './components/controllers';
import { AlternativeOriginsManager } from './components/alternativeOrigins';
import { canisterId } from './utils';
import { DASHBOARD_INIT_ERROR_MESSAGE } from './error';
import { getConfig } from './environment';
import { setLoggedInState, setLoggedOutState, showError } from './dom';

class Dashboard {
  private authManager: AuthManager | null = null;

  constructor() {
    void this.create();
  }

  async create(): Promise<void> {
    try {
      // Load configuration first
      await getConfig();

      this.authManager = new AuthManager();
      await this.authManager.create();
      await this.initializeAuthenticatedState();
    } catch (error) {
      showError(DASHBOARD_INIT_ERROR_MESSAGE);
      throw error;
    }
  }

  private async initializeAuthenticatedState(): Promise<void> {
    if (!this.authManager) {
      throw new Error('Auth manager not initialized');
    }

    const isAuthed = await this.authManager.isAuthenticated();

    if (isAuthed) {
      const iiPrincipal = await this.authManager.getPrincipal();
      const principalText = iiPrincipal.toText();
      this.setLoggedInState(principalText);

      const canisterIdPrincipal = await canisterId();

      const topupManager = new TopupManager();
      const statusManager = new StatusManager();
      const controllersManager = new ControllersManager(
        canisterIdPrincipal,
        iiPrincipal
      );
      const alternativeOriginsManager = new AlternativeOriginsManager();

      await topupManager.create();
      await statusManager.create();
      await controllersManager.create();
      await alternativeOriginsManager.create();
    } else {
      this.setLoggedOutState();
    }
  }

  private setLoggedInState(principalText: string): void {
    setLoggedInState(principalText, () => this.handleLogout());
  }

  private setLoggedOutState(): void {
    setLoggedOutState(() => this.handleLogin());
  }

  private async handleLogin(): Promise<void> {
    if (!this.authManager) {
      throw new Error('Auth manager not initialized');
    }

    await this.authManager.login();
    await this.initializeAuthenticatedState();
  }

  private async handleLogout(): Promise<void> {
    if (!this.authManager) {
      throw new Error('Auth manager not initialized');
    }

    await this.authManager.logout();
    this.setLoggedOutState();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
