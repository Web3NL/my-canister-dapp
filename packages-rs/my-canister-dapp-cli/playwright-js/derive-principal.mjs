import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import http from 'http';

const canisterOrigin = process.env.DAPP_CANISTER_ORIGIN;
const identityProvider = process.env.DAPP_II_PROVIDER;
const bundle = readFileSync(process.env.DAPP_BUNDLE_PATH, 'utf8');

/**
 * Automate the II popup — ALWAYS creates a new identity.
 * Never attempts "Use existing identity" (fresh browser context has no stored key).
 */
async function handleIIPopupAlwaysNew(popup) {
  // Use 'load' (not 'domcontentloaded') so the II SvelteKit app has finished
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
  const browser = await chromium.launch({ headless: true });
  // Fresh context = no stored passkey identity
  const context = await browser.newContext();

  // On Linux, Chromium's built-in DNS resolver does not reliably resolve
  // *.localhost subdomains (the --host-resolver-rules flag is not propagated
  // to Chrome's sandboxed network service). Intercept all *.localhost requests
  // in Node.js and proxy them via localhost, preserving the Host header so
  // PocketIC's HTTP gateway can route to the correct canister.
  // macOS resolves *.localhost natively — this adds negligible overhead there.
  await context.route(
    (url) => url.hostname !== 'localhost' && url.hostname.endsWith('.localhost'),
    (route) => {
      const url = new URL(route.request().url());
      // Use Node.js http directly so the Host header is sent exactly as set.
      // route.fetch() derives Host from the target URL and ignores overrides,
      // which breaks PocketIC's canister routing by subdomain.
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: parseInt(url.port) || 80,
          path: url.pathname + url.search,
          method: route.request().method(),
          headers: { ...route.request().headers(), host: url.host },
        },
        (res) => {
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            const headers = {};
            for (const [k, v] of Object.entries(res.headers)) {
              headers[k] = Array.isArray(v) ? v.join('\n') : String(v);
            }
            route.fulfill({ status: res.statusCode, headers, body: Buffer.concat(chunks) })
              .catch((e) => process.stderr.write(`[proxy] fulfill error: ${e.message}\n`));
          });
        }
      );
      req.on('error', (e) => {
        process.stderr.write(`[proxy] request error: ${url.href}: ${e.message}\n`);
        route.abort();
      });
      const body = route.request().postDataBuffer();
      if (body) req.write(body);
      req.end();
    }
  );

  // On Linux, headless Chromium has no platform authenticator, so
  // navigator.credentials.isUserVerifyingPlatformAuthenticatorAvailable()
  // returns false and II hides the passkey UI. Add a virtual authenticator
  // to every new page (including the II popup) so II renders the passkey flow.
  // automaticPresenceSimulation (default true) auto-handles credentials.create()
  // with no user interaction. On macOS this is a no-op — the real platform
  // authenticator takes precedence.
  context.on('page', async (newPage) => {
    await newPage.addVirtualAuthenticator({
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    });
  });

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
