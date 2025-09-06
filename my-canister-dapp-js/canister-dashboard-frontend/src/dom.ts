// DOM Abstraction Layer with UI Logic

// DOM Utility Functions
export function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    throw new Error(`Element with id '${id}' not found`);
  }
  return element;
}

function setText(id: string, text: string): void {
  const element = getElement(id);
  element.textContent = text;
}

function toggleVisibility(id: string, show: boolean): void {
  const element = getElement(id);
  if (show) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

// Keep a registry of listeners we attach so we can avoid stacking duplicates
const listenersRegistry = new WeakMap<
  HTMLElement,
  Map<string, EventListener>
>();

export function addEventListener(
  id: string,
  event: string,
  handler: () => void | Promise<void>
): void {
  const element = getElement(id);

  // Remove an existing listener for this element/event pair (if any)
  const existingMap = listenersRegistry.get(element);
  const existingListener = existingMap?.get(event);
  if (existingListener) {
    element.removeEventListener(event, existingListener);
  }

  // Wrap provided handler to unify signature and error handling
  const wrapped: EventListener = async (): Promise<void> => {
    await handler();
  };

  element.addEventListener(event, wrapped);

  // Record the new listener so it can be replaced next time
  const map =
    listenersRegistry.get(element) ?? new Map<string, EventListener>();
  map.set(event, wrapped);
  if (!listenersRegistry.has(element)) {
    listenersRegistry.set(element, map);
  }
}

// UI State Management Methods

export function setLoggedInState(
  principalText: string,
  onLogout: () => void | Promise<void>
): void {
  const authBtn = getElement('auth-btn');

  authBtn.textContent = 'Logout';
  authBtn.onclick = async (): Promise<void> => {
    try {
      await onLogout();
    } catch {
      showError('Logout failed. Please try again.');
    }
  };

  toggleVisibility('ii-principal', true);
  toggleVisibility('ii-principal-label', true);
  setText('ii-principal', principalText);
  toggleVisibility('authenticated-content', true);
}

export function setLoggedOutState(onLogin: () => void | Promise<void>): void {
  const authBtn = getElement('auth-btn');

  authBtn.textContent = 'Login';
  authBtn.onclick = async (): Promise<void> => await onLogin();

  toggleVisibility('ii-principal', false);
  toggleVisibility('ii-principal-label', false);
  setText('ii-principal', '');
  toggleVisibility('authenticated-content', false);
  toggleVisibility('loading-overlay', false);
}

export function updateStatusDisplay(
  statusText: string,
  memorySizeFormatted: string,
  cyclesFormatted: string,
  moduleHashHex: string
): void {
  setText('status-value', statusText);
  setText('memory-size-value', memorySizeFormatted);
  setText('cycles-value', cyclesFormatted);
  setText('module-hash-value', moduleHashHex);
}

export function updateBalanceDisplay(formattedBalance: string): void {
  setText('balance-value', formattedBalance);
}

export function updateIcrc1AccountDisplay(principalText: string): void {
  setText('icrc1-account', principalText);
}

export function showLoading(): void {
  toggleVisibility('loading-overlay', true);
}

export function hideLoading(): void {
  toggleVisibility('loading-overlay', false);
}

export function showError(message: string): void {
  const errorSection = getElement('error-section');

  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;

  errorSection.appendChild(errorMessage);
  toggleVisibility('error-section', true);
}

export function clearErrors(): void {
  const errorSection = getElement('error-section');
  errorSection.innerHTML = '';
  toggleVisibility('error-section', false);
}

// Form Input Helpers

export function getInputValue(id: string): string {
  const input = getElement<HTMLInputElement>(id);
  return input.value.trim();
}

export function clearInput(id: string): void {
  const input = getElement<HTMLInputElement>(id);
  input.value = '';
}

// List Management Helpers

// Extended Helpers (component-specific abstractions)

// Update the displayed canister id and its ICP balance
export function updateCanisterInfo(
  canisterId: string,
  icpBalance: string
): void {
  const idEl = getElement('canister-id');
  idEl.textContent = canisterId;
  const balEl = getElement('canister-icp-balance');
  balEl.textContent = icpBalance;
}

// Update the Top Up Rule section. Pass null when no rule is set.
export function updateTopUpRuleDisplay(formattedRule: string | null): void {
  const container = getElement('top-up-rule-display');
  container.textContent = '';
  if (!formattedRule) {
    container.textContent = 'No rule set';
    return;
  }
  const pre = document.createElement('pre');
  pre.textContent = formattedRule;
  container.appendChild(pre);
}

// Retrieve value from a <select> element
export function getSelectValue(id: string): string {
  const select = getElement<HTMLSelectElement>(id);
  return select.value;
}
