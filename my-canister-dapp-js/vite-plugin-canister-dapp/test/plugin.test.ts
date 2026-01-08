/**
 * @file test/plugin.test.ts
 *
 * Tests for the canisterDappEnvironmentConfig Vite plugin.
 * Verifies config injection, proxy setup, and environment configuration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserConfig } from 'vite';
import { canisterDappEnvironmentConfig } from '../src/plugin.js';
import { callConfigHook } from './helpers.js';

describe('canisterDappEnvironmentConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('config merging', () => {
    it('should use default configs when no config provided', () => {
      const plugin = canisterDappEnvironmentConfig();
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'production');

      expect(viteConfig.define?.__CANISTER_DAPP_DEV_CONFIG__).toBe(
        JSON.stringify({
          host: 'http://localhost:8080',
          identityProvider: 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080',
        })
      );
      expect(viteConfig.define?.__CANISTER_DAPP_PROD_CONFIG__).toBe(
        JSON.stringify({
          host: 'https://icp-api.io',
          identityProvider: 'https://identity.internetcomputer.org',
        })
      );
    });

    it('should merge custom dev config with defaults', () => {
      const plugin = canisterDappEnvironmentConfig({
        environment: {
          development: {
            host: 'http://custom:4943',
            identityProvider: 'http://ii.custom:4943',
          },
        },
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'production');

      expect(viteConfig.define?.__CANISTER_DAPP_DEV_CONFIG__).toBe(
        JSON.stringify({
          host: 'http://custom:4943',
          identityProvider: 'http://ii.custom:4943',
        })
      );
    });

    it('should merge custom prod config with defaults', () => {
      const plugin = canisterDappEnvironmentConfig({
        environment: {
          production: {
            host: 'https://custom-api.io',
            identityProvider: 'https://custom-ii.io',
          },
        },
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'production');

      expect(viteConfig.define?.__CANISTER_DAPP_PROD_CONFIG__).toBe(
        JSON.stringify({
          host: 'https://custom-api.io',
          identityProvider: 'https://custom-ii.io',
        })
      );
    });

    it('should inject viteDevCanisterId as global', () => {
      const plugin = canisterDappEnvironmentConfig({
        viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'production');

      expect(viteConfig.define?.__VITE_DEV_CANISTER_ID__).toBe(
        JSON.stringify('rrkah-fqaaa-aaaaa-aaaaq-cai')
      );
    });

    it('should inject null for viteDevCanisterId when not provided', () => {
      const plugin = canisterDappEnvironmentConfig();
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'production');

      expect(viteConfig.define?.__VITE_DEV_CANISTER_ID__).toBe(
        JSON.stringify(null)
      );
    });
  });

  describe('proxy configuration', () => {
    it('should set up /api proxy in development mode', () => {
      const plugin = canisterDappEnvironmentConfig();
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/api']).toEqual({
        target: 'http://localhost:8080',
        changeOrigin: true,
      });
    });

    it('should not set up proxy in production mode', () => {
      const plugin = canisterDappEnvironmentConfig();
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'production');

      expect(viteConfig.server?.proxy).toBeUndefined();
    });

    it('should set up canister-specific proxies when viteDevCanisterId is provided', () => {
      const canisterId = 'rrkah-fqaaa-aaaaa-aaaaq-cai';
      const plugin = canisterDappEnvironmentConfig({
        viteDevCanisterId: canisterId,
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/canister-dashboard']).toBeDefined();
      expect(
        viteConfig.server?.proxy?.['/.well-known/ii-alternative-origins']
      ).toBeDefined();

      // Test the rewrite function for /canister-dashboard
      const dashboardProxy = viteConfig.server?.proxy?.['/canister-dashboard'];
      if (
        dashboardProxy &&
        typeof dashboardProxy === 'object' &&
        'rewrite' in dashboardProxy
      ) {
        const rewriteFn = dashboardProxy.rewrite as (path: string) => string;
        expect(rewriteFn('/canister-dashboard')).toBe(
          `/canister-dashboard?canisterId=${canisterId}`
        );
      }

      // Test the rewrite function for /.well-known/ii-alternative-origins
      const altOriginsProxy =
        viteConfig.server?.proxy?.['/.well-known/ii-alternative-origins'];
      if (
        altOriginsProxy &&
        typeof altOriginsProxy === 'object' &&
        'rewrite' in altOriginsProxy
      ) {
        const rewriteFn = altOriginsProxy.rewrite as (path: string) => string;
        expect(rewriteFn('/.well-known/ii-alternative-origins')).toBe(
          `/.well-known/ii-alternative-origins?canisterId=${canisterId}`
        );
      }
    });

    it('should skip canister-specific proxies when viteDevCanisterId is not provided', () => {
      const consoleSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const plugin = canisterDappEnvironmentConfig();
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/canister-dashboard']).toBeUndefined();
      expect(
        viteConfig.server?.proxy?.['/.well-known/ii-alternative-origins']
      ).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('viteDevCanisterId is undefined')
      );

      consoleSpy.mockRestore();
    });

    it('should not overwrite existing proxy configurations', () => {
      const consoleSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});
      const plugin = canisterDappEnvironmentConfig({
        viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
      });
      const existingProxy = { target: 'http://existing', changeOrigin: true };
      const viteConfig: UserConfig = {
        server: {
          proxy: {
            '/api': existingProxy,
          },
        },
      };

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/api']).toBe(existingProxy);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Existing proxy configurations found')
      );

      consoleSpy.mockRestore();
    });

    it('should respect serverProxies.api = false', () => {
      const plugin = canisterDappEnvironmentConfig({
        serverProxies: { api: false },
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/api']).toBeUndefined();
    });

    it('should respect serverProxies.canisterDashboard = false', () => {
      const plugin = canisterDappEnvironmentConfig({
        viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        serverProxies: { canisterDashboard: false },
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/canister-dashboard']).toBeUndefined();
      // ii-alternative-origins should still be set
      expect(
        viteConfig.server?.proxy?.['/.well-known/ii-alternative-origins']
      ).toBeDefined();
    });

    it('should respect serverProxies.iiAlternativeOrigins = false', () => {
      const plugin = canisterDappEnvironmentConfig({
        viteDevCanisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai',
        serverProxies: { iiAlternativeOrigins: false },
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(
        viteConfig.server?.proxy?.['/.well-known/ii-alternative-origins']
      ).toBeUndefined();
      // canister-dashboard should still be set
      expect(viteConfig.server?.proxy?.['/canister-dashboard']).toBeDefined();
    });

    it('should use custom host for proxy target', () => {
      const plugin = canisterDappEnvironmentConfig({
        environment: {
          development: {
            host: 'http://custom:4943',
            identityProvider: 'http://ii.custom:4943',
          },
        },
      });
      const viteConfig: UserConfig = {};

      callConfigHook(plugin, viteConfig, 'development');

      expect(viteConfig.server?.proxy?.['/api']).toEqual({
        target: 'http://custom:4943',
        changeOrigin: true,
      });
    });
  });

  describe('plugin metadata', () => {
    it('should have correct plugin name', () => {
      const plugin = canisterDappEnvironmentConfig();
      expect(plugin.name).toBe('canister-dapp-environment-config');
    });
  });
});
