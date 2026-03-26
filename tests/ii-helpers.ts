import type { Page } from '@playwright/test';

/**
 * Handle the II v2 popup authentication flow.
 *
 * icp-cli's bundled II uses DUMMY_AUTH — no real WebAuthn is needed. The fixture
 * in fixtures.ts patches the II JS bundle to force the DUMMY_AUTH path and sets
 * a unique random seed per test context to avoid credential conflicts between tests.
 *
 * Scenarios:
 *  - First popup (no stored identity): CWP → "Create new identity" → name form → done
 *  - Returning popup (same context): "Continue" appears directly (II session persists)
 */
export async function handleIIPopup(popup: Page): Promise<void> {
  await popup
    .waitForURL((url) => !url.href.startsWith('about:'), { timeout: 25000 })
    .catch(() => {});

  await popup.waitForLoadState('domcontentloaded');

  const continueWithPasskey = popup.getByRole('button', {
    name: 'Continue with passkey',
    exact: true,
  });
  const continueBtn = popup.getByRole('button', {
    name: 'Continue',
    exact: true,
  });

  await Promise.race([
    continueWithPasskey.waitFor({ state: 'visible', timeout: 30000 }),
    continueBtn.waitFor({ state: 'visible', timeout: 30000 }),
  ]);

  if (await continueWithPasskey.isVisible()) {
    await continueWithPasskey.click();

    const createNewBtn = popup.getByRole('button', {
      name: 'Create new identity',
      exact: true,
    });
    await createNewBtn.waitFor({ state: 'visible', timeout: 20000 });
    await createNewBtn.click();

    const nameInput = popup.locator('input[placeholder="Identity name"]');
    await nameInput.waitFor({ state: 'visible', timeout: 15000 });
    await nameInput.fill('Test');
    await popup.getByRole('button', { name: 'Create identity', exact: true }).click();

    await continueBtn.waitFor({ state: 'visible', timeout: 30000 });
  }

  await continueBtn.click();
}
