import { vi, beforeEach } from 'vitest';

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
