import { test } from '@playwright/test';
import { installedHelloWorldExampleCanisterFrontendUrl, loadDfxEnv, readTestData } from '../helpers.js';

// Load global dfx environment variables
loadDfxEnv();

test('My Hello World Frontend', async ({ page }) => {
    const frontendUrl = installedHelloWorldExampleCanisterFrontendUrl();
    await page.goto(frontendUrl);

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Login with Internet Identity' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Login with Internet Identity' }).click();
    const page1 = await page1Promise;
    await page1.getByRole('button', { name: 'Use existing' }).waitFor({ state: 'visible' });
    await page1.getByRole('button', { name: 'Use existing' }).click();

    const iiAnchor = readTestData('ii-anchor.txt');
    await page1.getByRole('textbox', { name: 'Identity Anchor' }).waitFor({ state: 'visible' });
    await page1.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
    await page1.getByRole('button', { name: 'Continue', exact: true }).waitFor({ state: 'visible' });
    await page1.getByRole('button', { name: 'Continue', exact: true }).click();
    await page1.getByRole('button', { name: 'Remind me later' }).waitFor({ state: 'visible' });
    await page1.getByRole('button', { name: 'Remind me later' }).click();

    // Wait for authentication to complete and check logout button is visible
    await page.getByRole('button', { name: 'Logout' }).waitFor({ state: 'visible' });

    await page.getByRole('textbox', { name: 'Enter your name:' }).waitFor({ state: 'visible' });
    await page.getByRole('textbox', { name: 'Enter your name:' }).click();
    await page.getByRole('textbox', { name: 'Enter your name:' }).fill('test');
    await page.getByRole('button', { name: 'Click Me!' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Click Me!' }).click();

    // Wait for the greeting message to appear
    await page.getByText('Hello, test!').waitFor({ state: 'visible' });

    // At the end, verify the low cycles warning is shown (test setup ensures low cycles)
    await page.locator('.warning-notification').waitFor({ state: 'visible' });
    await page.locator('.warning-notification').getByText('Low cycles', { exact: false }).waitFor({ state: 'visible' });
    await page.locator('.warning-notification a', { hasText: 'Goto dashboard to top-up' }).waitFor({ state: 'visible' });
});
