import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import { TOPUP_AMOUNT } from './shared';
import { transferToPrincipal } from '../helpers.js';

test('canister top-up increases cycles balance', async ({ page }, testInfo) => {
    const testUrl = testInfo.project.metadata.testUrl;

    if (!testUrl) {
        throw new Error('testUrl not found in project metadata');
    }

    await page.goto(testUrl);

    await login(page);

    // Ensure authenticated content is visible before interacting
    await expect(page.locator('#authenticated-content')).toBeVisible({ timeout: 10000 });

    const principal = await checkPrincipal(page);
    const topupAmount = TOPUP_AMOUNT;
    const formattedAmount = formatIcpBalance(topupAmount);

    const topupButton = page.getByRole('button', { name: 'Top-up' });
    await topupButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(topupButton).toBeEnabled();

    await transferToPrincipal(principal, formattedAmount);

    await page.getByTestId('refresh-balance-btn').click();

    const transferAmount = formattedAmount;

    const balanceLocator = page.locator('#balance-value');
    await expect(balanceLocator).not.toHaveText(/Loading\.\.\./);
    const minNum = parseFloat(transferAmount);
    if (isNaN(minNum)) {
        throw new Error(`Invalid minimum balance: "${transferAmount}" - cannot parse as number`);
    }
    await expect(async () => {
        const balanceTextNow = await balanceLocator.textContent();
        const currentNum = parseFloat(balanceTextNow ?? '0');
        if (isNaN(currentNum)) {
            throw new Error(`Invalid current balance: "${balanceTextNow}" - cannot parse as number`);
        }
        expect(currentNum).toBeGreaterThan(0);
        expect(currentNum).toBeGreaterThanOrEqual(minNum);
    }).toPass();

    const balanceText = await page.textContent('#balance-value');
    console.log(`Current ICP balance after transfer: ${balanceText}`);
    // Target the exact cycles value span to avoid flaky paragraph matches
    const cyclesValue = page.locator('#cycles-value');
    await expect(cyclesValue).toBeVisible();
    await expect(cyclesValue).not.toHaveText(/Loading\.\.\./);
    const cyclesTextBefore = await cyclesValue.textContent();
    if (!cyclesTextBefore) {
        throw new Error('Cycles balance not found before top-up');
    }
    const cyclesBalanceBefore = cyclesTextBefore.trim();
    console.log(`Recorded cycles balance before top-up: ${cyclesBalanceBefore}`);

    // Click Top-up only when overlay is hidden and button is enabled
    const overlay = page.locator('#loading-overlay');
    await expect(overlay).toBeHidden();
    await expect(topupButton).toBeEnabled();
    await topupButton.click();

    // Wait for the action to start (overlay appears) and finish (overlay hidden)
    await expect(overlay).toBeVisible({ timeout: 5000 });
    await expect(overlay).toBeHidden({ timeout: 60000 });
    await expect(cyclesValue).not.toHaveText(/Loading\.\.\./);

    const parseCycles = (text: string | null): number => {
        const raw = (text ?? '').replace(/,/g, '').trim();
        // UI shows like "0.00 T"; strip trailing unit
        const numeric = raw.replace(/\s*[A-Za-z]+\s*$/i, '').trim();
        return parseFloat(numeric);
    };
    const beforeNum = parseCycles(cyclesBalanceBefore);
    if (isNaN(beforeNum)) {
        throw new Error(`Invalid before cycles balance: "${cyclesBalanceBefore}" - cannot parse as number`);
    }
    // Wait until the displayed text actually changes to avoid rounding masking small deltas
    await expect(async () => {
        const cyclesTextNow = (await cyclesValue.textContent())?.trim() ?? '';
        expect(cyclesTextNow).not.toBe(cyclesBalanceBefore);
        const currentNum = parseCycles(cyclesTextNow);
        if (isNaN(currentNum)) {
            throw new Error(`Invalid current cycles balance: "${cyclesTextNow}" - cannot parse as number`);
        }
        expect(currentNum).toBeGreaterThan(beforeNum);
    }).toPass({ timeout: 45000, intervals: [250, 500, 1000, 2000] });

    const cyclesTextAfter = await cyclesValue.textContent();
    const cyclesBalanceAfter = cyclesTextAfter?.trim();
    console.log(`Recorded cycles balance after top-up: ${cyclesBalanceAfter}`);
    console.log('Top-up successfully completed - cycles balance has changed');

});