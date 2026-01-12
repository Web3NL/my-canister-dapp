// DOM Abstraction Layer
// Provides type-safe DOM manipulation utilities following canister-dashboard-frontend patterns

import { GENERIC_ERROR_MESSAGE } from './constants';

// Never throw on missing elements; log and return a detached placeholder so UI keeps working.
export function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    console.error(`Element with id '${id}' not found`);
    return document.createElement('div') as unknown as T;
  }
  return element;
}

export function setText(id: string, text: string): void {
  const element = getElement(id);
  element.textContent = text;
}

export function toggleVisibility(id: string, show: boolean): void {
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
  handler: (e?: Event) => void | Promise<void>
): void {
  const element = getElement(id);

  // Remove an existing listener for this element/event pair (if any)
  const existingMap = listenersRegistry.get(element);
  const existingListener = existingMap?.get(event);
  if (existingListener) {
    element.removeEventListener(event, existingListener);
  }

  // Wrap provided handler to unify signature and error handling
  const wrapped: EventListener = async (e: Event): Promise<void> => {
    try {
      await handler(e);
    } catch (err) {
      console.error(`Unhandled error in '${event}' handler for #${id}:`, err);
      showError(GENERIC_ERROR_MESSAGE);
    }
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

// Form Input Helpers

export function getInputValue(id: string): string {
  const input = getElement<HTMLInputElement>(id);
  return input.value.trim();
}

// Loading Overlay

export function showLoading(): void {
  toggleVisibility('loading-overlay', true);
}

export function hideLoading(): void {
  toggleVisibility('loading-overlay', false);
}

// Error/Warning Notifications

export function showError(message: string): void {
  createNotification(message, 'error');
}

export function showWarning(message: string): void {
  createNotification(message, 'warning');
}

export function clearAllNotifications(): void {
  const notifications = document.querySelectorAll(
    '.error-notification, .warning-notification'
  );
  notifications.forEach(n => n.remove());
}

function createNotification(message: string, type: 'error' | 'warning'): void {
  // Remove any existing notifications of the same type
  const existing = document.querySelectorAll(`.${type}-notification`);
  existing.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `${type}-notification`;

  const messageSpan = document.createElement('span');
  messageSpan.innerHTML = message;
  notification.appendChild(messageSpan);

  // Add close button
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'notification-close-btn';
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  notification.appendChild(closeBtn);

  document.body.appendChild(notification);
}
