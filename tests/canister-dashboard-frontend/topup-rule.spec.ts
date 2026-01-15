import { test, expect } from '@playwright/test';
import { login } from './login';

test('manage canister auto top-up rule CRUD', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }

  await page.goto(testUrl);
  await login(page);

  console.log('Testing top-up rule management...');
  const ruleDisplay = page.locator('#top-up-rule-display');
  // Allow longer, retried wait for the rule display to finish loading
  await expect(async () => {
    const txt = (await ruleDisplay.textContent()) || '';
    expect(/Loading/.test(txt)).toBeFalsy();
  }).toPass({ timeout: 15000, intervals: [250, 500, 1000] });

  await page.selectOption('#top-up-rule-interval', 'Hourly');
  await page.selectOption('#top-up-rule-threshold', '_0_25T');
  await page.selectOption('#top-up-rule-amount', '_0_5T');

  await page.click('#top-up-rule-set');

  const expectedRule = 'Interval: Hourly\nThreshold: 0.25T cycles\nAmount: 0.5T cycles';
  await expect(async () => {
    const txt = (await ruleDisplay.textContent())?.trim();
    expect(txt).toBe(expectedRule);
  }).toPass({ timeout: 10000 });
  console.log('Top-up rule set and displayed');

  await page.click('#top-up-rule-clear');
  await expect(ruleDisplay).toHaveText(/No rule set/, { timeout: 10000 });
  console.log('Top-up rule cleared');

  await page.click('#refresh-logs-btn');
  const logsList = page.locator('#logs-list');
  await expect(logsList.locator('.log-entry').first()).toBeVisible();

  await expect(async () => {
    // Check for log entries with top-up badge and rule set/cleared message
    const logEntries = await logsList.locator('.log-entry').allTextContents();
    const found = logEntries.some(
      t => t.includes('TOP-UP') && /rule (set|cleared)/i.test(t)
    );
    expect(found).toBeTruthy();
  }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
  console.log('Found top-up rule action in logs');
});
