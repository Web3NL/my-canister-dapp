import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';
import {
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

  await checkPrincipal(page);

  // Ensure alternative origins list has loaded (previous sections earlier in the test used to create an implicit wait)
  await page.waitForSelector('#alternative-origins-list');
  await expect(async () => {
    const items = await page.locator('#alternative-origins-list li').allTextContents();
    const realItems = items.filter(t => t.trim() && !/loading/i.test(t));
    expect(realItems.length).toBeGreaterThan(0);
  }).toPass({ timeout: 10000 });

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


});
