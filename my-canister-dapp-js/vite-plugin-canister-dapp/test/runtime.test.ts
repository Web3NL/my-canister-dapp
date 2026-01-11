/**
 * @file test/runtime.test.ts
 *
 * Tests for the runtime module that provides browser-side utilities
 * for detecting dev/prod mode and inferring canister IDs from URLs.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Principal } from '@icp-sdk/core/principal';
import { mockLocation, mockGlobals, clearGlobals } from './helpers.js';

describe('runtime', () => {
  beforeEach(() => {
    vi.resetModules();
    clearGlobals();
  });

  afterEach(() => {
    clearGlobals();
  });

  describe('isDevMode', () => {
    it('should return true for http:// protocol', async () => {
      mockLocation('http:', 'example.com', 'http://example.com');

      const { isDevMode } = await import('../src/runtime.js');
      expect(isDevMode()).toBe(true);
    });

    it('should return true for localhost hostname', async () => {
      mockLocation('https:', 'localhost', 'https://localhost');

      const { isDevMode } = await import('../src/runtime.js');
      expect(isDevMode()).toBe(true);
    });

    it('should return true for 127.0.0.1 hostname', async () => {
      mockLocation('https:', '127.0.0.1', 'https://127.0.0.1');

      const { isDevMode } = await import('../src/runtime.js');
      expect(isDevMode()).toBe(true);
    });

    it('should return false for https:// with production hostname', async () => {
      mockLocation(
        'https:',
        'abc-xyz.icp0.io',
        'https://abc-xyz.icp0.io'
      );

      const { isDevMode } = await import('../src/runtime.js');
      expect(isDevMode()).toBe(false);
    });

    it('should cache the result', async () => {
      mockLocation('http:', 'localhost', 'http://localhost');

      const { isDevMode } = await import('../src/runtime.js');
      expect(isDevMode()).toBe(true);

      // Change location - should still return cached value
      mockLocation('https:', 'prod.com', 'https://prod.com');
      expect(isDevMode()).toBe(true);
    });
  });

  describe('inferEnvironment', () => {
    it('should return dev config when in dev mode', async () => {
      mockLocation('http:', 'localhost', 'http://localhost');
      const devConfig = { host: 'http://test:8080', identityProvider: 'http://ii.test' };
      const prodConfig = { host: 'https://prod.io', identityProvider: 'https://ii.prod' };
      mockGlobals({ devConfig, prodConfig });

      const { inferEnvironment } = await import('../src/runtime.js');
      const result = inferEnvironment();

      expect(result).toEqual(devConfig);
    });

    it('should return prod config when in prod mode', async () => {
      mockLocation('https:', 'app.icp0.io', 'https://app.icp0.io');
      const devConfig = { host: 'http://test:8080', identityProvider: 'http://ii.test' };
      const prodConfig = { host: 'https://prod.io', identityProvider: 'https://ii.prod' };
      mockGlobals({ devConfig, prodConfig });

      const { inferEnvironment } = await import('../src/runtime.js');
      const result = inferEnvironment();

      expect(result).toEqual(prodConfig);
    });

    it('should use default dev config when global not defined', async () => {
      mockLocation('http:', 'localhost', 'http://localhost');

      const { inferEnvironment } = await import('../src/runtime.js');
      const result = inferEnvironment();

      expect(result).toEqual({
        host: 'http://localhost:8080',
        identityProvider: 'http://uxrrr-q7777-77774-qaaaq-cai.localhost:8080',
      });
    });

    it('should use default prod config when global not defined', async () => {
      mockLocation('https:', 'app.icp0.io', 'https://app.icp0.io');

      const { inferEnvironment } = await import('../src/runtime.js');
      const result = inferEnvironment();

      expect(result).toEqual({
        host: 'https://icp-api.io',
        identityProvider: 'https://identity.internetcomputer.org',
      });
    });

    it('should cache the result', async () => {
      mockLocation('http:', 'localhost', 'http://localhost');
      const devConfig = { host: 'http://cached:8080', identityProvider: 'http://ii.cached' };
      mockGlobals({ devConfig });

      const { inferEnvironment } = await import('../src/runtime.js');
      const result1 = inferEnvironment();

      // Change globals and location
      mockGlobals({ devConfig: { host: 'http://new', identityProvider: 'http://new' } });
      mockLocation('https:', 'prod.io', 'https://prod.io');

      const result2 = inferEnvironment();
      expect(result2).toEqual(result1);
    });
  });

  describe('inferCanisterId', () => {
    const TEST_PRINCIPAL = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

    it('should infer canister ID from localhost URL', async () => {
      mockLocation('http:', `${TEST_PRINCIPAL}.localhost`);

      const { inferCanisterId } = await import('../src/runtime.js');
      const result = inferCanisterId();

      expect(result).toBeInstanceOf(Principal);
      expect(result.toString()).toBe(TEST_PRINCIPAL);
    });

    it('should infer canister ID from icp0.io URL', async () => {
      mockLocation('https:', `${TEST_PRINCIPAL}.icp0.io`);

      const { inferCanisterId } = await import('../src/runtime.js');
      const result = inferCanisterId();

      expect(result).toBeInstanceOf(Principal);
      expect(result.toString()).toBe(TEST_PRINCIPAL);
    });

    it('should fall back to viteDevCanisterId when URL inference fails', async () => {
      mockLocation('http:', 'localhost:5173');
      mockGlobals({ viteDevCanisterId: TEST_PRINCIPAL });

      const { inferCanisterId } = await import('../src/runtime.js');
      const result = inferCanisterId();

      expect(result).toBeInstanceOf(Principal);
      expect(result.toString()).toBe(TEST_PRINCIPAL);
    });

    it('should throw error when URL inference fails and no fallback', async () => {
      mockLocation('http:', 'localhost:5173');
      mockGlobals({ viteDevCanisterId: null });

      const { inferCanisterId } = await import('../src/runtime.js');

      expect(() => inferCanisterId()).toThrow(
        'Could not infer canister ID from URL. When using Vite dev server, set viteDevCanisterId in plugin config.'
      );
    });

    it('should throw error when viteDevCanisterId is undefined', async () => {
      mockLocation('http:', 'localhost:5173');

      const { inferCanisterId } = await import('../src/runtime.js');

      expect(() => inferCanisterId()).toThrow();
    });
  });
});
