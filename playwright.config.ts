import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { installedHelloWorldExampleCanisterDashboardUrl } from './tests/helpers.js';

// Load test environment variables from tests/test.env
dotenv.config({ path: './tests/test.env' });

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    // headless: false,
    launchOptions: {
      // On Ubuntu, Chromium's built-in DNS resolver does not resolve *.localhost
      // subdomains. Explicitly map them to 127.0.0.1 so local PocketIC canisters
      // (e.g. <canister-id>.localhost:8080) and the II canister are reachable.
      // macOS resolves *.localhost natively; this rule is a no-op there.
      args: ['--host-resolver-rules=MAP *.localhost 127.0.0.1'],
    },
  },
  projects: [
    {
      name: 'canister-dashboard-frontend-vite',
      testMatch: /.*canister-dashboard-frontend.*\.spec\.ts/,
      metadata: {
        testUrl: 'http://localhost:5173/canister-dashboard',
        principalFile: 'derived-ii-principal-vite.txt'
      }
    },
    {
      name: 'canister-dashboard-frontend-canister',
      testMatch: /.*canister-dashboard-frontend.*\.spec\.ts/,
      metadata: {
        testUrl: installedHelloWorldExampleCanisterDashboardUrl(),
        principalFile: 'derived-ii-principal-canister.txt'
      }
    },
    {
      name: 'my-hello-world-frontend-canister',
      testMatch: /.*my-hello-world-frontend.*\.spec\.ts/,
    },
    {
      name: 'icp-dapp-launcher-canister',
      testMatch: /.*icp-dapp-launcher.*\.spec\.ts/,
    },
  ],
  webServer: process.env.DASHBOARD_VITE_SERVER ? {
    command: 'npm run dev:dashboard',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 5000,
  } : undefined
});
