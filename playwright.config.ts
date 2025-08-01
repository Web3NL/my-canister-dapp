import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load dfx environment variables from .env.development
dotenv.config({ path: '.env.development' });

export default defineConfig({
  testDir: './tests',
  use: {
    ...devices['Desktop Chrome'],
    // headless: false
  },
  projects: [
    {
      name: 'canister-dashboard-frontend',
      testMatch: /.*canister-dashboard-frontend.*\.spec\.ts/,
    },
    {
      name: 'my-canister-app',
      testMatch: /.*my-canister-app.*\.spec\.ts/,
    },
    {
      name: 'derive-ii-principal',
      testMatch: /.*derive-ii-principal.*\.spec\.ts/,
    },
  ],
  webServer:
  {
    command: 'npm run dev:dashboard',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 5000,
  }
});
