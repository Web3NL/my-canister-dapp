import { test } from '@playwright/test';
import { myCanisterAppDfxUrl, loadDfxEnv, readTestData, transferToPrincipal } from '../helpers';
import { Principal } from '@dfinity/principal';

// Load global dfx environment variables
loadDfxEnv();

test('My Canister App E2E Suite', async ({ page }) => {
    test.setTimeout(60000); // 1 minute timeout
    const TRANSFER_AMOUNT = '0.2';

    const appUrl = myCanisterAppDfxUrl();
    await page.goto(appUrl);

    await page.getByRole('button', { name: 'My Dapps', exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'My Dapps', exact: true }).click();

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Connect with Internet Identity' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Connect with Internet Identity' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: 'Use existing' }).waitFor({ state: 'visible' });
    await page1.getByRole('button', { name: 'Use existing' }).click();

    const iiAnchor = readTestData('ii-anchor.txt');
    await page1.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
    await page1.getByRole('button', { name: 'Continue', exact: true }).waitFor({ state: 'visible' });
    await page1.getByRole('button', { name: 'Continue', exact: true }).click();
    await page1.getByRole('button', { name: 'Remind me later' }).waitFor({ state: 'visible' });
    await page1.getByRole('button', { name: 'Remind me later' }).click();

    // Wait for II to close and authentication to complete
    await page.getByRole('link').filter({ hasText: 'Install a Dapp +' }).waitFor({ state: 'visible' });

    await page.getByRole('link').filter({ hasText: 'Install a Dapp +' }).waitFor({ state: 'visible' });
    await page.getByRole('link').filter({ hasText: 'Install a Dapp +' }).click();
    await page.getByRole('button', { name: 'Install' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Install' }).click();

    // Read the principal from the page and transfer funds
    const principalText = await page.locator('#principal .value').first().textContent();
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!principalText) {
        throw new Error('Principal text not found on the page');
    }
    const principal = Principal.fromText(principalText.trim());
    await transferToPrincipal(principal, TRANSFER_AMOUNT);

    await page.getByRole('button', { name: 'Create dApp' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Create dApp' }).click();

    await page.getByRole('button', { name: 'Connect II to dApp' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Connect II to dApp' }).click();

    const page2Promise = page.waitForEvent('popup');
    const page2 = await page2Promise;
    await page2.getByRole('button', { name: iiAnchor }).waitFor({ state: 'visible' });
    await page2.getByRole('button', { name: iiAnchor }).click();
    await page2.getByRole('button', { name: 'Remind me later' }).waitFor({ state: 'visible' });
    await page2.getByRole('button', { name: 'Remind me later' }).click();

    await page.getByRole('heading', { name: 'Good news' }).waitFor({ state: 'visible' });
});