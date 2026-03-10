import { vi, beforeEach } from 'vitest';

// Node.js 25+ ships a native localStorage that lacks .clear().
// Vitest's jsdom env exposes the jsdom instance at globalThis.jsdom but
// doesn't override the native localStorage global. Patch it here so all
// tests get jsdom's fully-functional Storage implementation.
if (typeof globalThis.localStorage?.clear !== 'function') {
  const jsdomStorage = (globalThis as Record<string, unknown>).jsdom as
    | { window: { localStorage: Storage } }
    | undefined;
  if (jsdomStorage) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: jsdomStorage.window.localStorage,
      configurable: true,
      writable: true,
    });
  }
}

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
