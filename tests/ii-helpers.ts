import type { Page } from '@playwright/test';

/**
 * Handle the II v2 popup authentication flow.
 *
 * Supports three scenarios:
 * - Existing canister: "Continue with passkey" → "Use existing identity" → "Continue"
 * - Fresh canister (no identity yet): above path errors → "Create new identity" fallback
 * - Returning session (same browser context): "Continue" directly
 */
export async function handleIIPopup(popup: Page): Promise<void> {
  await popup.waitForLoadState('domcontentloaded');

  const continueWithPasskey = popup.getByRole('button', {
    name: 'Continue with passkey',
    exact: true,
  });
  const continueBtn = popup.getByRole('button', {
    name: 'Continue',
    exact: true,
  });

  // Wait for either button to appear
  await Promise.race([
    continueWithPasskey.waitFor({ state: 'visible', timeout: 15000 }),
    continueBtn.waitFor({ state: 'visible', timeout: 15000 }),
  ]);

  if (await continueWithPasskey.isVisible()) {
    await continueWithPasskey.click();

    // Try "Use existing identity" (works when canister already has a dummy identity)
    const useExistingBtn = popup.getByRole('button', {
      name: 'Use existing identity',
      exact: true,
    });
    await useExistingBtn.waitFor({ state: 'visible', timeout: 10000 });
    await useExistingBtn.click();

    // Check if existing identity was found (Continue appears) or not (error appears)
    const errorText = popup.getByText(
      'Cannot read properties of undefined'
    );
    const hasError = await errorText
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (hasError) {
      // Fresh canister — no identity exists yet, create one
      const createNewBtn = popup.getByRole('button', {
        name: 'Create new identity',
        exact: true,
      });
      await createNewBtn.waitFor({ state: 'visible', timeout: 10000 });
      await createNewBtn.click();

      const nameInput = popup.locator('input[placeholder="Identity name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 10000 });
      await nameInput.fill('Test');
      await popup
        .getByRole('button', { name: 'Create identity', exact: true })
        .click();
    }

    // Wait for the authorization "Continue" button
    await continueBtn.waitFor({ state: 'visible', timeout: 15000 });
  }

  await continueBtn.click();
}
