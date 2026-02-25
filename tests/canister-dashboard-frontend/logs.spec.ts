import { test, expect } from '@playwright/test';
import { login } from './login';
import { setupConsoleErrorMonitoring } from './shared';

test('view and refresh canister logs', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  const getConsoleErrors = setupConsoleErrorMonitoring(page);

  await page.goto(testUrl);
  await login(page);

  // Generate log entries by setting and clearing a top-up rule
  const ruleDisplay = page.locator('#top-up-rule-display');
  await expect(async () => {
    const txt = (await ruleDisplay.textContent()) || '';
    expect(/Loading/.test(txt)).toBeFalsy();
  }).toPass({ timeout: 15000, intervals: [250, 500, 1000] });

  await page.selectOption('#top-up-rule-interval', 'Hourly');
  await page.selectOption('#top-up-rule-threshold', '_0_25T');
  await page.selectOption('#top-up-rule-amount', '_0_5T');
  await page.click('#top-up-rule-set');
  await expect(ruleDisplay).not.toHaveText(/No rule set/, { timeout: 10000 });
  await page.click('#top-up-rule-clear');
  await expect(ruleDisplay).toHaveText(/No rule set/, { timeout: 10000 });

  // Now refresh logs — entries should exist from the rule set/clear above
  const refreshBtn = page.locator('#refresh-logs-btn');
  await refreshBtn.waitFor({ state: 'visible', timeout: 10000 });
  await refreshBtn.click();

  const logsList = page.locator('#logs-list');

  // Wait for a real log entry (one with a header, not the "No logs found" placeholder)
  const realLogEntry = logsList.locator('.log-entry:has(.log-header)');
  await expect(realLogEntry.first()).toBeVisible({ timeout: 15000 });

  // Verify log entries have the expected structure
  const firstEntry = realLogEntry.first();
  await expect(firstEntry.locator('.log-header')).toBeVisible();
  await expect(firstEntry.locator('.log-badge')).toBeVisible();
  await expect(firstEntry.locator('.log-index')).toBeVisible();

  // Verify log entries are ordered by index (descending — newest first)
  const indices = await logsList.locator('.log-entry .log-index').allTextContents();
  if (indices.length >= 2) {
    const nums = indices.map(t => parseInt(t.replace('#', ''), 10));
    for (let i = 0; i < nums.length - 1; i++) {
      expect(nums[i]).toBeGreaterThanOrEqual(nums[i + 1]!);
    }
    console.log(`Verified ${nums.length} log entries in descending order`);
  }

  // Verify badge has a recognized level class
  const badgeClasses = await firstEntry.locator('.log-badge').getAttribute('class');
  expect(badgeClasses).toMatch(/log-badge-(info|success|warning|error)/);

  // Click refresh again and verify logs still render
  await refreshBtn.click();
  await expect(realLogEntry.first()).toBeVisible({ timeout: 15000 });

  console.log('Canister logs test completed successfully');
  expect(getConsoleErrors()).toEqual([]);
});
