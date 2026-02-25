/**
 * Shared E2E test utilities for canister-dashboard-frontend.
 *
 * Selector conventions (for new tests):
 *   1. data-tid / data-testid  — preferred, resilient to UI changes
 *   2. Role selectors (getByRole) — for standard interactive elements
 *   3. ID selectors (#foo)       — fallback for custom components
 */

import { expect, Page } from '@playwright/test';

export const TOPUP_AMOUNT = BigInt(5_000_000);
export const TEST_CONTROLLER = 'rkp4c-7iaaa-aaaaa-aaaca-cai';
export const TEST_ORIGINS: string[] = [
  'http://localhost:9999',
  'http://22ajg-aqaaa-aaaap-adukq-cai.localhost:8080',
  'https://22ajg-aqaaa-aaaap-adukq-cai.icp0.io',
  'https://e2e-test-origin.example.com',
];

export const waitForListUpdate = async (
  page: Page,
  listSelector: string,
  expectedItem: string,
  shouldContain: boolean = true
): Promise<void> => {
  const listLocator = page.locator(listSelector);
  await expect(async () => {
    await expect(listLocator).not.toHaveText(/Loading\.\.\./);
  }).toPass({ timeout: 10000, intervals: [100, 250, 500, 1000] });

  if (shouldContain) {
    await expect(
      listLocator.locator('li', { hasText: expectedItem })
    ).toBeVisible({ timeout: 10000 });
  } else {
    await expect(async () => {
      // Query only the .data-display elements within list items to avoid picking up copy button SVG whitespace
      const listItems = await listLocator
        .locator('li .data-display')
        .allTextContents();
      const trimmedItems = listItems.map(item => item.trim());
      expect(trimmedItems).not.toContain(expectedItem);
    }).toPass({ timeout: 10000, intervals: [500, 1000, 2000] });
  }
};

export const waitForInputToClear = async (
  page: Page,
  inputSelector: string,
  timeoutMs: number = 10000
): Promise<void> => {
  await expect(async () => {
    const inputValue = await page.inputValue(inputSelector);
    expect(inputValue).toBe('');
  }).toPass({ timeout: timeoutMs, intervals: [100, 500, 1000] });
};

export const waitForAuthenticatedContent = async (
  page: Page,
  timeoutMs: number = 10000
): Promise<void> => {
  await expect(page.locator('#authenticated-content')).toBeVisible({ timeout: timeoutMs });
};

export const parseNumericText = (text: string | null): number => {
  const raw = (text ?? '').replace(/,/g, '').trim();
  const numeric = raw.replace(/\s*[A-Za-z]+\s*$/i, '').trim();
  return parseFloat(numeric);
};

/**
 * Captures console errors during a test. Call at test start, then check
 * the returned array at the end to catch silent failures.
 *
 * Usage:
 *   const getConsoleErrors = setupConsoleErrorMonitoring(page);
 *   // ... test body ...
 *   expect(getConsoleErrors()).toEqual([]);
 */
// Known benign console errors to ignore (e.g. CSP violations from inline SVGs on canister-served pages)
const IGNORED_CONSOLE_ERRORS = [
  /Content Security Policy directive/,
];

export const setupConsoleErrorMonitoring = (page: Page): (() => string[]) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (!IGNORED_CONSOLE_ERRORS.some(re => re.test(text))) {
        consoleErrors.push(text);
      }
    }
  });
  return () => consoleErrors;
};
