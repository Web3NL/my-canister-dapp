import { test, expect } from '@playwright/test';
import { login } from './login';

test('manage canister auto top-up rule CRUD', async ({ page }, testInfo) => {
  const testUrl = testInfo.project.metadata.testUrl;
  const principalFile = testInfo.project.metadata.principalFile;

  if (!testUrl) {
    throw new Error('testUrl not found in project metadata');
  }
  if (!principalFile) {
    throw new Error('principalFile not found in project metadata');
  }

  await page.goto(testUrl);
  await login(page);

  console.log('Testing top-up rule management...');
  await expect(page.locator('#top-up-rule-display')).not.toHaveText(/Loading/);

  await page.selectOption('#top-up-rule-interval', 'Hourly');
  await page.selectOption('#top-up-rule-threshold', '_0_25T');
  await page.selectOption('#top-up-rule-amount', '_0_5T');

  await page.click('#top-up-rule-set');

  const ruleDisplay = page.locator('#top-up-rule-display');
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
  await expect(logsList.locator('li').first()).not.toHaveText(/Loading/);

  await expect(async () => {
    const logTexts = await logsList.locator('li').allTextContents();
    const found = logTexts.some(t => /top-up: rule (set|cleared)/.test(t));
    expect(found).toBeTruthy();
  }).toPass({ timeout: 15000, intervals: [500, 1000, 2000] });
  console.log('Found top-up rule action in logs');
});
