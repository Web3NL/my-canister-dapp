import { test, expect } from '@playwright/test';
import { login, checkPrincipal } from './login';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import {
    TOPUP_AMOUNT_MAINNET,
    TOPUP_AMOUNT_LOCAL,
} from './shared';
import { transferToPrincipal, transferToPrincipalMainnet } from 'tests/helpers';

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

    const principal = await checkPrincipal(page);
    const topupAmount = isMainNet ? TOPUP_AMOUNT_MAINNET : TOPUP_AMOUNT_LOCAL;
    const formattedAmount = formatIcpBalance(topupAmount);

    // Wait for the top-up button to appear and be visible
    await page.getByRole('button', { name: 'Top-up' }).waitFor({ state: 'visible', timeout: 10000 });

    // Transfer funds using appropriate method based on environment
    if (isMainNet) {
        await transferToPrincipalMainnet(principal, formattedAmount);
    } else {
        await transferToPrincipal(principal, formattedAmount);
    }

    // Click refresh button to update balance
    await page.getByTestId('refresh-balance-btn').click();

    // Calculate minimum expected balance (the amount we just transferred)
    const transferAmount = formattedAmount;

    // Wait for balance to be at least the amount we transferred
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

    // Log the current balance for debugging
    const balanceText = await page.textContent('#balance-value');
    console.log(`Current ICP balance after transfer: ${balanceText}`);

    // Wait for cycles balance to be loaded before recording the "before" value
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

    // Give minimal time for UI to stabilize after top-up
    await page.waitForLoadState('networkidle');

    // Wait for cycles element to be ready (indicating top-up completed)
    const cyclesLocator = page.locator('.status-info p:has-text("Cycles:")');
    await expect(cyclesLocator).not.toHaveText(/Loading\.\.\./);

    // Wait for cycles balance to increase with retry logic to handle varying retrieval times
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

    // Log the final cycles balance for debugging
    const cyclesTextAfter = await cyclesElement.textContent();
    const cyclesBalanceAfter = cyclesTextAfter?.replace(/Cycles:\s*/g, '').trim();
    console.log(`Recorded cycles balance after top-up: ${cyclesBalanceAfter}`);
    console.log('Top-up successfully completed - cycles balance has changed');

});