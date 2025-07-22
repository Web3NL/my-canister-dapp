/* eslint-disable no-console */
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
  
  // Helper functions for content-based waiting using locators
  const waitForBalanceUpdate = async (expectedBalance: string) => {
    const balanceLocator = page.locator('#balance-value');
    await expect(balanceLocator).not.toHaveText(/Loading\.\.\./);
    await expect(balanceLocator).toContainText(expectedBalance);
  };

  const waitForListUpdate = async (listSelector: string, expectedItem: string, shouldContain: boolean = true) => {
    const listLocator = page.locator(listSelector);
    await expect(listLocator).not.toHaveText(/Loading\.\.\./);
    if (shouldContain) {
      await expect(listLocator).toContainText(expectedItem);
    } else {
      await expect(listLocator).not.toContainText(expectedItem);
    }
  };

  const waitForCyclesBalanceChange = async (beforeBalance: string, timeoutMs: number = 15000) => {
    const cyclesLocator = page.locator('.status-info p:has-text("Cycles:")');
    await expect(async () => {
      const cyclesText = await cyclesLocator.textContent();
      const currentBalance = cyclesText?.replace('Cycles: ', '').trim();
      expect(currentBalance).not.toBe(beforeBalance);
    }).toPass({ timeout: timeoutMs });
  };

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

  // Calculate expected balance using same formatting as frontend
  const expectedBalance = formatIcpBalance(TOPUP_AMOUNT);

  // Wait for balance to be updated with the expected amount
  await waitForBalanceUpdate(expectedBalance);

  // Verify the balance is displayed correctly
  const balanceText = await page.textContent('#balance-value');
  expect(balanceText).toContain(expectedBalance);

  // Wait for cycles balance to be loaded before recording the "before" value
  const cyclesElement = page.locator('.status-info p:has-text("Cycles:")');
  await cyclesElement.waitFor({ timeout: 10000 });
  await expect(cyclesElement).not.toHaveText(/Loading\.\.\./);
  const cyclesTextBefore = await cyclesElement.textContent();
  const cyclesBalanceBefore = cyclesTextBefore?.replace('Cycles: ', '').trim();
  console.log(`Recorded cycles balance before top-up: ${cyclesBalanceBefore}`);

  await page.getByRole('button', { name: 'Top-up' }).click();

  // Wait for cycles element to be ready (indicating top-up completed)
  const cyclesLocator = page.locator('.status-info p:has-text("Cycles:")');
  await expect(cyclesLocator).not.toHaveText(/Loading\.\.\./);
  
  // Give minimal time for UI to stabilize after top-up
  await page.waitForLoadState('networkidle');

  // Wait for cycles balance to change with retry logic to handle varying retrieval times
  await waitForCyclesBalanceChange(cyclesBalanceBefore || '');
  
  // Log the final cycles balance for debugging
  const cyclesTextAfter = await cyclesElement.textContent();
  const cyclesBalanceAfter = cyclesTextAfter?.replace('Cycles: ', '').trim();
  console.log(`Recorded cycles balance after top-up: ${cyclesBalanceAfter}`);
  console.log('Top-up successfully completed - cycles balance has changed');

  // Test controller management functionality
  console.log('Testing controller addition...');

  // Wait for network idle and give extra time for canister status to load
  // await page.waitForLoadState('networkidle');
  // await page.waitForTimeout(500);

  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-add');

  // Wait for controller to appear in the list
  await waitForListUpdate('#controllers-list', TEST_CONTROLLER, true);

  // Verify the controller appears in the list
  const controllersListAfterAdd = await page.textContent('#controllers-list');
  expect(controllersListAfterAdd).toContain(TEST_CONTROLLER);
  console.log('Controller successfully added to the list');

  // Verify input is cleared
  const inputValueAfterAdd = await page.inputValue('#controller-input');
  expect(inputValueAfterAdd).toBe('');

  // Test removing the controller
  console.log('Testing controller removal...');
  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-remove');

  // Wait for controller to be removed from the list
  await waitForListUpdate('#controllers-list', TEST_CONTROLLER, false);

  // Verify the controller is no longer in the list
  const controllersListAfterRemove = await page.textContent('#controllers-list');
  expect(controllersListAfterRemove).not.toContain(TEST_CONTROLLER);
  console.log('Controller successfully removed from the list');

  // Verify input is cleared
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

    // Wait for origin to appear in the list
    await waitForListUpdate('#alternative-origins-list', origin, true);

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

    // Wait for origin to be removed from the list
    await waitForListUpdate('#alternative-origins-list', origin, false);

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
