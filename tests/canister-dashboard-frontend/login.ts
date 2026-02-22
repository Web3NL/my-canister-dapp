import { Page, expect } from '@playwright/test';
import { Principal } from '@icp-sdk/core/principal';
import { handleIIPopup } from '../ii-helpers.js';

export const login = async (page: Page): Promise<void> => {
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Login' }).click();
    const popup = await popupPromise;

    await handleIIPopup(popup);

    // Wait for popup to close and authentication to complete
    await popup.waitForEvent('close', { timeout: 10000 });
    await expect(page.locator('#authenticated-content')).toBeVisible({ timeout: 10000 });
};

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
