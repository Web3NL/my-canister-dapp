import { test } from '../fixtures.js';
import { installedHelloWorldExampleCanisterFrontendUrl, loadTestEnv } from '../helpers.js';
import { handleIIPopup } from '../ii-helpers.js';

// Load test environment variables
loadTestEnv();

test('My Hello World Frontend', async ({ page }) => {
    const frontendUrl = installedHelloWorldExampleCanisterFrontendUrl();
    await page.goto(frontendUrl);

    const page1Promise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Login with Internet Identity' }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Login with Internet Identity' }).click();
    const page1 = await page1Promise;

    // II 2.0: handle passkey authentication flow
    await handleIIPopup(page1);

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
