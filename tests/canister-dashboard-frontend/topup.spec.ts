import { test } from '@playwright/test';
import { login, checkPrincipal } from './login';
import { formatIcpBalance } from '../../my-canister-dapp-js/canister-dashboard-frontend/src/helpers';
import { performTopUp } from './topUp';
import {
    TOPUP_AMOUNT_MAINNET,
    TOPUP_AMOUNT_LOCAL,
} from './shared';

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
    await performTopUp({ page, isMainNet, principal, formattedAmount });

});