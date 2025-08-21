import { Page, expect } from '@playwright/test';
import { readTestData } from '../helpers';
import { Principal } from '@dfinity/principal';

/**
 * Performs the automated Internet Identity login flow using an existing anchor.
 * Assumes the main dashboard page is already loaded and the "Login" button is visible.
 */
export const login = async (page: Page): Promise<void> => {
    const iiAnchor = readTestData('ii-anchor.txt');

    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Login' }).click();
    const popup = await popupPromise;

    await popup.getByRole('button', { name: 'Use existing' }).click();
    await popup.getByRole('textbox', { name: 'Identity Anchor' }).fill(iiAnchor);
    await popup.getByRole('button', { name: 'Continue', exact: true }).click();
    await popup.getByRole('button', { name: 'Remind me later' }).click();
};

/**
 * Extracts and verifies the principal from the dashboard page (ensuring the ICRC1 account matches).
 * Returns the validated Principal. Top-up amount formatting is intentionally left to the caller.
 */
export const checkPrincipal = async (page: Page): Promise<Principal> => {
    const iiPrincipalElement = page.locator('#ii-principal');
    await iiPrincipalElement.waitFor({ state: 'visible', timeout: 10000 });
    const principalText = await iiPrincipalElement.textContent();
    if (!principalText) throw new Error('Principal not found on page');
    const principal = Principal.fromText(principalText);
    const icrc1AccountLocator = page.locator('#icrc1-account');
    await icrc1AccountLocator.waitFor({ state: 'visible', timeout: 10000 });
    await expect(icrc1AccountLocator).not.toHaveText(/Loading\.\.\./);
    await expect(async () => {
        const icrc1AccountText = (await icrc1AccountLocator.textContent())?.trim();
        expect(icrc1AccountText).toBe(principalText.trim());
    }).toPass({ timeout: 10000, intervals: [250, 500, 1000] });
    console.log('Verified ii-principal and icrc1-account match');
    return principal;
};
