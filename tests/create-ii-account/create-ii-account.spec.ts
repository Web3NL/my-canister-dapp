import { test } from '@playwright/test';
import { saveTestData, getDfxEnv } from '../helpers';

const identityProvider = getDfxEnv('VITE_IDENTITY_PROVIDER');

test.describe.only('create ii account', () => {

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

    if (!userNumber) {
      throw new Error('User number not found in data-usernumber attribute');
    }

    // Save ii anchor to disk
    saveTestData('ii-anchor.txt', userNumber);
  });

});