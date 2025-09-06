import { AuthManager } from './components/auth';
import { StatusManager } from './components/status';
import { TopupManager } from './components/top-up';
import { ControllersManager } from './components/controllers';
import { AlternativeOriginsManager } from './components/alternativeOrigins';
import { CanisterLogsManager } from './components/canisterLogs';
import { canisterId } from './utils';
import {
  DASHBOARD_INIT_ERROR_MESSAGE,
  reportError,
  LOGOUT_FAILED_MESSAGE,
  AUTH_MANAGER_NOT_INITIALIZED_MESSAGE,
} from './error';
import {
  setLoggedInState,
  setLoggedOutState,
  showError,
  hideLoading,
  showLoading,
  clearErrors,
} from './dom';
import { TopUpRuleManager } from './components/top-up-rule';
import type { Principal } from '@dfinity/principal';

enum DashboardState {
  INITIALIZING = 'initializing',
  LOGGED_OUT = 'logged-out',
  LOGGING_IN = 'logging-in',
  LOGGED_IN = 'logged-in',
  ERROR = 'error',
}

class Dashboard {
  private authManager: AuthManager | null = null;
  private currentState: DashboardState = DashboardState.INITIALIZING;

  // Manager instances for lifecycle control
  private readonly managers = {
    topup: null as TopupManager | null,
    topUpRule: null as TopUpRuleManager | null,
    status: null as StatusManager | null,
    controllers: null as ControllersManager | null,
    alternativeOrigins: null as AlternativeOriginsManager | null,
    canisterLogs: null as CanisterLogsManager | null,
  };

  constructor() {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Show loading and login button immediately
      this.setState(DashboardState.INITIALIZING);
      showLoading();

      // Initialize auth manager (fast)
      this.authManager = await AuthManager.create();

      // Check existing authentication state
      await this.checkAuthenticationState();
    } catch (error) {
      console.error('Dashboard initialization error:', error);
      this.setState(DashboardState.ERROR);
      showError(DASHBOARD_INIT_ERROR_MESSAGE);
    } finally {
      hideLoading();
    }
  }

  private async checkAuthenticationState(): Promise<void> {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);

    try {
      const isAuthed = await this.authManager.isAuthenticated();

      if (isAuthed) {
        await this.transitionToLoggedIn();
      } else {
        this.transitionToLoggedOut();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      this.transitionToLoggedOut();
    }
  }

  private async transitionToLoggedIn(): Promise<void> {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);

    try {
      this.setState(DashboardState.LOGGED_IN);

      // Get user principal and update UI
      const iiPrincipal = await this.authManager.getPrincipal();
      const principalText = iiPrincipal.toText();
      setLoggedInState(principalText, () => this.handleLogout());

      // Initialize dashboard components
      const canisterIdPrincipal = await canisterId();
      await this.initializeManagers(canisterIdPrincipal, iiPrincipal);
    } catch (error) {
      console.error('Failed to transition to logged in state:', error);
      this.transitionToLoggedOut();
    }
  }

  private transitionToLoggedOut() {
    // await this.authManager?.logout();
    this.setState(DashboardState.LOGGED_OUT);
    this.clearManagers();
    setLoggedOutState(() => this.handleLogin());
  }

  private setState(newState: DashboardState): void {
    console.log(
      `Dashboard state transition: ${this.currentState} -> ${newState}`
    );
    this.currentState = newState;
  }

  private async initializeManagers(
    canisterIdPrincipal: Principal,
    iiPrincipal: Principal
  ): Promise<void> {
    try {
      showLoading();

      const [
        topup,
        topUpRule,
        status,
        controllers,
        alternativeOrigins,
        canisterLogs,
      ] = await Promise.all([
        TopupManager.create(),
        TopUpRuleManager.create(),
        StatusManager.create(),
        ControllersManager.create(canisterIdPrincipal, iiPrincipal),
        AlternativeOriginsManager.create(),
        CanisterLogsManager.create(),
      ]);

      this.managers.topup = topup;
      this.managers.topUpRule = topUpRule;
      this.managers.status = status;
      this.managers.controllers = controllers;
      this.managers.alternativeOrigins = alternativeOrigins;
      this.managers.canisterLogs = canisterLogs;
    } finally {
      hideLoading();
    }
  }

  private clearManagers(): void {
    this.managers.topup = null;
    this.managers.topUpRule = null;
    this.managers.status = null;
    this.managers.controllers = null;
    this.managers.alternativeOrigins = null;
    this.managers.canisterLogs = null;
  }

  private async handleLogin(): Promise<void> {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);

    // Prevent multiple simultaneous login attempts
    if (this.currentState === DashboardState.LOGGING_IN) {
      return;
    }

    try {
      // Always start from a clean II state when the Login button is clicked.
      // This guarantees the II popup will appear (no stale authenticated-but-unauthorized session).
      await this.authManager.logout().catch(() => undefined);

      this.setState(DashboardState.LOGGING_IN);
      showLoading();

      // Clear any previous errors
      clearErrors();

      await this.authManager.login();
      // Only proceed if we're actually authenticated and authorized
      if (await this.authManager.isAuthenticated()) {
        await this.transitionToLoggedIn();
      } else {
        this.transitionToLoggedOut();
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.setState(DashboardState.ERROR);
      // Error message is already shown by AuthManager.login()
      // Just transition back to logged out state
      this.transitionToLoggedOut();
    } finally {
      hideLoading();
    }
  }

  private async handleLogout(): Promise<void> {
    if (!this.authManager)
      return reportError(AUTH_MANAGER_NOT_INITIALIZED_MESSAGE);

    try {
      showLoading();
      clearErrors();

      await this.authManager.logout();
      this.transitionToLoggedOut();
    } catch (error) {
      console.error('Logout failed:', error);
      showError(LOGOUT_FAILED_MESSAGE);
    } finally {
      hideLoading();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Dashboard();
});
