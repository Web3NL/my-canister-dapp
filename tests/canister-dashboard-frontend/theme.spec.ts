import { test, expect } from '../fixtures.js';
import { login } from './login';
import { setupConsoleErrorMonitoring } from './shared';

test('toggle light/dark theme', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  const getConsoleErrors = setupConsoleErrorMonitoring(page);

  await page.goto(testUrl);
  await login(page);

  const themeToggle = page.locator('#theme-toggle');
  await themeToggle.waitFor({ state: 'visible', timeout: 10000 });

  // Detect the initial theme so we know which direction to toggle
  const initialTheme = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );

  // Click toggle — theme should flip
  await themeToggle.click();

  const themeAfterFirstToggle = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  expect(themeAfterFirstToggle).not.toBe(initialTheme);

  // Verify the correct icon is visible after toggle
  if (themeAfterFirstToggle === 'dark') {
    await expect(page.locator('#theme-icon-sun')).toBeVisible();
    await expect(page.locator('#theme-icon-moon')).toBeHidden();
  } else {
    await expect(page.locator('#theme-icon-moon')).toBeVisible();
    await expect(page.locator('#theme-icon-sun')).toBeHidden();
  }

  // Verify localStorage was updated
  const storedTheme = await page.evaluate(() =>
    localStorage.getItem('canister-dashboard-theme')
  );
  expect(storedTheme).toBe(themeAfterFirstToggle);

  // Click again — theme should flip back
  await themeToggle.click();

  const themeAfterSecondToggle = await page.evaluate(() =>
    document.documentElement.getAttribute('data-theme')
  );
  expect(themeAfterSecondToggle).toBe(initialTheme);

  // Verify localStorage reflects the reverted theme
  const storedThemeAfterRevert = await page.evaluate(() =>
    localStorage.getItem('canister-dashboard-theme')
  );
  expect(storedThemeAfterRevert).toBe(themeAfterSecondToggle);

  console.log('Theme toggle test completed successfully');
  expect(getConsoleErrors()).toEqual([]);
});
