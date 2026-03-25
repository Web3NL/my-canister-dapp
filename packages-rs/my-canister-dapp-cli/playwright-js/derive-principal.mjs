import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';

const canisterOrigin = process.env.DAPP_CANISTER_ORIGIN;
const identityProvider = process.env.DAPP_II_PROVIDER;
const bundle = readFileSync(process.env.DAPP_BUNDLE_PATH, 'utf8');

/**
 * Automate the II popup — ALWAYS creates a new identity.
 * Never attempts "Use existing identity" (fresh browser context has no stored key).
 */
async function handleIIPopupAlwaysNew(popup) {
  // Use 'load' (not 'domcontentloaded') so the II React app has finished
  // executing its JS before we look for buttons.
  await popup.waitForLoadState('load');

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

    // Skip "Use existing identity" — go directly to "Create new identity"
    const createNewBtn = popup.getByRole('button', {
      name: 'Create new identity',
      exact: true,
    });
    await createNewBtn.waitFor({ state: 'visible', timeout: 20000 });
    await createNewBtn.click();

    const nameInput = popup.locator('input[placeholder="Identity name"]');
    await nameInput.waitFor({ state: 'visible', timeout: 20000 });
    await nameInput.fill('Test');
    await popup.getByRole('button', { name: 'Create identity', exact: true }).click();

    await continueBtn.waitFor({ state: 'visible', timeout: 30000 });
  }

  await continueBtn.click();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    // On Ubuntu, Chromium's built-in DNS resolver does not resolve *.localhost
    // subdomains. Explicitly map them to 127.0.0.1 so the local PocketIC
    // HTTP gateway (e.g. rdmx6-...-cai.localhost:8080) is reachable.
    // macOS resolves *.localhost natively; this rule is a no-op there.
    args: ['--host-resolver-rules=MAP *.localhost 127.0.0.1'],
  });
  // Fresh context = no stored passkey identity
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept canister origin — canister does not need to be running
  await page.route(`${canisterOrigin}/**`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><head></head><body></body></html>',
    })
  );

  await page.goto(canisterOrigin);
  await page.addScriptTag({ content: bundle });
  await page.evaluate((ip) => window.DeriveIIPrincipal.setup(ip), identityProvider);
  await page.waitForSelector('[data-tid="login-button"]');

  const popupPromise = page.waitForEvent('popup', { timeout: 30000 });
  await page.click('[data-tid="login-button"]');
  const popup = await popupPromise;

  await handleIIPopupAlwaysNew(popup);
  await popup.waitForEvent('close', { timeout: 30000 });

  await page.waitForFunction(
    () => {
      const el = document.getElementById('principal');
      return el && el.textContent && el.textContent.length > 10;
    },
    { timeout: 30000 }
  );

  const principal = await page.locator('#principal').textContent();
  if (!principal || principal.startsWith('ERROR:')) {
    console.error(`Failed to derive principal: ${principal}`);
    await browser.close();
    process.exit(1);
  }

  // Write ONLY the principal to stdout — Rust reads this
  process.stdout.write(principal.trim());
  await browser.close();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
