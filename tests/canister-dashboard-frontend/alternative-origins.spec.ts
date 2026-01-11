import { test, expect } from '@playwright/test';
import { login } from './login';
import {
  TEST_ORIGINS,
  waitForListUpdate,
  waitForInputToClear,
} from './shared';

test('manage alternative HTTP origins', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  await page.goto(testUrl);
  await login(page);

  await page.waitForSelector('#alternative-origins-list');
  await expect(async () => {
    const items = await page.locator('#alternative-origins-list li').allTextContents();
    const realItems = items.filter(t => t.trim() && !/loading/i.test(t));
    expect(realItems.length).toBeGreaterThan(0);
  }).toPass({ timeout: 10000 });

  console.log('Testing alternative origins management...');

  for (const origin of TEST_ORIGINS) {
    console.log(`Adding origin: ${origin}`);
    await page.fill('#alternative-origin-input', origin);
    let inputValue = await page.inputValue('#alternative-origin-input');
    expect(inputValue).toBe(origin);

    await page.click('#alternative-origin-add');

    await waitForListUpdate(page, '#alternative-origins-list', origin, true);

    await expect(async () => {
      const listItems = await page
        .locator('#alternative-origins-list li .data-display')
        .allTextContents();
      const trimmedItems = listItems.map(t => t.trim());
      expect(trimmedItems).toContain(origin);
      console.log(
        `Origin ${origin} successfully added to the list. Current list: ${trimmedItems.join(', ')}`
      );
    }).toPass({ timeout: 5000 });

    await waitForInputToClear(page, '#alternative-origin-input');
    console.log(`Removing origin: ${origin}`);
    await page.fill('#alternative-origin-input', origin);
    inputValue = await page.inputValue('#alternative-origin-input');
    expect(inputValue).toBe(origin);

    await page.click('#alternative-origin-remove');

    await waitForListUpdate(page, '#alternative-origins-list', origin, false);

    await expect(async () => {
      const listItems = await page
        .locator('#alternative-origins-list li .data-display')
        .allTextContents();
      const trimmedItems = listItems.map(t => t.trim());
      console.log(`Current origins list: ${trimmedItems.join(', ')}`);
      expect(trimmedItems).not.toContain(origin);
      console.log(`Origin ${origin} successfully removed from the list`);
    }).toPass({ timeout: 5000 });

    await waitForInputToClear(page, '#alternative-origin-input');
  }

  console.log('Alternative origins management tests completed successfully');

});
