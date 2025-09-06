import { html, render } from 'lit-html';
import { createActor } from '$declarations/index.js';
import { createCyclesChecker } from './cyclesChecker';
import { authManager } from './auth';
import { getCanisterId } from './utils';
import { showError, clearAllNotifications } from './errorHandler';
import logo from './logo2.svg';

interface EventListenerInfo {
  element: Element;
  event: string;
  handler: EventListenerOrEventListenerObject;
}

export default class App {
  private greeting = '';
  private isAuthenticated = false;
  private isAuthorized = false;
  private principal = '';
  private eventListeners: EventListenerInfo[] = [];

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    this.isAuthenticated = await authManager.init();
    this.principal = authManager.getPrincipalText();

    if (this.isAuthenticated) {
      this.isAuthorized = await authManager.checkAuthorization();
      if (!this.isAuthorized) {
        showError('You are not authorized to access this application');
        await authManager.logout();
        this.isAuthenticated = false;
        this.isAuthorized = false;
        this.principal = '';
      }
    }

    this.render();

    if (this.isAuthenticated && this.isAuthorized) {
      await this.checkCycles();
    }
  }

  private async checkCycles(): Promise<void> {
    try {
      const agent = authManager.getAgent();
      if (agent) {
        const cyclesChecker = createCyclesChecker();
        await cyclesChecker.checkAndWarn(agent);
      }
    } catch {
      showError('Failed to check cycles');
    }
  }

  private handleLogin = async (): Promise<void> => {
    try {
      this.isAuthenticated = await authManager.login();
      this.principal = authManager.getPrincipalText();

      if (this.isAuthenticated) {
        this.isAuthorized = await authManager.checkAuthorization();
        if (!this.isAuthorized) {
          showError('You are not authorized to access this application');
          await authManager.logout();
          this.isAuthenticated = false;
          this.isAuthorized = false;
          this.principal = '';
        }
      }

      this.render();

      if (this.isAuthenticated && this.isAuthorized) {
        await this.checkCycles();
      }
    } catch {
      showError('Login failed');
    }
  };

  private handleLogout = async (): Promise<void> => {
    await authManager.logout();
    this.isAuthenticated = false;
    this.isAuthorized = false;
    this.principal = '';
    this.greeting = '';
    this.clearAllNotifications();
    this.render();
  };

  private handleOpenDashboard = (): void => {
    // Same link as used in cyclesChecker.ts
    window.open('/canister-dashboard', '_blank', 'noopener,noreferrer');
  };

  private handleSubmit = async (e: Event): Promise<void> => {
    e.preventDefault();

    if (!this.isAuthenticated || !this.isAuthorized) {
      showError('Please login with Internet Identity first');
      return;
    }

    const nameInput = document.getElementById('name') as HTMLInputElement;
    const name = nameInput.value;

    try {
      // Get canister ID using our utility function
      const canisterId = await getCanisterId();
      const agent = authManager.getAgent();
      if (!agent) {
        throw new Error('No authenticated agent available');
      }

      const my_hello_world_backend = createActor(canisterId, { agent });

      this.greeting = (await my_hello_world_backend.greet(name)) as string;
      this.render();
    } catch (error) {
      showError('Failed to call backend service. Please try again.');

      console.error('Backend call failed:', error);
    }
  };

  private clearAllNotifications(): void {
    clearAllNotifications();
  }

  private removeEventListeners(): void {
    // Remove existing event listeners to prevent memory leaks
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  private addEventListener(
    element: Element,
    event: string,
    handler: EventListenerOrEventListenerObject
  ): void {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  private render(): void {
    const body = html`
      <main>
        <img src="${logo}" alt="DFINITY logo" />
        <br />

        ${this.isAuthenticated && this.isAuthorized
          ? html`
              <div>
                <button type="button" class="open-dashboard-btn">
                  Goto Canister Dashboard
                </button>
              </div>
              <br />
            `
          : ''}

        <div class="auth-section">
          ${this.isAuthenticated
            ? html`
                <div class="user-info">
                  <p><strong>Logged in as:</strong></p>
                  <p class="principal">${this.principal}</p>
                  <button class="logout-btn">Logout</button>
                </div>
              `
            : html`
                <button class="login-btn">Login with Internet Identity</button>
              `}
        </div>

        ${this.isAuthenticated && this.isAuthorized
          ? html`
              <form action="#">
                <label for="name">Enter your name: &nbsp;</label>
                <input id="name" alt="Name" type="text" />
                <button type="submit">Click Me!</button>
              </form>
              <section id="greeting">${this.greeting}</section>
            `
          : ''}
      </main>
    `;

    const rootElement = document.getElementById('root');
    if (rootElement) {
      render(body, rootElement);
    }

    // Clean up existing event listeners before adding new ones
    this.removeEventListeners();

    // Add event listeners
    const form = document.querySelector('form');
    if (form) {
      this.addEventListener(form, 'submit', this.handleSubmit);
    }

    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      this.addEventListener(loginBtn, 'click', this.handleLogin);
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      this.addEventListener(logoutBtn, 'click', this.handleLogout);
    }

    const openDashboardBtn = document.querySelector('.open-dashboard-btn');
    if (openDashboardBtn) {
      this.addEventListener(
        openDashboardBtn,
        'click',
        this.handleOpenDashboard
      );
    }
  }
}
