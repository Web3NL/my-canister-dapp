/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { test, expect } from '@playwright/test';
import { readTestData, transferToPrincipal, transferToPrincipalMainnet } from '../helpers';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import { Principal } from '@dfinity/principal';

test('Canister Dashboard Frontend Suite', async ({ page }, testInfo) => {
  test.setTimeout(60000); // 1 minute timeout
  const TOPUP_AMOUNT_MAINNET = BigInt(1_000_000);
  const TOPUP_AMOUNT_LOCAL = BigInt(100_000_000);
  const TEST_CONTROLLER = 'rkp4c-7iaaa-aaaaa-aaaca-cai';
  const TEST_ORIGINS = [
    'http://localhost:9999',
    // 'http://22ajg-aqaaa-aaaap-adukq-cai.localhost:8080',
    // 'https://22ajg-aqaaa-aaaap-adukq-cai.icp0.io',
    // 'https://mycanister.app',
  ];

  // Get configuration from project metadata
  const testUrl = testInfo.project.metadata.testUrl;
  const isMainNet = testInfo.project.metadata.mainNet;
  const principalFile = testInfo.project.metadata.principalFile;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }
  if (!isMainNet && !principalFile) {
    throw new Error('principalFile not found in project metadata');
  }

  // Helper functions for content-based waiting using locators
  const waitForBalanceToBeAtLeast = async (minimumBalance: string) => {
    const balanceLocator = page.locator('#balance-value');
    await expect(balanceLocator).not.toHaveText(/Loading\.\.\./);

    const minNum = parseFloat(minimumBalance);
    if (isNaN(minNum)) {
      throw new Error(`Invalid minimum balance: "${minimumBalance}" - cannot parse as number`);
    }

    await expect(async () => {
      const balanceText = await balanceLocator.textContent();
      const currentNum = parseFloat(balanceText ?? '0');
      if (isNaN(currentNum)) {
        throw new Error(`Invalid current balance: "${balanceText}" - cannot parse as number`);
      }
      expect(currentNum).toBeGreaterThan(0);
      expect(currentNum).toBeGreaterThanOrEqual(minNum);
    }).toPass();
  };

  const waitForListUpdate = async (listSelector: string, expectedItem: string, shouldContain: boolean = true) => {
    const listLocator = page.locator(listSelector);

    // Wait for list to be ready (not loading)
    await expect(listLocator).not.toHaveText(/Loading\.\.\./);

    if (shouldContain) {
      // Wait for the specific item to appear in the list
      await expect(listLocator.locator('li', { hasText: expectedItem })).toBeVisible({ timeout: 10000 });
    } else {
      // Wait for the specific item to be removed from the list with retry logic
      await expect(async () => {
        const listItems = await listLocator.locator('li').allTextContents();
        expect(listItems).not.toContain(expectedItem);
      }).toPass({ timeout: 10000, intervals: [500, 1000, 2000] });
    }
  };

  const waitForCyclesBalanceIncrease = async (beforeBalance: string, timeoutMs: number = 15000) => {
    const cyclesLocator = page.locator('.status-info p:has-text("Cycles:")');

    // Parse the before balance as number or fail (format: "0.89 T")
    const beforeNum = parseFloat(beforeBalance.replace(/\s*T\s*$/i, '').trim());
    if (isNaN(beforeNum)) {
      throw new Error(`Invalid before cycles balance: "${beforeBalance}" - cannot parse as number`);
    }
    if (beforeNum <= 0) {
      throw new Error(`Initial cycles balance must be greater than 0, got: "${beforeBalance}"`);
    }

    await expect(async () => {
      const cyclesText = await cyclesLocator.textContent();
      const currentBalanceStr = cyclesText?.replace(/Cycles:\s*/g, '').trim();

      if (!currentBalanceStr) {
        throw new Error('Current cycles balance is empty');
      }

      // Parse current balance as number or fail (format: "0.89 T")
      const currentNum = parseFloat(currentBalanceStr.replace(/\s*T\s*$/i, '').trim());
      if (isNaN(currentNum)) {
        throw new Error(`Invalid current cycles balance: "${currentBalanceStr}" - cannot parse as number`);
      }

      // Test that new value is larger than old value
      expect(currentNum).toBeGreaterThan(beforeNum);
    }).toPass({ timeout: timeoutMs });
  };

  const waitForInputToClear = async (inputSelector: string, timeoutMs: number = 10000) => {
    await expect(async () => {
      const inputValue = await page.inputValue(inputSelector);
      expect(inputValue).toBe('');
    }).toPass({ timeout: timeoutMs, intervals: [100, 500, 1000] });
  };

  await page.goto(testUrl);

  if (isMainNet) {
    // In mainnet, pause for manual login
    await page.pause();
  } else {
    // Automated login for testnet
    // Read the saved ii anchor from the previous test
    const iiAnchor = readTestData('ii-anchor.txt');

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Login' }).click();
    const page1 = await page1Promise;

    await page1.getByRole('button', { name: 'Use existing' }).click();
    await page1.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
    await page1.getByRole('button', { name: 'Continue', exact: true }).click();
    await page1.getByRole('button', { name: 'Remind me later' }).click();
  }

  // Wait for the top-up button to appear and be visible
  await page.getByRole('button', { name: 'Top-up' }).waitFor({ state: 'visible', timeout: 10000 });

  // Extract principal from the page
  const iiPrincipalElement = page.locator('#ii-principal');
  await iiPrincipalElement.waitFor({ state: 'visible', timeout: 10000 });
  const principalText = await iiPrincipalElement.textContent();

  if (!principalText) {
    throw new Error('Principal not found on page');
  }

  // Validate the principal
  const principal = Principal.fromText(principalText);
  const topupAmount = isMainNet ? TOPUP_AMOUNT_MAINNET : TOPUP_AMOUNT_LOCAL;
  const formattedAmount = formatIcpBalance(topupAmount);

  // Transfer funds using appropriate method based on environment
  if (isMainNet) {
    await transferToPrincipalMainnet(principal, formattedAmount);
  } else {
    await transferToPrincipal(principal, formattedAmount);
  }

  // Click refresh button to update balance
  await page.getByRole('button', { name: 'Refresh' }).click();

  // Calculate minimum expected balance (the amount we just transferred)
  const transferAmount = formattedAmount;

  // Wait for balance to be at least the amount we transferred
  await waitForBalanceToBeAtLeast(transferAmount);

  // Log the current balance for debugging
  const balanceText = await page.textContent('#balance-value');
  console.log(`Current ICP balance after transfer: ${balanceText}`);

  // Wait for cycles balance to be loaded before recording the "before" value
  const cyclesElement = page.locator('.status-info p:has-text("Cycles:")');
  await cyclesElement.waitFor({ timeout: 10000 });
  await expect(cyclesElement).not.toHaveText(/Loading\.\.\./);
  const cyclesTextBefore = await cyclesElement.textContent();
  if (!cyclesTextBefore) {
    throw new Error('Cycles balance not found before top-up');
  }
  const cyclesBalanceBefore = cyclesTextBefore.replace(/Cycles:\s*/g, '').trim();
  console.log(`Recorded cycles balance before top-up: ${cyclesBalanceBefore}`);

  await page.getByRole('button', { name: 'Top-up' }).click();

  // Give minimal time for UI to stabilize after top-up
  await page.waitForLoadState('networkidle');

  // Wait for cycles element to be ready (indicating top-up completed)
  const cyclesLocator = page.locator('.status-info p:has-text("Cycles:")');
  await expect(cyclesLocator).not.toHaveText(/Loading\.\.\./);

  // Wait for cycles balance to increase with retry logic to handle varying retrieval times
  await waitForCyclesBalanceIncrease(cyclesBalanceBefore);

  // Log the final cycles balance for debugging
  const cyclesTextAfter = await cyclesElement.textContent();
  const cyclesBalanceAfter = cyclesTextAfter?.replace(/Cycles:\s*/g, '').trim();
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

  // Test adding and removing each origin in sequence
  for (const origin of TEST_ORIGINS) {
    // Add origin
    console.log(`Adding origin: ${origin}`);
    await page.fill('#alternative-origin-input', origin);

    // Verify the input was filled correctly
    let inputValue = await page.inputValue('#alternative-origin-input');
    expect(inputValue).toBe(origin);

    await page.click('#alternative-origin-add');

    // Wait for network idle after submit
    await page.waitForLoadState('networkidle');

    // Wait for origin to appear in the list
    await waitForListUpdate('#alternative-origins-list', origin, true);

    // Verify origin was added with retry
    await expect(async () => {
      const listItems = await page
        .locator('#alternative-origins-list li')
        .allTextContents();
      expect(listItems).toContain(origin);
      console.log(
        `Origin ${origin} successfully added to the list. Current list: ${listItems.join(', ')}`
      );
    }).toPass({ timeout: 5000 });

    // Wait for input to be cleared
    await waitForInputToClear('#alternative-origin-input');

    // Remove origin
    console.log(`Removing origin: ${origin}`);
    await page.fill('#alternative-origin-input', origin);

    // Verify the input was filled correctly
    inputValue = await page.inputValue('#alternative-origin-input');
    expect(inputValue).toBe(origin);

    await page.click('#alternative-origin-remove');

    // Wait for network idle after submit
    await page.waitForLoadState('networkidle');

    // Wait for origin to be removed from the list
    await waitForListUpdate('#alternative-origins-list', origin, false);

    // Verify origin was removed with retry
    await expect(async () => {
      const listItems = await page
        .locator('#alternative-origins-list li')
        .allTextContents();
      console.log(`Current origins list: ${listItems.join(', ')}`);
      expect(listItems).not.toContain(origin);
      console.log(`Origin ${origin} successfully removed from the list`);
    }).toPass({ timeout: 5000 });

    // Wait for input to be cleared
    await waitForInputToClear('#alternative-origin-input');
  }

  console.log('Alternative origins management tests completed successfully');
});
