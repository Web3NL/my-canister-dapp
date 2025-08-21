import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';
import {
  TEST_CONTROLLER,
  waitForListUpdate,
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

  await checkPrincipal(page);

  // Test controller management functionality
  console.log('Testing controller addition...');

  // Ensure controllers list has loaded before interacting (was implicitly waited by removed top-up section)
  await page.waitForSelector('#controllers-list');
  // Wait until at least one list item (and not a transient Loading placeholder) is present
  await expect(async () => {
    const items = await page.locator('#controllers-list li').allTextContents();
    const realItems = items.filter(t => t.trim() && !/loading/i.test(t));
    expect(realItems.length).toBeGreaterThan(0); // list populated
  }).toPass({ timeout: 10000 });

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
});
