/* eslint-disable no-console */
import { test } from '@playwright/test';
import { saveTestData, readTestData, loadDfxEnv, getDfxEnv } from '../helpers';
import { Principal } from '@dfinity/principal';

loadDfxEnv();

const identityProvider = getDfxEnv('VITE_IDENTITY_PROVIDER');

test.describe.only('setup internet identity', () => {
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
    console.log('Saved user number:', userNumber);
  });

  test.only('should login and obtain ii principal at vite dev server host', async ({
    page,
  }) => {
    // Read the saved ii anchor from the previous test
    const iiAnchor = readTestData('ii-anchor.txt');

    await page.goto('http://localhost:5173/canister-dashboard');
    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Login' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: 'Use existing' }).click();
    await page1
      .getByRole('textbox', { name: 'Identity Anchor' })
      .fill(iiAnchor);
    await page1.getByRole('button', { name: 'Continue', exact: true }).click();
    await page1.getByRole('button', { name: 'Remind me later' }).click();

    // Wait for navigation back to main page and extract value
    await page.waitForLoadState('networkidle');

    // Wait for the principal element to appear
    await page.waitForSelector('#ii-principal', { timeout: 10000 });

    // Extract and validate principal from the ii-principal element
    const principalValue = await page.evaluate(() => {
      const element = document.querySelector('#ii-principal');
      return element ? element.textContent : null;
    });

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!principalValue) {
      throw new Error('Principal value not found in #ii-principal element');
    }

    Principal.fromText(principalValue);

    // Save to disk
    saveTestData('ii-principal.txt', principalValue);
    console.log('Saved identity data:', principalValue);
  });
});
