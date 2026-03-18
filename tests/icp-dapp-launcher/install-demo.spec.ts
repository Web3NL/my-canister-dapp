import { test, expect } from '@playwright/test';
import {
  icpDappLauncherUrl,
  loadTestEnv,
  saveTestData,
  readTestData,
} from '../helpers.js';
import { handleIIPopup } from '../ii-helpers.js';

// Load test environment variables
loadTestEnv();

test('Demo Install E2E Suite', async ({ page }) => {
  // 0. Read pre-generated access code from file (written by 04-deploy.sh)
  const accessCode = readTestData('demo-access-code');
  expect(accessCode).toBeTruthy();
  expect(accessCode).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);

  const appUrl = icpDappLauncherUrl();
  await page.goto(`${appUrl}/launch`);

  // 1. Login with II
  await page
    .getByRole('button', { name: 'My Dapps', exact: true })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'My Dapps', exact: true }).click();

  const loginPopupPromise = page.waitForEvent('popup');
  await page
    .getByRole('button', { name: 'Connect with Internet Identity' })
    .waitFor({ state: 'visible' });
  await page
    .getByRole('button', { name: 'Connect with Internet Identity' })
    .click();
  const loginPopup = await loginPopupPromise;
  await handleIIPopup(loginPopup);

  // 2. Go to dapp store, select my-hello-world, click Install
  await page
    .getByRole('link')
    .filter({ hasText: 'Install a Dapp +' })
    .waitFor({ state: 'visible' });
  await page.getByRole('link').filter({ hasText: 'Install a Dapp +' }).click();

  const helloWorldCard = page
    .getByRole('article')
    .filter({ hasText: 'my-hello-world' });
  await helloWorldCard
    .getByRole('button', { name: 'Install' })
    .waitFor({ state: 'visible' });
  await helloWorldCard.getByRole('button', { name: 'Install' }).click();

  // 3. Accept terms and disclaimer
  await page.locator('[data-tid="checkbox"]').waitFor({ state: 'visible' });
  await page.locator('[data-tid="checkbox"]').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // 4. Click "Enter code" to switch to access code mode
  await page
    .getByRole('button', { name: 'Enter code' })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Enter code' }).click();

  // 5. Enter the pre-generated access code
  const codeInput = page.locator('.code-input');
  await codeInput.waitFor({ state: 'visible' });
  await codeInput.fill(accessCode);

  // 6. Click "Validate & Continue"
  await page
    .getByRole('button', { name: 'Validate & Continue' })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Validate & Continue' }).click();

  // 7. Wait for demo creation to complete and step 4 to become active
  await page
    .getByRole('button', { name: 'Connect II to Dapp' })
    .waitFor({ state: 'visible', timeout: 60000 });

  // 8. Connect II (second popup)
  await page.getByRole('button', { name: 'Connect II to Dapp' }).click();

  const iiPopupPromise = page.waitForEvent('popup');
  const iiPopup = await iiPopupPromise;
  await handleIIPopup(iiPopup);

  // 9. Navigate to My Dapps
  await page
    .getByRole('menuitem', { name: 'My Dapps' })
    .waitFor({ state: 'visible' });
  await page.getByRole('menuitem', { name: 'My Dapps' }).click();

  // 10. Verify demo appears in ActiveDemosList
  await page
    .locator('h2')
    .filter({ hasText: 'Demo Dapps' })
    .waitFor({ state: 'visible', timeout: 30000 });

  const demoCard = page.locator('.demo-grid').locator('article').first();
  await demoCard.waitFor({ state: 'visible' });
  await expect(demoCard).toContainText('my-hello-world');

  // Verify expiration info is shown
  await expect(demoCard.locator('.demo-expiry')).toContainText('remaining');

  // 11. Save the demo canister ID for potential downstream tests
  const canisterIdText = await demoCard
    .locator('.demo-canister-id')
    .textContent();
  if (canisterIdText) {
    saveTestData('demo-canister-id', canisterIdText.trim());
  }
});
