// DOM Abstraction Layer

import { GENERIC_ERROR_MESSAGE } from './constants';

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

export function setHtml(id: string, html: string): void {
  const element = getElement(id);
  element.innerHTML = html;
}

export function toggleVisibility(id: string, show: boolean): void {
  const element = getElement(id);
  if (show) {
    element.classList.remove('hidden');
  } else {
    element.classList.add('hidden');
  }
}

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

  const existingMap = listenersRegistry.get(element);
  const existingListener = existingMap?.get(event);
  if (existingListener) {
    element.removeEventListener(event, existingListener);
  }

  const wrapped: EventListener = async (e: Event): Promise<void> => {
    try {
      await handler(e);
    } catch (err) {
      console.error(`Unhandled error in '${event}' handler for #${id}:`, err);
      showError(GENERIC_ERROR_MESSAGE);
    }
  };

  element.addEventListener(event, wrapped);

  const map =
    listenersRegistry.get(element) ?? new Map<string, EventListener>();
  map.set(event, wrapped);
  if (!listenersRegistry.has(element)) {
    listenersRegistry.set(element, map);
  }
}

export function getInputValue(id: string): string {
  const input = getElement<HTMLInputElement>(id);
  return input.value.trim();
}

export function getTextareaValue(id: string): string {
  const textarea = getElement<HTMLTextAreaElement>(id);
  return textarea.value;
}

export function clearInput(id: string): void {
  const input = getElement<HTMLInputElement | HTMLTextAreaElement>(id);
  input.value = '';
}

export function showLoading(): void {
  toggleVisibility('loading-overlay', true);
}

export function hideLoading(): void {
  toggleVisibility('loading-overlay', false);
}

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
  const existing = document.querySelectorAll(`.${type}-notification`);
  existing.forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `${type}-notification`;

  const messageSpan = document.createElement('span');
  messageSpan.innerHTML = message;
  notification.appendChild(messageSpan);

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'notification-close-btn';
  closeBtn.addEventListener('click', () => {
    notification.remove();
  });
  notification.appendChild(closeBtn);

  document.body.appendChild(notification);
}
