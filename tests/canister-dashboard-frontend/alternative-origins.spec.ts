import { test, expect } from '@playwright/test';
import { login } from './login';
import {
  TEST_ORIGINS,
  waitForListUpdate,
  waitForInputToClear,
  setupConsoleErrorMonitoring,
} from './shared';

test('manage alternative HTTP origins', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  const getConsoleErrors = setupConsoleErrorMonitoring(page);

  await page.goto(testUrl);
  await login(page);

  await page.waitForSelector('#alternative-origins-list');
  await expect(async () => {
    const items = await page
      .locator('#alternative-origins-list li')
      .allTextContents();
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
  expect(getConsoleErrors()).toEqual([]);
});

test('reject invalid origin (http without localhost)', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  const getConsoleErrors = setupConsoleErrorMonitoring(page);

  await page.goto(testUrl);
  await login(page);

  await page.waitForSelector('#alternative-origins-list');
  await expect(async () => {
    const items = await page
      .locator('#alternative-origins-list li')
      .allTextContents();
    const realItems = items.filter(t => t.trim() && !/loading/i.test(t));
    expect(realItems.length).toBeGreaterThan(0);
  }).toPass({ timeout: 10000 });

  // Capture origins before the invalid attempt
  const originsBefore = await page
    .locator('#alternative-origins-list li .data-display')
    .allTextContents();

  const invalidOrigin = 'http://example.com';
  await page.fill('#alternative-origin-input', invalidOrigin);
  await page.click('#alternative-origin-add');

  // Error section should become visible
  const errorSection = page.locator('#error-section');
  await expect(errorSection).toBeVisible({ timeout: 10000 });
  const errorMessages = await errorSection.locator('.error-message').allTextContents();
  expect(errorMessages.length).toBeGreaterThan(0);
  console.log(`Error displayed: ${errorMessages.join('; ')}`);

  // Origins list should not have changed
  const originsAfter = await page
    .locator('#alternative-origins-list li .data-display')
    .allTextContents();
  expect(originsAfter.map(t => t.trim())).toEqual(originsBefore.map(t => t.trim()));

  console.log('Invalid origin rejection test completed successfully');

  // Allow the expected console error from the invalid origin attempt
  const errors = getConsoleErrors().filter(e => !/origin/i.test(e) && !/alternative/i.test(e));
  expect(errors).toEqual([]);
});
