// eslint-disable @typescript-eslint/no-console
import { test, expect } from '@playwright/test';
import { readTestData, transferToPrincipal } from '../helpers';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import { Principal } from '@dfinity/principal';

test('Canister Dashboard Frontend Suite', async ({ page }) => {
  test.setTimeout(60000); // 1 minute timeout
  const TOPUP_AMOUNT = BigInt(100_000_000);
  const TEST_CONTROLLER = 'rkp4c-7iaaa-aaaaa-aaaca-cai';
  const TEST_ORIGINS = [
    'http://localhost:9999',
    'https://22ajg-aqaaa-aaaap-adukq-cai.icp0.io',
    'https://my-canister.app',
  ];
  // Read the saved ii anchor from the previous test
  const iiAnchor = readTestData('ii-anchor.txt');

  await page.goto('http://localhost:5173/canister-dashboard');

  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'Login' }).click();
  const page1 = await page1Promise;

  await page1.getByRole('button', { name: 'Use existing' }).click();
  await page1.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
  await page1.getByRole('button', { name: 'Continue', exact: true }).click();
  await page1.getByRole('button', { name: 'Remind me later' }).click();

  // Wait for the top-up button to appear
  await page.waitForSelector('#top-up-btn', { timeout: 10000 });

  // Read the saved principal and transfer funds
  const principalText = readTestData('ii-principal.txt');
  const principal = Principal.fromText(principalText);
  const formattedAmount = formatIcpBalance(TOPUP_AMOUNT);
  await transferToPrincipal(principal, formattedAmount);

  // Click refresh button to update balance
  await page.getByRole('button', { name: 'Refresh' }).click();

  // Wait for loading overlay to appear (refresh started)
  await page.waitForSelector('#loading-overlay', {
    state: 'visible',
    timeout: 10000,
  });

  // Wait for loading overlay to disappear (refresh finished)
  await page.waitForSelector('#loading-overlay', {
    state: 'hidden',
    timeout: 10000,
  });

  // Calculate expected balance using same formatting as frontend
  const expectedBalance = formatIcpBalance(TOPUP_AMOUNT);

  // Check the balance - refresh is complete when loading overlay is hidden
  const balanceText = await page.textContent('#balance-value');
  expect(balanceText).toContain(expectedBalance);

  // Record the cycles balance value after the pause
  const cyclesElement = page.locator('.status-info p:has-text("Cycles:")');
  await cyclesElement.waitFor({ timeout: 10000 });
  const cyclesText = await cyclesElement.textContent();
  const cyclesBalance = cyclesText?.replace('Cycles: ', '').trim();
  console.log(`Recorded cycles balance: ${cyclesBalance}`);

  await page.getByRole('button', { name: 'Top-up' }).click();

  // Wait for loading overlay to become visible
  await page.waitForSelector('#loading-overlay', {
    state: 'visible',
    timeout: 10000,
  });

  // Wait for loading overlay to disappear
  await page.waitForSelector('#loading-overlay', {
    state: 'hidden',
    timeout: 30000,
  });

  // Give extra time for the direct UI updates to complete after top-up
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // TODO: Check that the cycles balance has changed after top-up

  // Test controller management functionality
  console.log('Testing controller addition...');

  // Wait for network idle and give extra time for canister status to load
  // await page.waitForLoadState('networkidle');
  // await page.waitForTimeout(500);

  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-add');

  // Wait for loading overlay to appear and disappear
  await page.waitForSelector('#loading-overlay', {
    state: 'visible',
    timeout: 10000,
  });
  await page.waitForSelector('#loading-overlay', {
    state: 'hidden',
    timeout: 10000,
  });

  // Check that the controller appears in the list
  const controllersListAfterAdd = await page.textContent('#controllers-list');
  expect(controllersListAfterAdd).toContain(TEST_CONTROLLER);
  console.log('Controller successfully added to the list');

  // Check that input is cleared
  const inputValueAfterAdd = await page.inputValue('#controller-input');
  expect(inputValueAfterAdd).toBe('');

  // Test removing the controller
  console.log('Testing controller removal...');
  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-remove');

  // Wait for loading overlay to appear and disappear
  await page.waitForSelector('#loading-overlay', {
    state: 'visible',
    timeout: 10000,
  });
  await page.waitForSelector('#loading-overlay', {
    state: 'hidden',
    timeout: 10000,
  });

  // Check that the controller is no longer in the list
  const controllersListAfterRemove =
    await page.textContent('#controllers-list');
  expect(controllersListAfterRemove).not.toContain(TEST_CONTROLLER);
  console.log('Controller successfully removed from the list');

  // Check that input is cleared
  const inputValueAfterRemove = await page.inputValue('#controller-input');
  expect(inputValueAfterRemove).toBe('');

  console.log('Controller management tests completed successfully');

  // Test alternative origins management functionality
  console.log('Testing alternative origins management...');

  // Test adding each origin
  for (const origin of TEST_ORIGINS) {
    console.log(`Adding origin: ${origin}`);
    await page.fill('#alternative-origin-input', origin);
    await page.click('#alternative-origin-add');

    // Wait for loading overlay to appear and disappear
    await page.waitForSelector('#loading-overlay', {
      state: 'visible',
      timeout: 10000,
    });
    await page.waitForSelector('#loading-overlay', {
      state: 'hidden',
      timeout: 10000,
    });

    // Verify origin was added
    const listItems = await page
      .locator('#alternative-origins-list li')
      .allTextContents();
    expect(listItems).toContain(origin);
    console.log(
      `Origin ${origin} successfully added to the list. Current list: ${listItems.join(', ')}`
    );

    // Verify input is cleared
    const inputValue = await page.inputValue('#alternative-origin-input');
    expect(inputValue).toBe('');
  }

  // Test removing each origin
  for (const origin of TEST_ORIGINS) {
    console.log(`Removing origin: ${origin}`);
    await page.fill('#alternative-origin-input', origin);
    await page.click('#alternative-origin-remove');

    // Wait for loading overlay to appear and disappear
    await page.waitForSelector('#loading-overlay', {
      state: 'visible',
      timeout: 10000,
    });
    await page.waitForSelector('#loading-overlay', {
      state: 'hidden',
      timeout: 10000,
    });

    // Verify origin was removed
    const listItems = await page
      .locator('#alternative-origins-list li')
      .allTextContents();
    console.log(`Current origins list: ${listItems.join(', ')}`);
    expect(listItems).not.toContain(origin);
    console.log(`Origin ${origin} successfully removed from the list`);

    // Verify input is cleared
    const inputValue = await page.inputValue('#alternative-origin-input');
    expect(inputValue).toBe('');
  }

  console.log('Alternative origins management tests completed successfully');

  // await page.pause();
});
