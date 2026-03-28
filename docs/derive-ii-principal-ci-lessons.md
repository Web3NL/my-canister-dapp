# Lessons Learned: `dapp derive-ii-principal` on Headless Linux CI

## What the command does

`dapp derive-ii-principal <origin>` opens a headless Playwright/Chromium browser,
navigates to a page at the canister origin, triggers an II login popup, clicks
through the II UI, and writes the derived principal to stdout. Called 4× in
`04-deploy.sh` to set controllers on freshly created canisters.

---

## Root cause: icp-cli 0.2.1 config bug (not an II update)

`icp-cli` bundles a dev build of Internet Identity that has **DUMMY_AUTH compiled
in** (`pP=!0` build flag). In DUMMY_AUTH mode, the II auth class is always `ga`
(a pure software Ed25519 key), which never calls any WebAuthn APIs. No platform
authenticator is needed.

However, `icp-cli` 0.2.1 deploys this canister with a buggy config:

```
dummy_auth = opt null          ← icp-cli 0.2.1 (WRONG: Some(None))
dummy_auth = opt opt {...}     ← correct would be Some(Some({...}))
```

The II bundle checks: `Vr.dummy_auth[0]?.[0] !== void 0`

- With `opt null` (Some(None)): `Vr.dummy_auth[0]` is `None`/`undefined` → check is `false` → **real WebAuthn path** (`ps` class, calls `credentials.create()`)
- With `opt opt {...}` (Some(Some({...}))): check is `true` → **DUMMY_AUTH path** (`ga` class, pure software)

On headless Linux, `credentials.create()` throws `NotSupportedError`. That's the
entire failure. The bundle has DUMMY_AUTH capability; the config bug disables it.

**This is not an II version change.** The same bug exists in all icp-cli 0.2.x
releases. The CI used a slightly newer II build than local (`start.xYiFCL5p.js`
vs `start.CggNA08c.js`), but both have the same config bug.

---

## The fix

Patch the II JS bundle in the `context.route()` proxy handler to force the
DUMMY_AUTH check to `true`:

```javascript
// In context.route() after decompressing the response body:
const p = url.pathname;
if (p.includes('/_app/immutable/entry/start') && p.endsWith('.js')) {
  let src = body.toString('utf8');
  // Force DUMMY_AUTH — bypasses all real WebAuthn, uses pure Ed25519 software key
  src = src.replaceAll('Vr.dummy_auth[0]?.[0]!==void 0?', 'true?');
  // Unique seed per invocation so each call registers a fresh credential;
  // avoids "credential already registered" conflicts across the 4 CLI calls
  src = src.replace('return BigInt(0)}', 'return BigInt(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER))}');
  body = Buffer.from(src, 'utf8');
}
```

With DUMMY_AUTH active, no `credentials.create()` or `credentials.get()` is ever
called. The entire CDP virtual authenticator approach (which dominated earlier
debugging sessions) was unnecessary.

---

## Remaining CI patches (environment workarounds only)

These fix headless Linux environment gaps. They do not change II auth logic.

### 1 — DNS: `*.localhost` doesn't resolve

**Problem**: Chromium's sandboxed network service on Linux doesn't resolve
`*.localhost` subdomains. PocketIC canisters live at `<id>.localhost:8080`.

**Fix**: `context.route()` intercepts all `*.localhost` requests and proxies them
via Node.js `http.request()` to `127.0.0.1`, preserving the `Host` header so
PocketIC routes to the right canister.

**Why not `--host-resolver-rules` alone?** The Chrome flag works for browser
requests but not for Playwright's `route.fetch()`, which runs in Node.js and uses
OS DNS. Since we need to patch the bundle anyway, the Node.js proxy handles both.

### 2 — Gzip: `route.fulfill()` doesn't decompress

**Problem**: PocketIC serves gzip/brotli assets. `route.fulfill()` passes the
raw bytes to Chrome with hop-by-hop headers stripped; Chrome tries to parse
compressed bytes as JS and throws "Invalid or unexpected token".

**Fix**: Decompress in Node.js (`zlib.gunzipSync`, `brotliDecompressSync`) before
calling `route.fulfill()`, and strip all hop-by-hop headers.

### 3 — `isUserVerifyingPlatformAuthenticatorAvailable()` returns false

**Problem**: Newer II builds (icp-cli 0.2.1's `start.xYiFCL5p.js`) gate the
"Create new identity" button on this returning `true`. Headless Linux returns
`false`, leaving the button disabled even after DUMMY_AUTH is forced.

**Fix**: `addInitScript` overrides the API to return `Promise.resolve(true)` before
any page JS runs. Must be synchronous (before II's SvelteKit boot code), which is
why `addInitScript` is used rather than a post-load patch.

### 4 — `credentials.get()` throws `NotSupportedError`, freezes UI

**Problem**: The II `/authorize` page calls `credentials.get({allowCredentials: []})`
on mount for passkey autofill. On headless Linux this throws `NotSupportedError`,
which propagates up and blocks the UI from rendering buttons.

**Fix**: `addInitScript` replaces `navigator.credentials.get` with a function that
rejects with `NotAllowedError`. II treats this as "no passkeys found" and renders
the UI normally.

---

## The dead end: CDP virtual authenticators

Earlier debugging sessions spent significant time building a CDP virtual
authenticator approach: intercept `credentials.create()`, synthesise a valid
WebAuthn attestation object with correct CBOR, DER signatures, authData layout,
etc. (9 layers of patches). **This was entirely unnecessary.**

The clue that should have ended this earlier: `icp-cli` ships a *dev* II build.
Dev builds never need real WebAuthn. If you're patching CBOR decoders and
generating synthetic ECDSA signatures, you're on the wrong path.

**Rule**: Before adding any WebAuthn workaround for local II dev, confirm
`dummy_auth` is active. If DUMMY_AUTH is supposed to be on but isn't, the config
is wrong — fix the config (or patch the check), don't simulate WebAuthn.

---

## 4-call credential conflict

`04-deploy.sh` calls `derive-ii-principal` 4× against the same running II
canister. Without the random seed patch, all 4 calls would derive the same
Ed25519 key (seed 0 → 32 zero bytes credential ID). The first call registers it;
calls 2–4 fail with "credential already registered".

The `vz()` random seed patch ensures each CLI invocation creates a unique
credential, so all 4 calls succeed independently.

For Playwright E2E tests the same issue applies: each test gets a fresh browser
context (no II session) but shares the same II canister. A per-context random
seed (generated once in the `tests/fixtures.ts` fixture) prevents conflicts
between tests while allowing the second II popup within the same test to reuse
the existing session ("Continue" appears directly).

---

## Files changed

| File | Purpose |
|------|---------|
| `packages-rs/my-canister-dapp-cli/playwright-js/derive-principal.mjs` | CLI: all 4 patches above |
| `tests/fixtures.ts` | E2E tests: same 4 patches as a Playwright test fixture |
| `tests/ii-helpers.ts` | Simplified II popup flow (CWP → "Create new identity" directly) |

---

## E2E launcher tests: `derivationOrigin` flow (second II popup)

The icp-dapp-launcher tests have a second II popup triggered by "Connect II to Dapp".
This popup uses `derivationOrigin` so that II derives the principal the user will have
when visiting their canister directly (the ownership handoff mechanism).

### Additional patch 5 — `u7()` DUMMY_AUTH boolean check (second popup only)

**Problem**: The second II popup (triggered by "Connect II to Dapp") starts with
`$isAuthenticatedStore = false` — it's a fresh window with no existing session.
This means the z() "Continue" handler in `hq()` calls `U.authenticate(i().selected)`
instead of short-circuiting. `e0.authenticate()` sees `"passkey" in t.authMethod`
→ calls `u7()`.

`u7()` contains a **boolean assignment** form of the DUMMY_AUTH check:

```javascript
const s=Vr.dummy_auth[0]?.[0]!==void 0;let o;const a=s?ga.useExisting():ps.useExisting(
```

The `replaceAll('Vr.dummy_auth[0]?.[0]!==void 0?', 'true?')` patch only covers the
**ternary** form (5 occurrences, all have a trailing `?`). The boolean assignment in
`u7()` has no trailing `?`, so `replaceAll` silently skips it. `s` stays `false`,
`ps.useExisting()` is called (real WebAuthn), which calls `credentials.get()`,
which our `addInitScript` patch rejects with `NotAllowedError`. The error is silently
caught by z(), shows a toast, `authorize-client-success` is never sent, `AuthClient.login()`
hangs forever, and the busy overlay never clears.

Full call chain in the second popup:
```
z() → U.authenticate() → e0.authenticate() → u7() → ps.useExisting()
  → credentials.get() → NotAllowedError (our addInitScript)
  → z() catch → toast only → authorize-client-success never sent
  → AuthClient.login() hangs → finally/stopBusy never runs → busy overlay persists
```

**Fix**: Add a targeted `replace()` after the `replaceAll()` to cover the boolean form:

```javascript
src = src.replaceAll('Vr.dummy_auth[0]?.[0]!==void 0?', 'true?');
src = src.replace(
  'Vr.dummy_auth[0]?.[0]!==void 0;let o;const a=s?ga.useExisting():ps.useExisting(',
  'true;let o;const a=s?ga.useExisting():ps.useExisting('
);
```

**Why the first popup doesn't hit this**: After `handleIIPopup` creates a new identity,
`$isAuthenticatedStore` becomes `true`. On second mount (the "Continue" flow),
`o() === true` causes `hq()` to skip `U.authenticate()` entirely and call
`prepare_account_delegation` directly. So u7() is never reached in the first popup's
second-phase click.

### Additional patch 6 — `Unverified origin` in II's `Rm()` validator

**Problem**: II v2's `handleRequest` calls `Rm({requestOrigin, derivationOrigin})`
before showing the auth UI. `Rm()` fetches:

```
http://localhost:8080/.well-known/ii-alternative-origins?canisterId=<new-canister-id>
```

(URL built by `nO()` which uses `window.location.hostname` = `*.localhost`.)

The fetch option is `{redirect:"error"}`. PocketIC's HTTP gateway redirects
`localhost:8080?canisterId=` requests, which causes the fetch to throw. The `catch`
block returns `{result:"invalid"}` → `throw new Error("Unverified origin")` → the
auth UI never renders.

**Key insight**: The alternative origins ARE correctly set on the canister by
`addInstallerOrigin()` before the popup opens. The problem is purely in how II
fetches them (wrong URL format for our PocketIC setup). Origin security doesn't
apply in DUMMY_AUTH mode anyway.

**Fix**: Add a third bundle patch after the DUMMY_AUTH and seed patches:

```javascript
// Bypass derivationOrigin origin-check: Rm() fetch fails in PocketIC local env
src = src.replace(
  '.result==="invalid")throw new Error("Unverified origin")',
  '.result==="__bypassed__")throw new Error("Unverified origin")'
);
```

This makes the condition permanently false (Rm() never returns `"__bypassed__"`),
so `throw new Error("Unverified origin")` never fires. `tp.set({authRequest})` is
then called normally and the auth UI renders.

**How to find the pattern**: `curl -s http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080/_app/immutable/entry/start.*.js | gunzip | grep -o '.\{120\}Unverified origin.\{120\}'`

### Additional patch 7 — `fetchRootKey` cross-origin failure

**Problem**: The dapp store page initialises a `WasmRegistryApi` agent with
`host: 'http://localhost:8080'` (baked in at build time when `PROD=false`).
`fetchRootKey()` calls `window.fetch('http://localhost:8080/api/v2/status')`.
This is cross-origin from `*.localhost:8080` and either fails CORS or hits IPv6
vs IPv4 (`::1` vs `127.0.0.1`).

**Fix**: Extend the `context.route()` filter to also intercept plain `localhost`:

```typescript
// Before: only *.localhost
(url) => url.hostname.endsWith('.localhost')
// After: also plain localhost
(url) => url.hostname === 'localhost' || url.hostname.endsWith('.localhost')
```

Also add `MAP localhost 127.0.0.1` to `--host-resolver-rules` in `playwright.config.ts`
as belt-and-suspenders for cases where Chrome bypasses the route handler.

### Additional fix — popup race condition + missing busy-wait (test-level, not bundle)

**Problem 1 (race)**: Both tests registered `page.waitForEvent('popup')` AFTER
clicking "Connect II to Dapp". If the `AuthClient.login()` → `window.open()` call
happens synchronously or very quickly, the popup event fires before the listener is
registered and Playwright misses it. `handleIIPopup` then runs on the wrong popup
(or the promise hangs), and the real II popup never gets its "Continue" clicked.

**Fix**: Always register the popup listener BEFORE the click:

```typescript
// WRONG — race condition:
await page.click('Connect II to Dapp');
const popupPromise = page.waitForEvent('popup');

// CORRECT:
const popupPromise = page.waitForEvent('popup');
await page.click('Connect II to Dapp');
```

**Problem 2 (missing busy-wait)**: After `handleIIPopup` returns, the launcher
still performs canister calls (`setIIPrincipal`, `setControllers` or `finalizeDemo`).
These run inside a `busyStore.startBusy('connect-ii')` scope. The busy overlay
(`div[data-tid="busy"]`) intercepts all pointer events until `stopBusy` fires in the
`finally` block. Without an explicit wait, `page.click('My Dapps')` retries for the
entire remaining test timeout and fails.

**Fix**: Wait for the busy overlay to hide before navigating:

```typescript
await handleIIPopup(iiPopup);
await page.locator('[data-tid="busy"]').waitFor({ state: 'hidden', timeout: 90_000 });
await page.getByRole('menuitem', { name: 'My Dapps' }).click();
```

**Why `AuthClient.login()` hangs without the race fix**: `@icp-sdk/auth/client`'s
`AuthClient.login()` opens a popup and awaits `{kind:"authorize-client-success"}`
via `window.addEventListener("message", ...)`. If the II popup was missed (wrong
popup captured), `authorize-client-success` is never received, `remoteAuth()` never
resolves, and the `finally { stopBusy() }` block never runs → busy overlay persists
for the full 120s test timeout.

---

## Files changed (complete list)

| File | Purpose |
|------|---------|
| `packages-rs/my-canister-dapp-cli/playwright-js/derive-principal.mjs` | CLI: DUMMY_AUTH + seed + DNS proxy patches |
| `tests/fixtures.ts` | E2E tests: DUMMY_AUTH (ternary + u7 boolean) + seed + Unverified-origin + NoSuchOrigin + fetchRootKey proxy patches |
| `tests/ii-helpers.ts` | II popup flow handler (CWP → Create new identity, or Continue directly) |
| `playwright.config.ts` | `--host-resolver-rules` for both `*.localhost` and `localhost` |
| `tests/icp-dapp-launcher/install-dapp.spec.ts` | Race fix + busy-wait after second II popup |
| `tests/icp-dapp-launcher/install-demo.spec.ts` | Race fix + busy-wait after second II popup |
