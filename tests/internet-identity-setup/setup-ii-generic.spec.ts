import { test } from '@playwright/test';
import { saveTestData, readTestData, loadDfxEnv, getDfxEnv } from '../helpers';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

loadDfxEnv();

const identityProvider = getDfxEnv('VITE_IDENTITY_PROVIDER');
const dappOrigin = process.env.DAPP_ORIGIN ?? 'https://nonexistent-domain-for-testing.com';

test.describe('generic internet identity setup', () => {
  test('should authenticate with II on any domain', async ({ page }) => {
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
    const bundlePath = resolve(__dirname, 'dist', 'ii-auth-bundle.iife.js');
    const bundleScript = readFileSync(bundlePath, 'utf8');

    await page.addScriptTag({ content: bundleScript });

    // Wait for the auth button to be created
    await page.waitForSelector('[data-tid="ii-auth-btn"]');

    // Start auth flow
    const authPromise = page.evaluate(async ({ identityProvider }) => {
      return window.IIAuthBundle.performAuth(identityProvider);
    }, { identityProvider });

    // Click the auth button to trigger login
    await page.click('[data-tid="ii-auth-btn"]');

    // Handle the II popup
    const popup = await page.waitForEvent('popup');
    await popup.getByRole('button', { name: 'Use existing' }).click();
    await popup.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
    await popup.getByRole('button', { name: 'Continue', exact: true }).click();
    await popup.getByRole('button', { name: 'Remind me later' }).click();

    // Wait for auth to complete
    const principalText = await authPromise;

    // Save the principal
    saveTestData('ii-principal-generic.txt', principalText);
    console.log('Saved generic II principal:', principalText);
  });
});