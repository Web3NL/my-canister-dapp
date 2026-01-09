import { test, expect } from '@playwright/test';
import {
  myCanisterAppDfxUrl,
  loadDfxEnv,
  readTestData,
  transferToPrincipal,
  saveTestData,
} from '../helpers.js';
import { Principal } from '@icp-sdk/core/principal';

// Load global dfx environment variables
loadDfxEnv();

const maintenanceMode = false;

test('My Canister App E2E Suite', async ({ page }) => {
  test.setTimeout(60000); // 1 minute timeout

  const appUrl = myCanisterAppDfxUrl();
  await page.goto(appUrl);

  // Dismiss maintenance mode overlay with Shift+M
  if (maintenanceMode) {
    await page.locator('.maintenance-overlay').waitFor({ state: 'visible' });
    await page.keyboard.press('Shift+KeyM');
    await page.locator('.maintenance-overlay').waitFor({ state: 'hidden' });
  }

  await page
    .getByRole('button', { name: 'My Dapps', exact: true })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'My Dapps', exact: true }).click();

  const page1Promise = page.waitForEvent('popup');
  await page
    .getByRole('button', { name: 'Connect with Internet Identity' })
    .waitFor({ state: 'visible' });
  await page
    .getByRole('button', { name: 'Connect with Internet Identity' })
    .click();
  const page1 = await page1Promise;
  await page1
    .getByRole('button', { name: 'Use existing' })
    .waitFor({ state: 'visible' });
  await page1.getByRole('button', { name: 'Use existing' }).click();

  const iiAnchor = readTestData('ii-anchor.txt');
  await page1.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
  await page1
    .getByRole('button', { name: 'Continue', exact: true })
    .waitFor({ state: 'visible' });
  await page1.getByRole('button', { name: 'Continue', exact: true }).click();
  await page1
    .getByRole('button', { name: 'Remind me later' })
    .waitFor({ state: 'visible' });
  await page1.getByRole('button', { name: 'Remind me later' }).click();

  // Wait for II to close and authentication to complete
  await page
    .getByRole('link')
    .filter({ hasText: 'Install a Dapp +' })
    .waitFor({ state: 'visible' });

  await page
    .getByRole('link')
    .filter({ hasText: 'Install a Dapp +' })
    .waitFor({ state: 'visible' });
  await page.getByRole('link').filter({ hasText: 'Install a Dapp +' }).click();
  await page
    .getByRole('button', { name: 'Install' })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Install' }).click();

  // Wait until minimum deposit amount (number) is loaded instead of placeholder '...'
  const depositLocator = page
    .locator('p')
    .filter({ hasText: 'Deposit' })
    .first();
  // Wait until the minimum balance number is loaded in the new text format
  await expect(depositLocator).toHaveText(/Deposit\s+at\s+least\s+\d/, {
    timeout: 30000,
  });
  const depositTextRaw = await depositLocator.textContent();

  if (!depositTextRaw) {
    throw new Error('Could not read deposit text');
  }

  // Capture number after 'at least'
  const match = depositTextRaw.match(
    /Deposit\s+at\s+least\s+([0-9]+(?:\.[0-9]+)?)\s+ICP/
  );
  if (!match) {
    throw new Error(`Unexpected deposit text format: ${depositTextRaw}`);
  }
  const TRANSFER_AMOUNT: string = match[1]!;

  // Read the principal from the page and transfer funds
  const principalText = await page
    .locator('#principal .value')
    .first()
    .textContent();

  if (!principalText) {
    throw new Error('Principal text not found on the page');
  }
  const principal = Principal.fromText(principalText.trim());
  await transferToPrincipal(principal, TRANSFER_AMOUNT);

  await page
    .getByRole('button', { name: 'Create Dapp' })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Create Dapp' }).click();

  await page
    .getByRole('button', { name: 'Connect II to Dapp' })
    .waitFor({ state: 'visible' });
  await page.getByRole('button', { name: 'Connect II to Dapp' }).click();

  const page2Promise = page.waitForEvent('popup');
  const page2 = await page2Promise;
  await page2
    .getByRole('button', { name: iiAnchor })
    .waitFor({ state: 'visible' });
  await page2.getByRole('button', { name: iiAnchor }).click();
  await page2
    .getByRole('button', { name: 'Remind me later' })
    .waitFor({ state: 'visible' });
  await page2.getByRole('button', { name: 'Remind me later' }).click();

  await page
    .getByRole('menuitem', { name: 'My Dapps' })
    .waitFor({ state: 'visible' });
  await page.getByRole('menuitem', { name: 'My Dapps' }).click();

  await page
    .locator('article[data-tid="gix-cmp-card"]')
    .filter({ hasText: 'My Hello World' })
    .first()
    .waitFor({ state: 'visible' });

  // Extract canister ID from the card
  const cardElement = page
    .locator('article[data-tid="gix-cmp-card"]')
    .filter({ hasText: 'My Hello World' })
    .first();
  const dappFrontpageLink = cardElement
    .locator('a')
    .filter({ hasText: 'Dapp frontpage' });
  const href = await dappFrontpageLink.getAttribute('href');

  if (!href) {
    throw new Error('Dapp frontpage href not found');
  }

  // Extract canister ID from URL like: http://u6s2n-gx777-77774-qaaba-cai.localhost:8080
  const url = new URL(href);
  const canisterId = url.hostname.split('.')[0];

  if (!canisterId) {
    throw new Error(`Could not extract canister ID from URL: ${href}`);
  }

  saveTestData('installed-canister-id', canisterId);
});
