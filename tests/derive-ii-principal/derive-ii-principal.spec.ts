import { test } from '@playwright/test';
import { saveTestData, readTestData, getDfxEnv } from '../helpers';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const identityProvider = getDfxEnv('VITE_IDENTITY_PROVIDER');

test.describe.only('derive ii principal', () => {

  test.only('should create new internet identity account', async ({ page }) => {
    await page.goto(identityProvider);

    await page
      .getByRole('button', { name: 'Create Internet Identity' })
      .click();
    await page.getByRole('button', { name: 'Create Passkey' }).click();

    await page
      .getByRole('textbox', { name: 'Type the characters you see' })
      .fill('a');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'I saved it, continue' }).click();

    // Extract the user number from the output element
    const userNumber = await page.getAttribute(
      '#userNumber',
      'data-usernumber'
    );

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!userNumber) {
      throw new Error('User number not found in data-usernumber attribute');
    }

    // Save ii anchor to disk
    saveTestData('ii-anchor.txt', userNumber);
  });

  test.only('should derive principal from II at any domain', async ({ page }) => {
    const dappOrigin = process.env.DAPP_ORIGIN;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!dappOrigin) {
      throw new Error('DAPP_ORIGIN environment variable is required');
    }

    const iiAnchor = readTestData('ii-anchor.txt');

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

    await page.waitForSelector('[data-tid="derive-ii-auth-btn"]', {
      state: 'visible',
    });

    // Set up popup listener before clicking
    const popupPromise = page.waitForEvent('popup', { timeout: 10000 });
    await page.click('[data-tid="derive-ii-auth-btn"]');

    // Handle the II popup
    const popup = await popupPromise;
    await popup.getByRole('button', { name: 'Use existing' }).click();
    await popup.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
    await popup.getByRole('button', { name: 'Continue', exact: true }).click();
    await popup.getByRole('button', { name: 'Remind me later' }).click();

    // Wait for auth to complete
    const principalText = await authPromise;

    // Save the principal
    saveTestData('derived-ii-principal.txt', principalText);
  });
});