import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import http from 'http';
import zlib from 'zlib';

const canisterOrigin = process.env.DAPP_CANISTER_ORIGIN;
const identityProvider = process.env.DAPP_II_PROVIDER;
const bundle = readFileSync(process.env.DAPP_BUNDLE_PATH, 'utf8');

/**
 * Automate the II popup for the local icp-cli dev II canister.
 *
 * icp-cli 0.2.1 II bundle has DUMMY_AUTH (ga class) that avoids real WebAuthn,
 * but the canister config sets dummy_auth=opt null instead of opt opt{...}, so
 * the runtime check `Vr.dummy_auth[0]?.[0]!==void 0` evaluates false and the
 * real WebAuthn path (ps class) is used. We force the ga path by patching the
 * bundle in context.route() below — see the proxy handler comment.
 *
 * Scenarios:
 *  - First run (no stored identity): CWP → "Create new identity" → name form → done
 *  - Returning session (same context): CWP → "Continue" appears directly
 */
async function handleIIPopup(popup) {
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

    // Each call uses a unique random seed (patched into the bundle above), so
    // every invocation registers a fresh identity — no credential conflicts.
    // Go straight to "Create new identity".
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
  //
  // Additionally: icp-cli 0.2.1 deploys the II canister with dummy_auth=opt null
  // (Some(None)) instead of opt opt{prompt_for_index:false} (Some(Some({...}))).
  // The runtime check `Vr.dummy_auth[0]?.[0]!==void 0` therefore evaluates false,
  // causing the real WebAuthn path (ps class, calls credentials.create()) to run
  // instead of the DUMMY_AUTH path (ga class, pure software key). On headless
  // Linux, credentials.create() throws NotSupportedError.
  //
  // Fix: detect the II JavaScript entry bundle and replace all dummy_auth checks
  // with `true` so ga.createNew/ga.useExisting (no WebAuthn) is always used.
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

            // Patch the II JavaScript entry bundle to force DUMMY_AUTH (ga class).
            // The bundle path matches /_app/immutable/entry/start*.js.
            const p = url.pathname;
            if (p.includes('/_app/immutable/entry/start') && p.endsWith('.js')) {
              let src = body.toString('utf8');
              // Force every dummy_auth check to true so ga (DUMMY_AUTH, no real
              // WebAuthn) is always used instead of ps (real credentials.create).
              src = src.replaceAll('Vr.dummy_auth[0]?.[0]!==void 0?', 'true?');
              // Use a random seed so each CLI invocation registers a unique identity
              // and avoids credential-already-in-use conflicts when derive-ii-principal
              // is called multiple times against the same running II canister.
              // vz() normally returns BigInt(0); we replace the return value.
              src = src.replace('return BigInt(0)}', 'return BigInt(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER))}');
              body = Buffer.from(src, 'utf8');
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

  // addInitScript runs on ALL pages (including the II popup) before any page JavaScript.
  // Two patches are needed for headless Linux CI:
  //
  // 1. isUserVerifyingPlatformAuthenticatorAvailable() returns false on headless Linux.
  //    II uses this to decide whether to enable the "Create new identity" button.
  //
  // 2. credentials.get() with empty allowCredentials (discoverable/passkey autofill)
  //    throws NotSupportedError on headless Linux, blocking UI render. Rejecting with
  //    NotAllowedError instead lets II treat it as "no passkeys found" and show buttons.
  await context.addInitScript(() => {
    try {
      if (typeof PublicKeyCredential !== 'undefined') {
        Object.defineProperty(PublicKeyCredential, 'isUserVerifyingPlatformAuthenticatorAvailable', {
          value: () => Promise.resolve(true),
          writable: true, configurable: true,
        });
      }
    } catch (_) {}
    try {
      navigator.credentials.get = function() {
        return Promise.reject(new DOMException('No credentials available', 'NotAllowedError'));
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
