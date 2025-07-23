import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load global environment variables from .env.development
dotenv.config({ path: '.env.development' });

export default defineConfig({
  testDir: './tests',
  use: {
    ...devices['Desktop Chrome'],
    // headless: false
  },
  projects: [
    {
      name: 'setup-internet-identity',
      testMatch: /.*internet-identity-setup.*\.spec\.ts/,
    },
    {
      name: 'canister-dashboard-frontend',
      testMatch: /.*canister-dashboard-frontend.*\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:5173',
      },
    },
    {
      name: 'my-canister-app',
      testMatch: /.*my-canister-app.*\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: 'npm run dev:dashboard',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 5000,
    },
    {
      command: 'npm run dev:dashboard',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 5000,
    },
    // {
    //   command: 'npm run dev:app',
    //   url: 'http://localhost:5174',
    //   reuseExistingServer: true,
    //   timeout: 5000,
    // },
  ],
});
