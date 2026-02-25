# Test Coverage Review & Improvement Plan

## Context

The my-canister-dapp monorepo has grown across multiple PRs with incremental test additions but no systematic review of overall coverage, consistency, or quality. This plan audits all existing tests (Rust unit, TS/JS unit, Playwright E2E) and identifies concrete improvements to close gaps, harden flaky tests, and improve the testing pipeline.

---

## Phase 1: Unit Test Coverage & Quality

### 1.1 Rust — `wasm-registry` crate (NO tests currently)

**File:** `canisters/wasm-registry/src/validation.rs`

Add `#[cfg(test)] mod tests` with:
- `validate_name()` — valid name, empty, too long (65 chars), uppercase, special chars, hyphens ok
- `validate_version()` — valid semver "1.0.0", missing patch "1.0", extra "1.0.0.0", non-numeric, empty
- `validate_wasm_bytes()` — valid bytes, empty vec, exactly 2 MB, over 2 MB

**File:** `canisters/wasm-registry/src/storage.rs`

Add tests for storage operations:
- Store and retrieve a WASM entry
- List WASMs returns latest versions
- Get specific version
- List all versions of a WASM
- Remove WASM clears all versions

**Estimated tests:** ~20

---

### 1.2 Rust — `my-canister-frontend` crate (NO tests currently)

**File:** `packages-rs/my-canister-frontend/src/asset_router.rs`

Add `#[cfg(test)] mod tests` with:
- `validate_asset()` — valid paths, path traversal ("../secret"), double slash ("//etc"), url-encoded traversal, no extension, disallowed extension (.exe), over max size, exactly max size, custom config extensions
- `is_compressible()` — html/js/css/json/svg → true, png/jpg/woff2 → false
- `FrontendConfig` defaults — verify `DEFAULT_ALLOWED_EXTENSIONS` list, `DEFAULT_MAX_FILE_SIZE` = 2MB
- `asset_router_configs()` — duplicate paths error, empty dir ok

**Estimated tests:** ~18

---

### 1.3 Rust — `my-canister-dashboard` gaps

**File:** `packages-rs/my-canister-dashboard/src/dashboard/alternative_origins.rs`

Add tests for `validate_alternative_origin()` directly:
- `https://example.com` — ok
- `http://localhost:8080` — ok
- `http://sub.localhost:8080` — ok
- `http://example.com` — reject (not localhost, not https)
- `http://localhost` — reject (no port)
- `ftp://example.com` — reject
- Empty string — reject
- Just a hostname — reject

**Estimated tests:** ~8

**File:** `packages-rs/my-canister-dashboard/src/dashboard/top_up_rule.rs`

Add tests for `compute_icp_needed_e8s()`:
- Normal conversion (known rate → expected e8s)
- Ceiling division rounding (verify rounds up, not down)
- Zero rate → error
- Very large cycles amount

**Estimated tests:** ~5

---

### 1.4 TypeScript — Dashboard frontend gaps

**File:** `packages-rs/my-canister-dashboard/frontend/test/utils.test.ts`

Verify/add edge cases for `isValidOrigin()`:
- `http://localhost` (no port) → false
- `http://example.com:8080` → false (not localhost)
- `https://` (empty host) → false
- Origin with trailing slash → test behavior
- Origin with path → test behavior
- `http://sub.sub.localhost:8080` → true (deep subdomain)

**Estimated tests:** ~6 new cases

---

### 1.5 TypeScript — MCA app utility gaps

**File:** `canisters/my-canister-app/src/lib/utils/__tests__/format.test.ts`

Verify edge cases:
- `formatIcpBalance(0n)` → "0.00000000 ICP"
- Very large balance (> 1B ICP)
- Exactly 1 ICP (100_000_000n)

**File:** `canisters/my-canister-app/src/lib/utils/__tests__/balance.test.ts`

Add:
- `calculateIcpFromCyclesRate` with very small rates (near-zero)
- Overflow scenarios with max BigInt values

**Estimated tests:** ~6 new cases

---

### 1.6 Pipeline improvement — Add `cargo test` coverage reporting

**File:** `scripts/run-test.sh` or new `scripts/run-test-unit.sh`

- Add `--` separator so individual crate test output is visible
- Consider adding `cargo-tarpaulin` or `cargo-llvm-cov` for coverage % on CI (optional, discuss)

---

### Phase 1 Summary

| Location | Current Tests | New Tests | Notes |
|----------|--------------|-----------|-------|
| `wasm-registry/validation.rs` | 0 | ~12 | Name, version, bytes validation |
| `wasm-registry/storage.rs` | 0 | ~8 | CRUD operations |
| `my-canister-frontend/asset_router.rs` | 0 | ~18 | Validation, compression, config |
| `dashboard/alternative_origins.rs` | 3 | +8 | Direct validation fn tests |
| `dashboard/top_up_rule.rs` | 18 | +5 | ICP conversion edge cases |
| Dashboard frontend `utils.test.ts` | ~30 | +6 | isValidOrigin edge cases |
| MCA `balance.test.ts` + `format.test.ts` | ~42 | +6 | Edge cases |
| **Total new unit tests** | | **~63** | |

---

## Phase 2: E2E Test Consistency & Quality

### 2.1 Timeout standardization

**Problem:** Inconsistent timeout strategy across specs — some use `test.setTimeout()`, others rely on default 30s, individual operations use ad-hoc values.

**Fix in `playwright.config.ts`:**
- Set global `timeout: 120_000` (2 min) for all projects — every test involves canister calls
- Remove per-test `test.setTimeout()` calls from `alternative-origins.spec.ts` and `install-dapp.spec.ts` since global covers them
- Keep operation-level `toPass()` timeouts as-is (they're appropriate per-operation)

---

### 2.2 Selector consistency

**Problem:** Mixed selector strategies — ID (`#foo`), class (`.bar`), role (`getByRole`), `data-testid`, `data-tid`.

**Fix:** Establish a selector priority and document it. No mass migration needed, but new tests should follow:
1. `data-tid` / `data-testid` (preferred — resilient to UI changes)
2. Role selectors (`getByRole`) for standard interactive elements
3. ID selectors as fallback for custom components

**Action:** Add comment header in `tests/README.md` or `tests/canister-dashboard-frontend/shared.ts` documenting selector conventions.

---

### 2.3 Shared utility improvements

**File:** `tests/canister-dashboard-frontend/shared.ts`

Add:
- `waitForAuthenticatedContent(page)` — consolidate the `#authenticated-content` wait pattern used in login.ts + topup.spec.ts
- `parseNumericText(text)` — extract and parse numbers from display strings (used in topup.spec.ts with ad-hoc regex)

**File:** `tests/canister-dashboard-frontend/login.ts`

- Extract `checkPrincipal()` ICRC1 account verification into shared utility (reusable across future tests)

---

### 2.4 Missing E2E coverage

**New test: `tests/canister-dashboard-frontend/theme.spec.ts`**
- Verify light/dark toggle works
- Verify system preference detection
- This was added in v0.11.0 but has no E2E test

**New test: `tests/canister-dashboard-frontend/logs.spec.ts`**
- Dedicated log viewing test (currently only tested as side-effect in `topup-rule.spec.ts`)
- Verify log entries render, refresh button works, log order is correct

**Extend: `tests/canister-dashboard-frontend/controllers.spec.ts`**
- Add negative case: attempt to add invalid principal (non-principal text)
- Verify error feedback is shown

**Extend: `tests/canister-dashboard-frontend/alternative-origins.spec.ts`**
- Add negative case: attempt to add invalid origin (e.g., `http://example.com` — no https, not localhost)
- Verify error message appears and input is cleared

---

### 2.5 E2E test isolation & resilience

**Problem:** Tests run sequentially and can leave state (added controllers, origins) that affects subsequent runs.

**Fix:** Each test that adds data should clean up after itself. Current tests already do add-then-remove cycles, which is good. Verify:
- `controllers.spec.ts` — already cleans up (add + remove loop) ✓
- `alternative-origins.spec.ts` — already cleans up (add + remove loop) ✓
- `topup-rule.spec.ts` — sets rule then clears it ✓
- `topup.spec.ts` — adds cycles (not reversible, but doesn't affect other tests) ✓

No action needed here — existing pattern is solid.

---

### 2.6 Console error monitoring

**Add to all dashboard E2E tests:**
```ts
const consoleErrors: string[] = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
// ... test body ...
expect(consoleErrors).toEqual([]);
```

This catches uncaught errors, failed network requests, and console.error calls that might indicate silent failures. Add as shared utility in `shared.ts`.

---

### Phase 2 Summary

| Change | Files | Impact |
|--------|-------|--------|
| Global timeout in playwright config | `playwright.config.ts` | Consistency, remove per-test overrides |
| Selector convention docs | `tests/canister-dashboard-frontend/shared.ts` | Developer guidance |
| Shared utilities (auth wait, numeric parse) | `shared.ts`, `login.ts` | DRY, reuse |
| Theme toggle E2E test | New `theme.spec.ts` | Coverage for v0.11.0 feature |
| Logs E2E test | New `logs.spec.ts` | Dedicated log coverage |
| Negative cases (controllers, origins) | Extend existing specs | Error path coverage |
| Console error monitoring | `shared.ts` + all specs | Silent failure detection |

---

## Files Touched (Complete)

### Phase 1 (Unit Tests)
| File | Action |
|------|--------|
| `canisters/wasm-registry/src/validation.rs` | ADD test module |
| `canisters/wasm-registry/src/storage.rs` | ADD test module |
| `packages-rs/my-canister-frontend/src/asset_router.rs` | ADD test module |
| `packages-rs/my-canister-dashboard/src/dashboard/alternative_origins.rs` | EXTEND test module |
| `packages-rs/my-canister-dashboard/src/dashboard/top_up_rule.rs` | EXTEND test module |
| `packages-rs/my-canister-dashboard/frontend/test/utils.test.ts` | EXTEND |
| `canisters/my-canister-app/src/lib/utils/__tests__/balance.test.ts` | EXTEND |
| `canisters/my-canister-app/src/lib/utils/__tests__/format.test.ts` | EXTEND |

### Phase 2 (E2E Tests)
| File | Action |
|------|--------|
| `playwright.config.ts` | MODIFY (global timeout) |
| `tests/canister-dashboard-frontend/shared.ts` | EXTEND (utilities, console monitor, docs) |
| `tests/canister-dashboard-frontend/login.ts` | REFACTOR (extract shared util) |
| `tests/canister-dashboard-frontend/theme.spec.ts` | CREATE |
| `tests/canister-dashboard-frontend/logs.spec.ts` | CREATE |
| `tests/canister-dashboard-frontend/controllers.spec.ts` | EXTEND (negative case) |
| `tests/canister-dashboard-frontend/alternative-origins.spec.ts` | EXTEND (negative case) |
| `tests/my-canister-app/install-dapp.spec.ts` | MODIFY (remove per-test timeout) |
| `tests/canister-dashboard-frontend/alternative-origins.spec.ts` | MODIFY (remove per-test timeout) |

---

## Verification

### Phase 1
```bash
cargo test --workspace          # All Rust unit tests pass
npm run test -ws                # All TS/JS unit tests pass (vitest)
```

### Phase 2
```bash
./validate-and-test-all.sh      # Full pipeline including E2E
```

### Both Phases
- No regressions in existing tests
- New tests cover identified gaps
- CI (GitHub Actions) passes on PR

---

## Execution Order

1. **Phase 1 first** — unit tests are fast to write, run, and iterate on
2. **Phase 2 second** — E2E changes require full canister deployment to validate
3. One PR per phase, or combined if changes are small enough
