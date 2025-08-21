import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import { TOPUP_AMOUNT } from './shared';
import { transferToPrincipal } from 'tests/helpers';

test('canister top-up increases cycles balance', async ({ page }, testInfo) => {
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

    const principal = await checkPrincipal(page);
    const topupAmount = TOPUP_AMOUNT;
    const formattedAmount = formatIcpBalance(topupAmount);

    await page.getByRole('button', { name: 'Top-up' }).waitFor({ state: 'visible', timeout: 10000 });

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
    const cyclesElement = page.locator('.status-info p:has-text("Cycles:")');
    await cyclesElement.waitFor({ timeout: 10000 });
    await expect(cyclesElement).not.toHaveText(/Loading\.\.\./);
    const cyclesTextBefore = await cyclesElement.textContent();
    if (!cyclesTextBefore) {
        throw new Error('Cycles balance not found before top-up');
    }
    const cyclesBalanceBefore = cyclesTextBefore.replace(/Cycles:\s*/g, '').trim();
    console.log(`Recorded cycles balance before top-up: ${cyclesBalanceBefore}`);

    await page.getByRole('button', { name: 'Top-up' }).click();

    await page.waitForLoadState('networkidle');
    const cyclesLocator = page.locator('.status-info p:has-text("Cycles:")');
    await expect(cyclesLocator).not.toHaveText(/Loading\.\.\./);

    const cyclesLocatorInline = page.locator('.status-info p:has-text("Cycles:")');
    const beforeNum = parseFloat(cyclesBalanceBefore.replace(/\s*T\s*$/i, '').trim());
    if (isNaN(beforeNum)) {
        throw new Error(`Invalid before cycles balance: "${cyclesBalanceBefore}" - cannot parse as number`);
    }
    if (beforeNum <= 0) {
        throw new Error(`Initial cycles balance must be greater than 0, got: "${cyclesBalanceBefore}"`);
    }
    await expect(async () => {
        const cyclesTextNow = await cyclesLocatorInline.textContent();
        const currentBalanceStr = cyclesTextNow?.replace(/Cycles:\s*/g, '').trim();
        if (!currentBalanceStr) {
            throw new Error('Current cycles balance is empty');
        }
        const currentNum = parseFloat(currentBalanceStr.replace(/\s*T\s*$/i, '').trim());
        if (isNaN(currentNum)) {
            throw new Error(`Invalid current cycles balance: "${currentBalanceStr}" - cannot parse as number`);
        }
        expect(currentNum).toBeGreaterThan(beforeNum);
    }).toPass({ timeout: 15000 });

    const cyclesTextAfter = await cyclesElement.textContent();
    const cyclesBalanceAfter = cyclesTextAfter?.replace(/Cycles:\s*/g, '').trim();
    console.log(`Recorded cycles balance after top-up: ${cyclesBalanceAfter}`);
    console.log('Top-up successfully completed - cycles balance has changed');

});