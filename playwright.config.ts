import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { installedHelloWorldExampleCanisterDashboardUrl } from './tests/helpers';

// Load dfx environment variables from .env.development
dotenv.config({ path: '.env.development' });

export default defineConfig({
  testDir: './tests',
  use: {
    ...devices['Desktop Chrome'],
    headless: false
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
      name: 'canister-dashboard-frontend-dfx',
      testMatch: /.*canister-dashboard-frontend.*\.spec\.ts/,
      metadata: {
        testUrl: installedHelloWorldExampleCanisterDashboardUrl(),
        principalFile: 'derived-ii-principal-dfx.txt'
      }
    },
    {
      name: 'canister-dashboard-frontend-mainnet',
      testMatch: /.*canister-dashboard-frontend.*\.spec\.ts/,
      metadata: {
        testUrl: 'http://qqz4n-iqaaa-aaaap-qp75q-cai.icp0.io/canister-dashboard',
        mainNet: true,
      }
    },
    {
      name: 'my-hello-world-frontend-dfx',
      testMatch: /.*my-hello-world-frontend.*\.spec\.ts/,
    },
    {
      name: 'my-canister-app-dfx',
      testMatch: /.*my-canister-app.*\.spec\.ts/,
    },
    {
      name: 'create-ii-account',
      testMatch: /.*create-ii-account.*\.spec\.ts/,
    },
    {
      name: 'derive-ii-principal',
      testMatch: /.*derive-ii-principal.*\.spec\.ts/,
    },
  ],
  webServer: process.env.DASHBOARD_VITE_SERVER ? {
    command: 'npm run dev:dashboard',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 5000,
  } : undefined
});
