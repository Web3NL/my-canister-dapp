import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';

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
