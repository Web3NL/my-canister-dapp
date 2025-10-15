import { test } from '@playwright/test';
import { saveTestData } from '../helpers.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const identityProvider = 'https://identity.internetcomputer.org';

test.describe.only('derive ii principal', () => {

  test.only('should derive principal from II at any domain', async ({ page }) => {
    const dappOrigin = process.env.DAPP_ORIGIN;
    if (!dappOrigin) {
      throw new Error('DAPP_ORIGIN environment variable is required');
    }

    // Navigate to DAPP_ORIGIN and fulfill if domain doesn't exist
    await page.route(`${dappOrigin}/**`, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><head><title>Auth Test</title></head><body><h1>Auth Test Page</h1></body></html>'
      });
    });

    await page.goto(dappOrigin);

    // Read and inject the bundled auth script
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const bundlePath = resolve(__dirname, 'derive-ii-principal.iife.js');
    const bundleScript = readFileSync(bundlePath, 'utf8');

    await page.addScriptTag({ content: bundleScript });

    // Wait for the auth button to be created
    await page.waitForSelector('[data-tid="derive-ii-auth-btn"]');

    // Start auth flow
    const authPromise = page.evaluate(async ({ identityProvider }) => {
      return window.DeriveIIPrincipal.performAuth(identityProvider);
    }, { identityProvider });

    // Perform ii auth manually
    await page.pause();

    // Wait for auth to complete
    const principalText = await authPromise;

    // Save the principal
    saveTestData('derived-ii-principal-prod.txt', principalText);

    // Dont close window to inspect results
    await page.pause();
  });
});