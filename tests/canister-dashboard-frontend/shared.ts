import { expect, Page } from '@playwright/test';

// Shared constants originally declared inside the test block
export const TOPUP_AMOUNT_MAINNET = BigInt(100_000);
export const TOPUP_AMOUNT_LOCAL = BigInt(100_000);
export const TEST_CONTROLLER = 'rkp4c-7iaaa-aaaaa-aaaca-cai';
export const TEST_ORIGINS: string[] = [
    'http://localhost:9999',
    // 'http://22ajg-aqaaa-aaaap-adukq-cai.localhost:8080',
    // 'https://22ajg-aqaaa-aaaap-adukq-cai.icp0.io',
    // 'https://mycanister.app',
];

/**
 * Waits until a list either contains (default) or no longer contains the expected item.
 */
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
        await expect(listLocator.locator('li', { hasText: expectedItem })).toBeVisible({ timeout: 10000 });
    } else {
        await expect(async () => {
            const listItems = await listLocator.locator('li').allTextContents();
            expect(listItems).not.toContain(expectedItem);
        }).toPass({ timeout: 10000, intervals: [500, 1000, 2000] });
    }
};

/**
 * Waits for an input element to become empty.
 */
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
