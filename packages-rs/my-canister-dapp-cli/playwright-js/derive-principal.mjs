import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import http from 'http';
import zlib from 'zlib';

const canisterOrigin = process.env.DAPP_CANISTER_ORIGIN;
const identityProvider = process.env.DAPP_II_PROVIDER;
const bundle = readFileSync(process.env.DAPP_BUNDLE_PATH, 'utf8');

/**
 * Automate the II popup — ALWAYS creates a new identity.
 * Never attempts "Use existing identity" (fresh browser context has no stored key).
 */
async function handleIIPopupAlwaysNew(popup) {
  process.stderr.write(`[ii-popup] opened, initial URL: ${popup.url()}\n`);

  // Capture console errors, page JS errors, and failed network requests from II.
  popup.on('console', (msg) => {
    if (msg.type() === 'error') process.stderr.write(`[ii-console] ${msg.text()}\n`);
  });
  popup.on('pageerror', (err) => process.stderr.write(`[ii-pageerror] ${err.message}\n`));
  popup.on('requestfailed', (req) =>
    process.stderr.write(`[ii-reqfailed] ${req.url()} — ${req.failure()?.errorText ?? '?'}\n`)
  );

  // Wait for the popup to navigate away from its initial about:blank state to II.
  await popup
    .waitForURL((url) => !url.href.startsWith('about:'), { timeout: 25000 })
    .catch(() =>
      process.stderr.write(`[ii-popup] still at about:blank after 25s — URL: ${popup.url()}\n`)
    );
  process.stderr.write(`[ii-popup] URL after navigation: ${popup.url()}\n`);

  // Use 'load' (not 'domcontentloaded') so the II SvelteKit app has finished
  // executing its JS before we look for buttons.
  await popup.waitForLoadState('load');

  const bodyText = await popup.locator('body').innerText().catch(() => '<read error>');
  process.stderr.write(`[ii-popup] body after load: ${bodyText.slice(0, 500)}\n`);

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
    // Dump full HTML so we can see what II actually rendered on failure.
    const html = await popup.content().catch(() => '<error reading content>');
    process.stderr.write(`[ii-popup] URL at timeout: ${popup.url()}\n`);
    process.stderr.write(`[ii-popup] HTML at timeout:\n${html.slice(0, 4000)}\n`);
    throw e;
  }

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
            const rawBody = Buffer.concat(chunks);
            const encoding = (res.headers['content-encoding'] || '').toLowerCase();

            // route.fulfill() passes the body directly to Chrome without applying
            // content-encoding — we must decompress here or Chrome will try to parse
            // gzip/brotli bytes as HTML/JS and fail with "Invalid or unexpected token".
            // Also strip hop-by-hop headers that don't apply to a fulfilled response.
            const HOP_BY_HOP = new Set(['content-encoding', 'transfer-encoding', 'connection', 'keep-alive']);
            const headers = {};
            for (const [k, v] of Object.entries(res.headers)) {
              if (!HOP_BY_HOP.has(k)) headers[k] = Array.isArray(v) ? v.join('\n') : String(v);
            }

            let body;
            try {
              if (encoding === 'gzip' || encoding === 'x-gzip') {
                body = zlib.gunzipSync(rawBody);
              } else if (encoding === 'br') {
                body = zlib.brotliDecompressSync(rawBody);
              } else if (encoding === 'deflate') {
                body = zlib.inflateSync(rawBody);
              } else {
                body = rawBody;
              }
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

  // On Linux, headless Chromium has no platform authenticator, so
  // PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  // returns false and II hides the passkey UI.
  //
  // Two-part fix:
  //   1. addInitScript: overrides isUserVerifyingPlatformAuthenticatorAvailable
  //      synchronously BEFORE any page JS runs, so II always sees true.
  //      This avoids the race between II's SvelteKit boot and our async CDP setup.
  //   2. CDP virtual authenticator: handles credentials.create() / credentials.get()
  //      called later in the flow after the user clicks through the II UI.
  //      On macOS the real platform authenticator takes precedence — both are no-ops.
  await context.addInitScript(() => {
    if (typeof PublicKeyCredential !== 'undefined') {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable = () =>
        Promise.resolve(true);
    }

    // Diagnostic: emitted as [ii-console] in stderr
    const dbg = (msg) => console.error('[dbg] ' + msg);

    // CDP virtual authenticators on headless Linux return an empty buffer from
    // AuthenticatorAttestationResponse.getPublicKey(), which causes II's DER parser
    // (DataView.getUint16) to throw "Offset is outside the bounds of the DataView".
    //
    // Strategy: patch AuthenticatorAttestationResponse.prototype.getPublicKey to
    // fall back to extracting the COSE key from getAuthenticatorData() and
    // re-encoding it as DER SubjectPublicKeyInfo (EC P-256) when the native call
    // returns empty.  Prototype patching is simpler and more reliable than a Proxy.

    function buildDerFromAuthData(authDataBuf) {
      const authData = new Uint8Array(authDataBuf);
      dbg('authData.length=' + authData.length);
      // authenticatorData: rpIdHash(32)+flags(1)+signCount(4)+AAGUID(16)+credIdLen(2)+credId(N)+coseKey
      let offset = 53;
      const credIdLen = (authData[offset] << 8) | authData[offset + 1];
      dbg('credIdLen=' + credIdLen);
      offset += 2 + credIdLen;
      const cose = authData.subarray(offset);
      dbg('cose.length=' + cose.length + ' cose[0]=0x' + (cose[0] || 0).toString(16));

      // Canonical COSE P-256 key: ... 0x21 0x58 0x20 <x32> 0x22 0x58 0x20 <y32> ...
      let xi = -1, yi = -1;
      for (let i = 0; i < cose.length - 67; i++) {
        if (cose[i]    === 0x21 && cose[i+1]  === 0x58 && cose[i+2]  === 0x20 &&
            cose[i+35] === 0x22 && cose[i+36] === 0x58 && cose[i+37] === 0x20) {
          xi = i + 3; yi = i + 38; break;
        }
      }
      dbg('xi=' + xi + ' yi=' + yi);
      if (xi < 0) return null;

      // DER SubjectPublicKeyInfo for EC P-256 (91 bytes)
      const der = new Uint8Array(91);
      const prefix = [
        0x30, 0x59, 0x30, 0x13,
        0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
        0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
        0x03, 0x42, 0x00, 0x04,
      ];
      prefix.forEach((b, i) => { der[i] = b; });
      der.set(cose.subarray(xi, xi + 32), prefix.length);
      der.set(cose.subarray(yi, yi + 32), prefix.length + 32);
      dbg('DER built ok (91 bytes)');
      return der.buffer;
    }

    if (typeof AuthenticatorAttestationResponse !== 'undefined') {
      const proto = AuthenticatorAttestationResponse.prototype;
      const origGetPK = proto.getPublicKey;
      dbg('patching AuthenticatorAttestationResponse.prototype.getPublicKey');
      try {
        Object.defineProperty(proto, 'getPublicKey', {
          value: function() {
            let pk = null;
            try { pk = origGetPK.call(this); } catch (e) { dbg('origGetPK threw: ' + e.message); }
            dbg('origGetPK byteLength=' + (pk ? pk.byteLength : 'null'));
            if (pk && pk.byteLength > 0) return pk;
            try {
              const der = buildDerFromAuthData(this.getAuthenticatorData());
              if (der) return der;
            } catch (e) { dbg('buildDer error: ' + e.message); }
            return pk;
          },
          writable: true,
          configurable: true,
        });
        dbg('prototype patch applied');
      } catch (e) {
        dbg('prototype patch FAILED: ' + e.message);
      }
    } else {
      dbg('AuthenticatorAttestationResponse not available in initScript');
    }

    // Wrap credentials.create() for diagnostics — also check whether our prototype
    // patch is actually reachable via the returned response object.
    const _origCreate = navigator.credentials.create.bind(navigator.credentials);
    navigator.credentials.create = async function(options) {
      dbg('credentials.create called');
      let cred;
      try {
        cred = await _origCreate(options);
      } catch (e) {
        dbg('credentials.create THREW: ' + e.message);
        throw e;
      }
      dbg('credentials.create returned type=' + (cred ? cred.type : 'null'));
      if (cred && cred.response) {
        dbg('response instanceof AuthenticatorAttestationResponse: ' +
            (cred.response instanceof AuthenticatorAttestationResponse));
        dbg('response.getPublicKey is patched: ' +
            (cred.response.getPublicKey !== (typeof AuthenticatorAttestationResponse !== 'undefined'
              ? AuthenticatorAttestationResponse.prototype.getPublicKey : null)));
        let pk = null;
        try { pk = cred.response.getPublicKey(); } catch (e) { dbg('getPublicKey threw: ' + e.message); }
        dbg('getPublicKey byteLength=' + (pk ? pk.byteLength : 'null'));
        let authDataLen = null;
        try { authDataLen = cred.response.getAuthenticatorData()?.byteLength; } catch(e) {}
        dbg('getAuthenticatorData byteLength=' + authDataLen);
      }
      return cred;
    };

    // Wrap credentials.get() — during II initialization, II issues a conditional-
    // mediation request to enable passkey autofill. With automaticPresenceSimulation:true
    // the CDP authenticator auto-responds, which can cause II to process an assertion
    // response it doesn't expect and throw a DataView error. Return null for these
    // silent background requests so the flow isn't disrupted.
    const _origGet = navigator.credentials.get.bind(navigator.credentials);
    navigator.credentials.get = async function(options) {
      const mediation = options?.mediation;
      dbg('credentials.get called mediation=' + mediation);
      if (mediation === 'conditional') {
        dbg('credentials.get: conditional → returning null to block CDP auto-response');
        return null;
      }
      return _origGet(options);
    };
  });

  context.on('page', async (newPage) => {
    try {
      const cdp = await context.newCDPSession(newPage);
      await cdp.send('WebAuthn.enable');
      await cdp.send('WebAuthn.addVirtualAuthenticator', {
        options: {
          protocol: 'ctap2',
          transport: 'internal',
          hasResidentKey: true,
          hasUserVerification: true,
          isUserVerified: true,
          automaticPresenceSimulation: true,
        },
      });
    } catch (e) {
      process.stderr.write(`[webauthn] CDP setup failed: ${e.message}\n`);
    }
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
