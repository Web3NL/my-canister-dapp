import { test } from '@playwright/test';
import { saveTestData, getTestEnv } from '../helpers.js';
import { handleIIPopup } from '../ii-helpers.js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const identityProvider = getTestEnv('VITE_IDENTITY_PROVIDER');

const __dirname = dirname(fileURLToPath(import.meta.url));

test.describe('setup II identity and derive principals', () => {
  test(
    'derive principals for each origin via dummy auth',
    async ({ page }) => {
      test.setTimeout(120000);

      // Read the bundled auth script
      const bundlePath = resolve(__dirname, 'derive-ii-principal.iife.js');
      const bundleScript = readFileSync(bundlePath, 'utf8');

      // For each origin, derive the principal
      const origins = [
        { origin: process.env.DAPP_ORIGIN_VITE!, envSuffix: 'vite' },
        { origin: process.env.DAPP_ORIGIN_CANISTER!, envSuffix: 'canister' },
        { origin: process.env.DAPP_ORIGIN_APP!, envSuffix: 'app' },
      ];

      for (const { origin, envSuffix } of origins) {
        // Route origin to a minimal HTML page
        await page.route(`${origin}/**`, (route) => {
          route.fulfill({
            status: 200,
            contentType: 'text/html',
            body: '<html><head><title>Auth Test</title></head><body></body></html>',
          });
        });

        await page.goto(origin);

        // Inject the bundled auth script
        await page.addScriptTag({ content: bundleScript });

        // Call setup to pre-create AuthClient and create the login button
        await page.evaluate(
          (ip) => window.DeriveIIPrincipal.setup(ip),
          identityProvider
        );

        // Wait for the login button to appear
        await page.waitForSelector('[data-tid="login-button"]');

        // Set up popup listener before clicking the login button
        const popupPromise = page.waitForEvent('popup', { timeout: 15000 });

        // Click the login button which calls client.login() → opens II popup
        await page.click('[data-tid="login-button"]');

        // Wait for the II popup to open and handle the auth flow
        const popup = await popupPromise;
        console.log(`II popup opened for ${envSuffix}: ${popup.url()}`);

        await handleIIPopup(popup);

        // Wait for popup to close
        await popup.waitForEvent('close', { timeout: 15000 });
        console.log('II popup closed');

        // Wait for the principal to be set by the auth callback
        await page.waitForFunction(
          () => {
            const el = document.getElementById('principal');
            return el && el.textContent && el.textContent.length > 10;
          },
          { timeout: 15000 }
        );

        const principal = await page.locator('#principal').textContent();

        if (!principal || principal.startsWith('ERROR:')) {
          throw new Error(
            `Failed to derive principal for ${envSuffix}: ${principal}`
          );
        }

        console.log(`Derived principal for ${envSuffix}: ${principal}`);
        saveTestData(`derived-ii-principal-${envSuffix}.txt`, principal);

        await page.unrouteAll();
      }
    }
  );
});
