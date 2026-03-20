import './styles.css';
import { AuthClient } from '@icp-sdk/auth/client';
import { HttpAgent } from '@icp-sdk/core/agent';
import { createActor } from '$declarations/index.js';
import { MyCanisterDashboard } from '@web3nl/my-canister-dashboard';
import {
  inferCanisterId,
  inferEnvironment,
  isDevMode,
} from '@web3nl/vite-plugin-canister-dapp/runtime';

// DOM helpers
const $ = (id: string) => document.getElementById(id)!;
const show = (id: string) => $(id).classList.remove('hidden');
const hide = (id: string) => $(id).classList.add('hidden');

// State
let authClient: AuthClient;
let agent: HttpAgent | null = null;

function showNotification(message: string, type: 'error' | 'warning'): void {
  document.querySelectorAll(`.${type}-notification`).forEach(n => n.remove());
  const el = document.createElement('div');
  el.className = `${type}-notification`;
  const span = document.createElement('span');
  span.innerHTML = message;
  el.appendChild(span);
  const close = document.createElement('button');
  close.innerHTML = '&times;';
  close.className = 'notification-close-btn';
  close.addEventListener('click', () => el.remove());
  el.appendChild(close);
  document.body.appendChild(el);
}

function clearNotifications(): void {
  document
    .querySelectorAll('.error-notification, .warning-notification')
    .forEach(n => n.remove());
}

function showLoading(): void {
  show('loading-overlay');
}

function hideLoading(): void {
  hide('loading-overlay');
}

async function setupAgent(): Promise<void> {
  const identity = authClient.getIdentity();
  const config = inferEnvironment();
  agent = await HttpAgent.create({
    identity,
    host: config.host,
    fetch: fetch.bind(globalThis),
    shouldFetchRootKey: isDevMode(),
  });
}

async function checkAuthorization(): Promise<boolean> {
  if (!agent) return false;
  try {
    const canisterId = inferCanisterId();
    const dashboard = MyCanisterDashboard.create(agent, canisterId);
    return await dashboard.isAuthenticated();
  } catch {
    return false;
  }
}

async function checkCycles(): Promise<void> {
  if (!agent) return;
  try {
    const canisterId = inferCanisterId();
    const dashboard = MyCanisterDashboard.create(agent, canisterId);
    const result = await dashboard.checkCyclesBalance();
    if ('error' in result && result.error.includes('Low cycles warning')) {
      const match = result.error.match(/(\d+) cycles remaining/);
      const cycles = match?.[1] ? BigInt(match[1]) : 0n;
      const formatted = `${(Number(cycles) / 1_000_000_000_000).toFixed(2)}T`;
      showNotification(
        `Low cycles: ${formatted} remaining<br><br><a href="/canister-dashboard">Goto dashboard to top-up</a>`,
        'warning'
      );
    }
  } catch {
    showNotification('Failed to check cycles balance', 'error');
  }
}

function setLoggedIn(): void {
  const principal = authClient.getIdentity().getPrincipal().toString();
  hide('auth-logged-out');
  show('auth-logged-in');
  $('principal').textContent = principal;
  show('dashboard-section');
  show('greeting-section');
}

function setLoggedOut(): void {
  show('auth-logged-out');
  hide('auth-logged-in');
  $('principal').textContent = '';
  hide('dashboard-section');
  hide('greeting-section');
  hide('greeting');
}

async function handleLogin(): Promise<void> {
  showLoading();
  try {
    const config = inferEnvironment();
    await new Promise<void>((resolve, reject) => {
      authClient.login({
        identityProvider: config.identityProvider,
        onSuccess: () => resolve(),
        onError: (err?: string) => reject(err),
      });
    });
    await setupAgent();
    if (!(await checkAuthorization())) {
      showNotification(
        'You are not authorized to access this application',
        'error'
      );
      await authClient.logout();
      setLoggedOut();
      return;
    }
    setLoggedIn();
    await checkCycles();
  } catch {
    showNotification('Login failed. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

async function handleLogout(): Promise<void> {
  showLoading();
  try {
    await authClient.logout();
    agent = null;
    clearNotifications();
    setLoggedOut();
  } finally {
    hideLoading();
  }
}

async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const name = ($('name') as HTMLInputElement).value.trim();
  if (!name) return;
  showLoading();
  try {
    const canisterId = inferCanisterId();
    const backend = createActor(canisterId, { agent: agent! });
    const greeting = (await backend.greet(name)) as string;
    $('greeting').textContent = greeting;
    show('greeting');
  } catch (error) {
    showNotification(
      'Failed to call backend service. Please try again.',
      'error'
    );
    console.error('Backend call failed:', error);
  } finally {
    hideLoading();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  authClient = await AuthClient.create({
    idleOptions: { disableIdle: true },
  });

  if (await authClient.isAuthenticated()) {
    await setupAgent();
    if (await checkAuthorization()) {
      setLoggedIn();
      await checkCycles();
    } else {
      showNotification(
        'You are not authorized to access this application',
        'error'
      );
      await authClient.logout();
      setLoggedOut();
    }
  } else {
    setLoggedOut();
  }

  $('login-btn').addEventListener('click', () => void handleLogin());
  $('logout-btn').addEventListener('click', () => void handleLogout());
  $('greeting-form').addEventListener('submit', e => void handleSubmit(e));
});
