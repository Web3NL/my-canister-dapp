import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import http from 'http';
import zlib from 'zlib';

const canisterOrigin = process.env.DAPP_CANISTER_ORIGIN;
const identityProvider = process.env.DAPP_II_PROVIDER;
const bundle = readFileSync(process.env.DAPP_BUNDLE_PATH, 'utf8');

/**
 * Automate the II popup, matching the handleIIPopup flow from tests/ii-helpers.ts.
 *
 * The local NNS II provisioned by icp-cli (ii: true) supports passkey-less auth:
 * credentials.get() ("Use existing identity") works without a real authenticator,
 * so we try that path first. "Create new identity" calls credentials.create()
 * which hangs without an authenticator, so we only fall back to it if needed.
 *
 * Scenarios:
 *  - First run (no stored identity): "Use existing" errors → "Create new identity"
 *  - Returning session (same context): "Continue" appears directly
 */
async function handleIIPopup(popup) {
  process.stderr.write(`[ii-popup] opened: ${popup.url()}\n`);
  popup.on('console', (msg) => process.stderr.write(`[ii-console] ${msg.type()}: ${msg.text()}\n`));
  popup.on('pageerror', (err) => process.stderr.write(`[ii-pageerror] ${err.message}\n`));
  popup.on('requestfailed', (req) =>
    process.stderr.write(`[ii-reqfailed] ${req.url()} — ${req.failure()?.errorText ?? '?'}\n`)
  );

  await popup
    .waitForURL((url) => !url.href.startsWith('about:'), { timeout: 25000 })
    .catch(() => process.stderr.write(`[ii-popup] still at about:blank after 25s\n`));

  process.stderr.write(`[ii-popup] URL after navigation: ${popup.url()}\n`);
  await popup.waitForLoadState('domcontentloaded');

  const continueWithPasskey = popup.getByRole('button', {
    name: 'Continue with passkey',
    exact: true,
  });
  const continueBtn = popup.getByRole('button', {
    name: 'Continue',
    exact: true,
  });

  try {
    await Promise.race([
      continueWithPasskey.waitFor({ state: 'visible', timeout: 30000 }),
      continueBtn.waitFor({ state: 'visible', timeout: 30000 }),
    ]);
  } catch (e) {
    const html = await popup.content().catch(() => '<error reading content>');
    process.stderr.write(`[ii-popup] timeout. URL: ${popup.url()}\n`);
    process.stderr.write(`[ii-popup] HTML:\n${html.slice(0, 3000)}\n`);
    throw e;
  }

  if (await continueWithPasskey.isVisible()) {
    await continueWithPasskey.click();

    // Try "Use existing identity" — in the local NNS II test build this works via
    // credentials.get() without a real authenticator (passkey-less auth).
    const useExistingBtn = popup.getByRole('button', {
      name: 'Use existing identity',
      exact: true,
    });
    await useExistingBtn.waitFor({ state: 'visible', timeout: 10000 });
    await useExistingBtn.click();

    // If no identity exists yet, II shows an error; fall back to creating one.
    const errorVisible = await popup
      .getByText('Cannot read properties of undefined')
      .waitFor({ state: 'visible', timeout: 3000 })
      .then(() => true)
      .catch(() => false);

    if (errorVisible) {
      process.stderr.write(`[ii-popup] use-existing failed — creating new identity\n`);
      const createNewBtn = popup.getByRole('button', {
        name: 'Create new identity',
        exact: true,
      });
      await createNewBtn.waitFor({ state: 'visible', timeout: 10000 });
      await createNewBtn.click();

      const nameInput = popup.locator('input[placeholder="Identity name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 10000 });
      await nameInput.fill('Test');
      await popup.getByRole('button', { name: 'Create identity', exact: true }).click();
    }

    await continueBtn.waitFor({ state: 'visible', timeout: 30000 });
  }

  await continueBtn.click();
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    // On Linux, map *.localhost to 127.0.0.1 at the DNS level so PocketIC
    // canister subdomains resolve. This mirrors what playwright.config.ts does
    // for the E2E tests. context.route() is kept below as a belt-and-suspenders
    // backup that also handles gzip decompression.
    args: ['--host-resolver-rules=MAP *.localhost 127.0.0.1'],
  });
  // Use Desktop Chrome user agent + viewport to avoid headless-detection by II.
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
  });

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
            const rawBody = Buffer.concat(chunks);
            const encoding = (res.headers['content-encoding'] || '').toLowerCase();

            // route.fulfill() passes the body directly to Chrome without applying
            // content-encoding — decompress here or Chrome parses compressed bytes
            // as HTML/JS and fails with "Invalid or unexpected token".
            const HOP_BY_HOP = new Set([
              'content-encoding', 'transfer-encoding', 'connection', 'keep-alive',
            ]);
            const headers = {};
            for (const [k, v] of Object.entries(res.headers)) {
              if (!HOP_BY_HOP.has(k)) headers[k] = Array.isArray(v) ? v.join('\n') : String(v);
            }

            let body;
            try {
              if (encoding === 'gzip' || encoding === 'x-gzip') body = zlib.gunzipSync(rawBody);
              else if (encoding === 'br') body = zlib.brotliDecompressSync(rawBody);
              else if (encoding === 'deflate') body = zlib.inflateSync(rawBody);
              else body = rawBody;
            } catch (e) {
              process.stderr.write(`[proxy] decompress error (${encoding}): ${e.message}\n`);
              body = rawBody;
            }

            route.fulfill({ status: res.statusCode, headers, body })
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

  // The II /authorize page calls credentials.get() with empty allowCredentials on mount
  // for passkey autofill/discovery. On headless Linux Chrome this throws NotSupportedError
  // and prevents the passkey UI from rendering.
  //
  // Intercept discoverable-credential calls (allowCredentials undefined or empty) and
  // reject with NotAllowedError, which II treats as "no passkeys found" and renders the
  // button UI normally. Non-discoverable calls (allowCredentials non-empty) pass through
  // to the real implementation — the local II dev build handles those without a real
  // authenticator (DUMMY_AUTH mode).
  //
  // addInitScript runs on ALL pages (including the II popup) before any page JavaScript.
  await context.addInitScript(() => {
    try {
      const _origGet = navigator.credentials.get.bind(navigator.credentials);
      navigator.credentials.get = function(options) {
        const allowCredentials = options?.publicKey?.allowCredentials;
        if (!allowCredentials || allowCredentials.length === 0) {
          return Promise.reject(new DOMException('No credentials available', 'NotAllowedError'));
        }
        return _origGet(options);
      };
    } catch (_) {}
  });

  const page = await context.newPage();

  // Intercept canister origin — the canister does not need to be running for
  // principal derivation; we only need a page at that origin to trigger II auth.
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

  await handleIIPopup(popup);
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
