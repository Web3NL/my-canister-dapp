import { html, render } from 'lit-html';
import { createActor } from 'declarations/index.js';
import { createCyclesChecker } from './cyclesChecker.js';
import { authManager } from './auth.js';
import { getCanisterId } from './utils.js';
import { showError, showWarning } from './errorHandler.js';
import logo from './logo2.svg';

class App {
  greeting = '';
  isAuthenticated = false;
  principal = '';

  constructor() {
    this.#init();
  }

  async #init() {
    this.isAuthenticated = await authManager.init();
    this.principal = authManager.getPrincipalText();
    this.#render();
    
    if (this.isAuthenticated) {
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
    } catch (error) {
      showError('Failed to check cycles');
    }
  }

  #handleLogin = async () => {
    try {
      this.isAuthenticated = await authManager.login();
      this.principal = authManager.getPrincipalText();
      this.#render();
      
      if (this.isAuthenticated) {
        await this.#checkCycles();
      }
    } catch (error) {
      showError('Login failed');
    }
  };

  #handleLogout = async () => {
    await authManager.logout();
    this.isAuthenticated = false;
    this.principal = '';
    this.greeting = '';
    this.#render();
  };


  #handleSubmit = async e => {
    e.preventDefault();
    
    if (!this.isAuthenticated) {
      showError('Please login with Internet Identity first');
      return;
    }

    const name = document.getElementById('name').value;

    // Get canister ID using our utility function
    const canisterId = getCanisterId();
    const agent = authManager.getAgent();
    const my_hello_world_backend = createActor(canisterId, { agent });

    this.greeting = await my_hello_world_backend.greet(name);
    this.#render();
  };

  #render() {
    const body = html`
      <main>
        <img src="${logo}" alt="DFINITY logo" />
        <br />
        <br />
        
        <div class="auth-section">
          ${this.isAuthenticated ? html`
            <div class="user-info">
              <p><strong>Logged in as:</strong></p>
              <p class="principal">${this.principal}</p>
              <button class="logout-btn">Logout</button>
            </div>
          ` : html`
            <button class="login-btn">Login with Internet Identity</button>
          `}
        </div>
        
        ${this.isAuthenticated ? html`
          <br />
          
          <form action="#">
            <label for="name">Enter your name: &nbsp;</label>
            <input id="name" alt="Name" type="text" />
            <button type="submit">Click Me!</button>
          </form>
          <section id="greeting">${this.greeting}</section>
        ` : ''}
      </main>
    `;
    render(body, document.getElementById('root'));
    
    // Add event listeners
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', this.#handleSubmit);
    }
    
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', this.#handleLogin);
    }
    
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.#handleLogout);
    }
    
  }
}

export default App;
