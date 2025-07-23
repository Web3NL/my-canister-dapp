/* eslint-disable no-console */
import { test, expect } from '@playwright/test';
import { myCanisterAppDfxUrl, loadDfxEnv } from '../helpers';

// Load global dfx environment variables
loadDfxEnv();

test('My Canister App E2E Suite', async ({ page }) => {
    test.setTimeout(60000); // 1 minute timeout

    // Get the dfx URL for my-canister-app
    const appUrl = myCanisterAppDfxUrl();
    await page.goto(appUrl);

    // Basic page load verification
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });

    console.log('Successfully navigated to my-canister-app');
});