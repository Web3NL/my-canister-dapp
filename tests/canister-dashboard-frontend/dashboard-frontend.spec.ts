import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import { performTopUp } from './topUp';
import {
  TOPUP_AMOUNT_MAINNET,
  TOPUP_AMOUNT_LOCAL,
  TEST_CONTROLLER,
  TEST_ORIGINS,
  waitForListUpdate,
  waitForInputToClear,
} from './shared';

test('Canister Dashboard Frontend Suite', async ({ page }, testInfo) => {
  test.setTimeout(60000); // 1 minute timeout
  // Constants imported from shared.ts

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

  // Helper functions imported from shared.ts

  await page.goto(testUrl);

  if (isMainNet) {
    // In mainnet, pause for manual login
    await page.pause();
  } else {
    // Automated login for testnet using helper
    await login(page);
  }

  const principal = await checkPrincipal(page);
  const topupAmount = isMainNet ? TOPUP_AMOUNT_MAINNET : TOPUP_AMOUNT_LOCAL;
  const formattedAmount = formatIcpBalance(topupAmount);
  await performTopUp({ page, isMainNet, principal, formattedAmount });

  // Test controller management functionality
  console.log('Testing controller addition...');

  // Wait for network idle and give extra time for canister status to load
  // await page.waitForLoadState('networkidle');
  // await page.waitForTimeout(500);

  await page.fill('#controller-input', TEST_CONTROLLER);
  await page.click('#controller-add');

  // Wait for controller to appear in the list
  await waitForListUpdate(page, '#controllers-list', TEST_CONTROLLER, true);

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
  await waitForListUpdate(page, '#controllers-list', TEST_CONTROLLER, false);

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
  await waitForListUpdate(page, '#alternative-origins-list', origin, true);

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
  await waitForInputToClear(page, '#alternative-origin-input');

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
  await waitForListUpdate(page, '#alternative-origins-list', origin, false);

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
  await waitForInputToClear(page, '#alternative-origin-input');
  }

  console.log('Alternative origins management tests completed successfully');

  // Top-up rule management tests
  console.log('Testing top-up rule management...');
  // Ensure section loaded
  await expect(page.locator('#top-up-rule-display')).not.toHaveText(/Loading/);

  // Set selections (pick smallest values for speed/determinism)
  await page.selectOption('#top-up-rule-interval', 'Hourly');
  await page.selectOption('#top-up-rule-threshold', '_0_25T');
  await page.selectOption('#top-up-rule-amount', '_0_5T');

  // Set rule
  await page.click('#top-up-rule-set');

  // Expect rule display to show the exact formatted rule
  const ruleDisplay = page.locator('#top-up-rule-display');
  const expectedRule = 'Interval: Hourly\nThreshold: 0.25T cycles\nAmount: 0.5T cycles';
  await expect(async () => {
    const txt = (await ruleDisplay.textContent())?.trim();
    expect(txt).toBe(expectedRule);
  }).toPass({ timeout: 10000 });
  console.log('Top-up rule set and displayed');

  // Clear rule
  await page.click('#top-up-rule-clear');
  await expect(ruleDisplay).toHaveText(/No rule set/, { timeout: 10000 });
  console.log('Top-up rule cleared');

  // Refresh logs and look for evidence of actions (either set or cleared messages)
  await page.click('#refresh-logs-btn');
  const logsList = page.locator('#logs-list');
  await expect(logsList.locator('li').first()).not.toHaveText(/Loading/);

  // Retry search for one of the log substrings
  await expect(async () => {
    const logTexts = await logsList.locator('li').allTextContents();
    const found = logTexts.some(t => /top-up: rule (set|cleared)/.test(t));
    expect(found).toBeTruthy();
  }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
  console.log('Found top-up rule action in logs');
});
