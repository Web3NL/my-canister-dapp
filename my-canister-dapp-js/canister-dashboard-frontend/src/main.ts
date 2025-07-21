import { AuthManager } from './components/auth';
import { StatusManager } from './components/status';
import { TopupManager } from './components/top-up';
import { ControllersManager } from './components/controllers';
import { AlternativeOriginsManager } from './components/alternativeOrigins';
import { canisterId } from './utils';
import { showError, DASHBOARD_INIT_ERROR_MESSAGE } from './error';
import { getConfig } from './environment';

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
    const authBtn = document.getElementById('auth-btn');
    const principalEl = document.getElementById('ii-principal');
    const contentEl = document.getElementById('authenticated-content');

    if (!authBtn || !principalEl || !contentEl) {
      throw new Error('Required elements not found');
    }

    authBtn.textContent = 'Logout';
    authBtn.onclick = async (): Promise<void> => {
      try {
        await this.handleLogout();
      } catch {
        showError('Logout failed. Please try again.');
      }
    };

    principalEl.classList.remove('hidden');
    principalEl.textContent = principalText;

    contentEl.classList.remove('hidden');
  }

  private setLoggedOutState(): void {
    const authBtn = document.getElementById('auth-btn');
    const principalEl = document.getElementById('ii-principal');
    const contentEl = document.getElementById('authenticated-content');
    const errorSection = document.getElementById('error-section');
    const loadingOverlay = document.getElementById('loading-overlay');

    if (
      !authBtn ||
      !principalEl ||
      !contentEl ||
      !errorSection ||
      !loadingOverlay
    ) {
      throw new Error('Required elements not found');
    }

    authBtn.textContent = 'Login';
    authBtn.onclick = async (): Promise<void> => {
      try {
        await this.handleLogin();
      } catch {
        showError('Login failed. Please try again.');
      }
    };

    principalEl.classList.add('hidden');
    principalEl.textContent = '';

    contentEl.classList.add('hidden');

    errorSection.classList.add('hidden');
    errorSection.textContent = '';

    loadingOverlay.classList.add('hidden');
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
