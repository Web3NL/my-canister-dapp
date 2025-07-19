import { html, render } from 'lit-html';
import { createActor } from 'declarations/index.js';
import { createCyclesChecker } from './cyclesChecker.js';
import { authManager } from './auth.js';
import { getCanisterId } from './utils.js';
import { showError, clearAllNotifications } from './errorHandler.js';
import logo from './logo2.svg';

class App {
  greeting = '';
  isAuthenticated = false;
  isAuthorized = false;
  principal = '';
  eventListeners = [];

  constructor() {
    this.#init();
  }

  async #init() {
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

    this.#render();

    if (this.isAuthenticated && this.isAuthorized) {
      await this.#checkCycles();
    }
  }

  async #checkCycles() {
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

  #handleLogin = async () => {
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

      this.#render();

      if (this.isAuthenticated && this.isAuthorized) {
        await this.#checkCycles();
      }
    } catch {
      showError('Login failed');
    }
  };

  #handleLogout = async () => {
    await authManager.logout();
    this.isAuthenticated = false;
    this.isAuthorized = false;
    this.principal = '';
    this.greeting = '';
    this.#clearAllNotifications();
    this.#render();
  };

  #handleSubmit = async e => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    e.preventDefault();

    if (!this.isAuthenticated || !this.isAuthorized) {
      showError('Please login with Internet Identity first');
      return;
    }

    const name = document.getElementById('name').value;

    try {
      // Get canister ID using our utility function
      const canisterId = getCanisterId();
      const agent = authManager.getAgent();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const my_hello_world_backend = createActor(canisterId, { agent });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.greeting = await my_hello_world_backend.greet(name);
      this.#render();
    } catch (error) {
      showError('Failed to call backend service. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Backend call failed:', error);
    }
  };

  #clearAllNotifications() {
    clearAllNotifications();
  }

  #removeEventListeners() {
    // Remove existing event listeners to prevent memory leaks
    this.eventListeners.forEach(({ element, event, handler }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }

  #addEventListener(element, event, handler) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  #render() {
    const body = html`
      <main>
        <img src="${logo}" alt="DFINITY logo" />
        <br />

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
              <br />

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
    render(body, document.getElementById('root'));

    // Clean up existing event listeners before adding new ones
    this.#removeEventListeners();

    // Add event listeners
    const form = document.querySelector('form');
    if (form) {
      this.#addEventListener(form, 'submit', this.#handleSubmit);
    }

    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      this.#addEventListener(loginBtn, 'click', this.#handleLogin);
    }

    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      this.#addEventListener(logoutBtn, 'click', this.#handleLogout);
    }
  }
}

export default App;
