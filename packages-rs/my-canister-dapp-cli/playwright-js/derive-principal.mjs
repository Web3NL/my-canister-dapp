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

    const dbg = (msg) => console.error('[dbg] ' + msg);

    // ── Fix 1: DataView constructor substitution ─────────────────────────────
    // II's CBOR decoder (called from uz→pz→sign→createNew) returns a 0-byte
    // ArrayBuffer for authData when decoding attestationObject. II then creates
    // new DataView(0-byte) and calls getUint16(53) to read credentialIdLength,
    // which throws RangeError.
    //
    // Root cause: II's CBOR decoder has a bug that produces a 0-byte buffer for
    // the authData field regardless of attestation format.
    //
    // Fix: intercept the DataView constructor. When a 0-byte buffer is passed
    // and we have a stored authData, substitute the real authData so II can parse
    // it correctly. The DataView object then covers the full 164-byte authData.
    const _authDataRef = { buf: null };
    const _OrigDataView = DataView;
    const _OrigDVProto = _OrigDataView.prototype;

    function PatchedDataView(buffer, byteOffset, byteLength) {
      const bLen = buffer && typeof buffer.byteLength === 'number' ? buffer.byteLength : 0;
      const effective = byteLength !== undefined ? byteLength :
        byteOffset !== undefined ? bLen - (byteOffset || 0) : bLen;
      if (effective === 0 && _authDataRef.buf) {
        dbg('DataView(0-byte) → substituting stored authData');
        return new _OrigDataView(_authDataRef.buf);
      }
      if (byteOffset !== undefined && byteLength !== undefined)
        return new _OrigDataView(buffer, byteOffset, byteLength);
      if (byteOffset !== undefined)
        return new _OrigDataView(buffer, byteOffset);
      return new _OrigDataView(buffer);
    }
    PatchedDataView.prototype = _OrigDVProto;
    Object.setPrototypeOf(PatchedDataView, _OrigDataView);
    window.DataView = PatchedDataView;

    // ── Fix 5: Uint8Array.prototype.subarray/slice on 0-byte arrays ──────────
    // uz calls authData.subarray(55+credIdLen) to extract the COSE key bytes
    // for CBOR decoding. But authData is a 0-byte Uint8Array (CBOR decoder bug —
    // it creates a 0-byte slice even though our "none" CBOR correctly encodes
    // authData as 148 bytes). The DataView substitution above fixes credIdLen
    // reading but uz still uses the original 0-byte array to extract COSE bytes.
    const _origSubarray = Uint8Array.prototype.subarray;
    Uint8Array.prototype.subarray = function(begin, end) {
      if (this.byteLength === 0 && _authDataRef.buf) {
        const result = _origSubarray.call(new Uint8Array(_authDataRef.buf), begin, end);
        dbg('Uint8Array(0).subarray(' + begin + ') → synth(' + result.byteLength + 'b)');
        return result;
      }
      return _origSubarray.call(this, begin, end);
    };
    const _origSlice = Uint8Array.prototype.slice;
    Uint8Array.prototype.slice = function(begin, end) {
      if (this.byteLength === 0 && _authDataRef.buf) {
        const result = _origSlice.call(new Uint8Array(_authDataRef.buf), begin, end);
        dbg('Uint8Array(0).slice(' + begin + ') → synth(' + result.byteLength + 'b)');
        return result;
      }
      return _origSlice.call(this, begin, end);
    };

    // ── Fix 6: Object.prototype.entries shim for CBOR-decoded COSE key ──────
    // cbor-x (used by II) returns plain JS objects for CBOR maps, with integer
    // keys coerced to strings ("-2", "-3", etc.). uz calls n.entries() expecting
    // a Map-like iterator with integer keys. In normal macOS flow, getPublicKey()
    // returns valid DER so this COSE parse path is never reached. With CDP
    // virtual authenticators, getPublicKey() is empty and uz hits this dead code.
    // Add .entries() to Object.prototype (non-enumerable) with integer key
    // conversion so plain CBOR-decoded objects work as drop-in Map replacements.
    if (!Object.prototype.entries) {
      Object.defineProperty(Object.prototype, 'entries', {
        value: function() {
          return Object.entries(this).map(([k, v]) => [
            /^-?\d+$/.test(k) ? parseInt(k, 10) : k,
            v,
          ])[Symbol.iterator]();
        },
        writable: true, configurable: true, enumerable: false,
      });
      dbg('Object.prototype.entries shim installed');
    }

    // Log OOB DataView reads to diagnose any remaining issues.
    const _origGU16 = _OrigDVProto.getUint16;
    _OrigDVProto.getUint16 = function(offset, le) {
      if (offset + 2 > this.byteLength)
        dbg('getUint16 OOB: offset=' + offset + ' byteLength=' + this.byteLength);
      return _origGU16.call(this, offset, le);
    };

    // ── Fix 2: getPublicKey() → COSE-derived DER ─────────────────────────────
    // CDP virtual authenticators return malformed DER from getPublicKey().
    // Re-build correct DER from the COSE key in getAuthenticatorData().
    function buildDerFromAuthData(authDataBuf) {
      const authData = new Uint8Array(authDataBuf);
      let offset = 53;
      const credIdLen = (authData[offset] << 8) | authData[offset + 1];
      offset += 2 + credIdLen;
      const cose = authData.subarray(offset);
      dbg('buildDer: credIdLen=' + credIdLen + ' cose.length=' + cose.length);
      let xi = -1, yi = -1;
      for (let i = 0; i < cose.length - 67; i++) {
        if (cose[i] === 0x21 && cose[i+1] === 0x58 && cose[i+2] === 0x20 &&
            cose[i+35] === 0x22 && cose[i+36] === 0x58 && cose[i+37] === 0x20) {
          xi = i + 3; yi = i + 38; break;
        }
      }
      if (xi < 0) return null;
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
      return der.buffer;
    }

    if (typeof AuthenticatorAttestationResponse !== 'undefined') {
      const proto = AuthenticatorAttestationResponse.prototype;
      const origGetPK = proto.getPublicKey;
      try {
        Object.defineProperty(proto, 'getPublicKey', {
          value: function() {
            dbg('getPublicKey called');
            const adBuf = _authDataRef.buf;
            if (adBuf) {
              try {
                const der = buildDerFromAuthData(adBuf);
                if (der) { dbg('getPublicKey → COSE-derived DER (91b)'); return der; }
              } catch (e) { dbg('buildDer error: ' + e.message); }
            }
            let nativePk = null;
            try { nativePk = origGetPK.call(this); } catch(e) {}
            dbg('getPublicKey → native (' + (nativePk?.byteLength ?? 'null') + 'b)');
            return nativePk;
          },
          writable: true, configurable: true,
        });
        dbg('getPublicKey patched');
      } catch (e) { dbg('getPublicKey patch FAILED: ' + e.message); }
    }

    // ── Fix 3: credentials.create() — synthetic authData + packed self-attestation ─
    // Generate a fresh P-256 keypair + 148-byte synthetic authData with a 16-byte
    // credId, replacing the CDP virtual authenticator's malformed output (64-byte
    // credId leaves only 45 bytes for the COSE key — too short for P-256 at ~77b).
    // Sign authData||SHA256(clientDataJSON) with the generated private key so that
    // II's packed-attestation verification passes on both client and canister side.

    function b64url(buf) {
      return btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    // Convert SubtleCrypto ECDSA output (P1363: r||s, 64 bytes) to DER SEQUENCE.
    function p1363ToDer(p1363Buf) {
      const a = new Uint8Array(p1363Buf);
      function encInt(b) {
        let i = 0; while (i < b.length - 1 && b[i] === 0) i++;
        b = b.slice(i);
        if (b[0] & 0x80) b = new Uint8Array([0, ...b]);
        return [0x02, b.length, ...b];
      }
      const r = encInt(a.slice(0, 32)), s = encInt(a.slice(32, 64));
      return new Uint8Array([0x30, r.length + s.length, ...r, ...s]).buffer;
    }

    function buildPackedAttestationCbor(authDataBuf, sigBuf) {
      function ct(s) { const b=[0x60|s.length]; for(let i=0;i<s.length;i++) b.push(s.charCodeAt(i)); return b; }
      function bstr(buf) {
        const n = new Uint8Array(buf).length;
        const p = n<=23?[0x40|n]:n<=255?[0x58,n]:[0x59,(n>>8)&0xff,n&0xff];
        return [...p, ...new Uint8Array(buf)];
      }
      // attStmt: {alg: -7, sig: sigBuf} — 0xa2=map(2), 0x26=CBOR -7 (ES256)
      const attStmt = [0xa2, ...ct('alg'), 0x26, ...ct('sig'), ...bstr(sigBuf)];
      const n = new Uint8Array(authDataBuf).length;
      const hdr = [0xa3, ...ct('fmt'), ...ct('packed'), ...ct('attStmt'), ...attStmt,
        ...ct('authData'), ...(n<=23?[0x40|n]:n<=255?[0x58,n]:[0x59,(n>>8)&0xff,n&0xff])];
      const result = new Uint8Array(hdr.length + n);
      result.set(hdr, 0); result.set(new Uint8Array(authDataBuf), hdr.length);
      return result.buffer;
    }

    const _origCreate = navigator.credentials.create.bind(navigator.credentials);
    navigator.credentials.create = async function(options) {
      dbg('credentials.create called');
      let cred;
      try { cred = await _origCreate(options); }
      catch (e) { dbg('credentials.create THREW: ' + e.message); throw e; }
      if (!cred || !cred.response) return cred;
      dbg('credentials.create returned type=' + cred.type);

      // Generate synthetic authData with a real P-256 key and a short 16-byte credId.
      let syntheticAuthData, privateKey, credId;
      try {
        const cdpAD = cred.response.getAuthenticatorData();
        const rpIdHash = cdpAD && cdpAD.byteLength >= 32
          ? new Uint8Array(cdpAD).slice(0, 32) : new Uint8Array(32);

        const kp = await crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']
        );
        privateKey = kp.privateKey;
        const raw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
        const x = raw.slice(1, 33), y = raw.slice(33, 65);

        credId = crypto.getRandomValues(new Uint8Array(16));
        const cose = new Uint8Array([
          0xa5, 0x01, 0x02, 0x03, 0x26, 0x20, 0x01,
          0x21, 0x58, 0x20, ...x,
          0x22, 0x58, 0x20, ...y,
        ]);

        const ad = new Uint8Array(55 + credId.length + cose.length);
        let off = 0;
        ad.set(rpIdHash, off); off += 32;
        ad[off++] = 0x45; // flags: UP | UV | AT
        off += 4; // signCount = 0
        off += 16; // aaguid = zeros
        ad[off++] = 0; ad[off++] = credId.length;
        ad.set(credId, off); off += credId.length;
        ad.set(cose, off);

        syntheticAuthData = ad.buffer;
        _authDataRef.buf = syntheticAuthData;
        dbg('synthetic authData: ' + ad.length + 'b (credIdLen=' + credId.length + ')');
      } catch (e) {
        dbg('synthetic authData FAILED: ' + e.message);
        try {
          const cdpAD = cred.response.getAuthenticatorData();
          if (cdpAD && cdpAD.byteLength > 0) {
            syntheticAuthData = cdpAD;
            _authDataRef.buf = cdpAD;
            dbg('CDP authData fallback: ' + cdpAD.byteLength + 'b');
          }
        } catch (e2) {}
      }

      if (!syntheticAuthData) return cred;

      // Build packed self-attestation: sign authData||SHA256(clientDataJSON) with
      // the private key whose public key is embedded in syntheticAuthData.
      let attestCbor;
      try {
        const cldHash = await crypto.subtle.digest('SHA-256', cred.response.clientDataJSON);
        const verifBuf = new Uint8Array(syntheticAuthData.byteLength + 32);
        verifBuf.set(new Uint8Array(syntheticAuthData), 0);
        verifBuf.set(new Uint8Array(cldHash), syntheticAuthData.byteLength);
        const sigP1363 = await crypto.subtle.sign(
          { name: 'ECDSA', hash: 'SHA-256' }, privateKey, verifBuf
        );
        const sigDer = p1363ToDer(sigP1363);
        dbg('packed sig: ' + new Uint8Array(sigDer).length + 'b');
        attestCbor = buildPackedAttestationCbor(syntheticAuthData, sigDer);
        dbg('intercepted attestationObject → packed CBOR');
      } catch (e) {
        dbg('packed attestation FAILED: ' + e.message);
      }

      if (!attestCbor) return cred;

      const synthAD = syntheticAuthData;
      const realResp = cred.response;
      const proxiedResp = new Proxy(realResp, {
        get(target, prop) {
          if (prop === 'attestationObject') return attestCbor;
          if (prop === 'getAuthenticatorData') return () => synthAD;
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        },
      });
      const credIdBuf = credId;
      cred = new Proxy(cred, {
        get(target, prop) {
          if (prop === 'response') return proxiedResp;
          if (prop === 'rawId' && credIdBuf) return credIdBuf.buffer;
          if (prop === 'id' && credIdBuf) return b64url(credIdBuf);
          const val = target[prop];
          return typeof val === 'function' ? val.bind(target) : val;
        },
      });
      dbg('credential wrapped: synthetic authData + packed self-attestation');
      return cred;
    };

    // ── Fix 4: credentials.get() — block conditional mediation ───────────────
    // II calls credentials.get({mediation:'conditional'}) during init for passkey
    // autofill. With automaticPresenceSimulation:true, the CDP authenticator would
    // auto-respond, disrupting the flow. Return null to block this.
    const _origGet = navigator.credentials.get.bind(navigator.credentials);
    navigator.credentials.get = async function(options) {
      dbg('credentials.get mediation=' + options?.mediation);
      if (options?.mediation === 'conditional') return null;
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
