# Central Dashboard — Architecture Shift Plan

> **Status:** Proposal
> **Branch:** `feat/dashboard-refactor`
> **Date:** 2026-02-26
> **Related:** [Canister Upgrade Advisory](./CANISTER_UPGRADE_ADVISORY.md)

---

## Overview

This document outlines a major architectural shift: from **per-dapp embedded dashboards** to a **single user-owned central dashboard canister** (My Canister Dashboard) that manages all of a user's dapps.

### Current Architecture

```
my-canister-app (installer)
  └─ installs a dapp (e.g. my-hello-world) → user owns it
     └─ dapp embeds dashboard UI (my-canister-dashboard crate)
     └─ dapp embeds management endpoints (II principal, top-up, origins)
     └─ dapp embeds asset serving (my-canister-frontend crate)
```

Each dapp is self-contained — it includes its own management interface, bundled into the WASM binary at compile time. The user interacts with each dapp separately.

### New Architecture

```
my-canister-app (installer)
  └─ installs ONE My Canister Dashboard canister → user owns it
     └─ dashboard connects to wasm-registry
     └─ dashboard installs/upgrades/manages dapps
     └─ dashboard handles snapshots and rollback
     └─ dashboard is the user's single management interface

user's dapps (hello-world, notepad, etc.)
  └─ pure application logic + asset serving
  └─ no embedded dashboard
  └─ managed externally by My Canister Dashboard
```

### Why This Shift

1. **Single point of management.** Users manage all dapps from one place instead of navigating to each dapp's embedded dashboard.
2. **Separation of concerns.** Dapp developers focus on application logic. Management complexity lives in My Canister Dashboard.
3. **Safer upgrades.** The dashboard is a separate canister that can orchestrate upgrades with snapshots and rollback — it doesn't break when the dapp it manages breaks.
4. **Solves the frontend lockout problem.** If a dapp upgrade breaks its frontend, My Canister Dashboard is unaffected and can restore a snapshot. This was the single biggest risk identified in the [Upgrade Advisory](./CANISTER_UPGRADE_ADVISORY.md).
5. **Lighter dapp WASMs.** Without the embedded dashboard UI and management code, dapps are smaller and simpler.
6. **One install flow.** The installer has one job: give the user their dashboard. Everything else flows from there.

---

## Scope and Decisions

### In Scope

- Design and build My Canister Dashboard canister (Rust backend + vanilla JS frontend)
- Refactor `my-canister-app` to install only the dashboard canister
- Refactor example dapps (`my-hello-world`, `my-notepad`) to work without embedded dashboard
- Define new naming conventions
- Define the controller/permission model between dashboard and managed dapps
- Implement upgrade orchestration with snapshot safety
- Update CI/CD, tests, and deployment scripts

### Deferred Decisions

- Whether to deprecate, repurpose, or keep `my-canister-dashboard` (the old embedded dashboard Rust crate), `my-canister-dashboard-js` (npm package), and `my-canister-frontend` (Rust crate) — evaluated in Phase 5 when we understand what can be reused.
- Auto-upgrade and guardian canister patterns — planned in the Upgrade Advisory, implemented after My Canister Dashboard is stable.

---

## Naming Conventions

The new central dashboard canister is called **My Canister Dashboard**. This is a new canister that lives in `canisters/my-canister-dashboard/` — not to be confused with the old `my-canister-dashboard` Rust crate in `packages-rs/my-canister-dashboard/`, which is the per-dapp embedded dashboard library. The old crate will be deprecated or repurposed as part of this refactor (evaluated in Phase 5).

| Current | Proposed | Notes |
|---------|----------|-------|
| `my-canister-app` | `my-canister-app` | Keeps existing name — it's the installer/onboarding app |
| _(new)_ | `my-canister-dashboard` (canister) | The central My Canister Dashboard canister in `canisters/` |
| `my-canister-dashboard` (crate in `packages-rs/`) | TBD | Old embedded dashboard crate — may be deprecated, slimmed to types-only, or absorbed |
| `my-canister-dashboard-js` (npm) | TBD | May be absorbed into dashboard frontend, or repurposed as dashboard client lib |
| `my-canister-frontend` (crate) | `my-canister-frontend` | Unchanged — dapps still need certified asset serving |
| `canister-dapp-test` | `canister-dapp-test` | Unchanged — still tests dapp WASMs |
| `vite-plugin-canister-dapp` | `vite-plugin-canister-dapp` | Unchanged |
| `wasm-registry` | `wasm-registry` | Unchanged |

---

## Controller and Permission Model

### Current Model

After installation, a dapp has controllers: `[canister_id, user_ii_principal_at_dapp_domain]`.

The user's II principal is derived from the dapp's domain (e.g., `<canister-id>.icp0.io`), and the user authenticates at that domain to manage the dapp via the embedded dashboard.

### New Model

```
My Canister Dashboard (user-owned)
  controllers: [dashboard_canister_id, user_ii_principal_at_dashboard_domain]

dapp-a (user-owned)
  controllers: [dapp_a_canister_id, dashboard_canister_id, user_ii_principal_at_dapp_domain]

dapp-b (user-owned)
  controllers: [dapp_b_canister_id, dashboard_canister_id, user_ii_principal_at_dapp_domain]
```

Key changes:

1. **Dashboard as controller of dapps.** The dashboard canister is added as a controller of each dapp it manages. This allows the dashboard to call IC management APIs on the dapp's behalf (install_code, stop/start, take/load snapshot).
2. **Dapp self-controller preserved.** Each dapp keeps itself as controller for self-management capabilities (e.g., timers, cycle checks).
3. **User's dapp-domain principal preserved.** The user can still interact directly with their dapp's frontend and guarded endpoints using their dapp-domain II principal.
4. **User authenticates at dashboard domain.** All management operations go through the dashboard, where the user is authenticated with their dashboard-domain II principal.

### Authentication Flow

```
User logs into My Canister Dashboard (II at dashboard domain)
  → dashboard knows user's dashboard-domain principal
  → dashboard is controller of user's dapps
  → dashboard calls IC management APIs on behalf of user
  → for dapp-specific calls (e.g., query dapp state), dashboard calls dapp as controller
```

The dashboard acts as an **authorized intermediary**: the user proves identity to the dashboard, and the dashboard (as controller) manages the dapps.

### Security Considerations

- The dashboard canister must validate that the caller is the authenticated user before performing management operations. This uses the same `only_ii_principal_guard` pattern as the current embedded dashboard.
- The user's II principal at the dashboard domain is stored in the dashboard's state.
- Dapps do not need to know about the dashboard — they just see it as a controller making authorized management calls.
- The user retains the ability to interact with their dapps directly (their dapp-domain II principal is still a controller), providing a fallback if the dashboard is ever unavailable.

---

## My Canister Dashboard — Feature Set

### Dapp Lifecycle Management

| Feature | Description |
|---------|-------------|
| **Browse registry** | Connect to wasm-registry, list available dapps with descriptions and versions |
| **Install dapp (default)** | Spawn a new canister and install the selected dapp wasm in one go — add dashboard as controller, configure II |
| **Install dapp on existing canister** | Install a dapp wasm onto an empty canister the user already owns |
| **View my dapps** | List all dapps managed by this dashboard with status overview |
| **Upgrade dapp** | Snapshot-safe upgrade flow (stop → snapshot → install → verify → start) |
| **Rollback dapp** | Restore a previous snapshot if upgrade went wrong |
| **Remove dapp** | Uninstall the dapp wasm from the canister, keeping the canister available for reuse |
| **Delete canister** | Delete an empty canister (no installed wasm) and recover its remaining cycles back to the dashboard |

### Per-Dapp Management (Current Dashboard Features, Relocated)

| Feature | Description |
|---------|-------------|
| **Canister status** | Cycles balance, memory usage, module hash, status |
| **Manual top-up** | Transfer ICP → mint cycles for a dapp |
| **Auto top-up rules** | Configure timer-based automatic cycles top-up per dapp |
| **Controllers** | View and manage controllers of a dapp |
| **Alternative origins** | Manage II alternative origins for a dapp |
| **Canister logs** | View dapp canister logs |
| **Wasm info** | Query dapp name, version, and metadata from the wasm registry |

### Snapshot Management

| Feature | Description |
|---------|-------------|
| **List snapshots** | Show all snapshots for a dapp (max 10 per canister) |
| **Take snapshot** | Stop dapp → take snapshot → start dapp |
| **Restore snapshot** | Stop dapp → load snapshot → start dapp |
| **Delete snapshot** | Remove old snapshots to free the slot |

### Dashboard Self-Management

| Feature | Description |
|---------|-------------|
| **Dashboard status** | View dashboard canister's own cycles, memory, status |
| **Dashboard top-up** | Top up dashboard's own cycles |
| **Dashboard upgrade** | Upgrade the dashboard itself (with snapshot safety — orchestrated from installer app as fallback) |

---

## Dapp Changes

### What Dapps Keep

- `my-canister-frontend` crate — certified asset serving, security headers, gzip
- Their own frontend (Svelte/React/vanilla) served at root path
- Application-specific endpoints (e.g., `greet`, CRUD operations)
- `init` and `post_upgrade` hooks for their own logic

### What Dapps Lose

- `my-canister-dashboard` crate dependency (no embedded dashboard UI)
- Management endpoints (`manage_ii_principal`, `manage_alternative_origins`, `manage_top_up_rule`)
- Guard functions (`only_ii_principal_guard`, `only_canister_controllers_guard`) — these move to the dashboard or are replaced by controller checks
- Dashboard asset routes (`/canister-dashboard/*`)

### What Dapps Gain

- Smaller WASM size (no dashboard UI bundle, no management code)
- Simpler backend code (just application logic + asset serving)
- Managed externally (upgrades, cycles, controllers handled by dashboard)

### Dapp Backend Template (Post-Refactor)

```rust
use my_canister_frontend::{setup_frontend, http_request};
use ic_cdk::{init, query};
use include_dir::{include_dir, Dir};

static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../frontend/dist");

#[init]
fn init() {
    setup_frontend(&FRONTEND_DIR).expect("failed to setup frontend");
}

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(request)
}

// Application endpoints — no guards needed, dashboard handles authorization
#[query]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
```

Note: The `only_ii_principal_guard` pattern may still be useful for dapps that want to restrict certain operations to the owner even when accessed directly (not via dashboard). This is evaluated per-dapp.

---

## Installer App Changes

### Current Flow (5 Steps)

1. Agree to terms
2. Fund account (ICP deposit)
3. Select dapp from registry → Create canister → Install wasm
4. Connect II at dapp domain (remote auth) → Set II principal → Set controllers
5. Success — link to dapp

### New Flow (Simplified)

1. Agree to terms
2. Fund account (ICP deposit)
3. Create canister → Install dashboard wasm
4. Connect II at dashboard domain (remote auth) → Set II principal → Set controllers
5. Success — link to My Canister Dashboard

The installer no longer shows the dapp store or dapp selection. It installs exactly one thing: My Canister Dashboard. The dashboard then becomes the user's interface for browsing the registry and installing dapps.

### What the Installer Keeps

- Account funding flow (ICP deposit, balance polling)
- Canister creation via CMC
- Wasm installation via IC management
- Remote authentication flow (II at dashboard domain)
- Controller handoff (dashboard_canister_id + user_ii_principal)
- Recovery from partial creation (localStorage)
- FAQ section

### What the Installer Loses

- Dapp store page (`/dapp-store`)
- Dapp selection UI
- Wasm registry browsing (moves to dashboard)
- My dapps page (`/my-dapps`) — moves to dashboard
- Ledger TX history lookup for canister install history — no longer needed since each user installs exactly one dashboard

### What the Installer Gains

- Simplicity — one wasm to install, one flow
- Dashboard upgrade fallback — the installer can show a "recovery" option for users whose dashboard is broken (restore snapshot from installer, similar to current upgrade advisory recommendation)

---

## Phase Plan

### Phase 0 — Foundation and Naming (Preparation)

**Goal:** Align on conventions and set up the dashboard canister scaffold.

**Tasks:**
- [ ] Create dashboard canister scaffold (`canisters/my-canister-dashboard/`) with Rust backend + vanilla JS frontend
- [ ] Add dashboard to `Cargo.toml` workspace members and `icp.yaml`
- [ ] Define Candid interface for dashboard ↔ dapp communication
- [ ] Set up dashboard frontend (vanilla JS, no framework)

**Depends on:** Nothing
**Output:** Empty dashboard canister that builds and deploys

### Phase 1 — Dashboard Core: Registry and Install

**Goal:** The dashboard can browse the wasm registry and install dapps.

**Tasks:**
- [ ] Implement registry connection (dashboard frontend calls wasm-registry canister)
- [ ] Build dapp store UI in dashboard (list dapps, show descriptions/versions)
- [ ] Implement dapp installation flow in dashboard:
  - Default: create canister + install wasm in one go
  - Install on existing canister: install wasm onto a user-owned empty canister
  - Add dashboard as controller of new/existing dapp canister
  - Store dapp reference in dashboard's state
- [ ] Build "my dapps" view — list managed dapps with basic status
- [ ] Handle cycles: dashboard needs ICP/cycles to create canisters on behalf of user
  - Option A: User funds the dashboard directly, dashboard pays for canister creation
  - Option B: User transfers ICP for each install (similar to current flow)
- [ ] Implement dapp metadata lookup — dashboard queries the wasm registry for name/version of managed dapps

**Depends on:** Phase 0
**Output:** Dashboard can install dapps from registry and list them

### Phase 2 — Dashboard Management Features

**Goal:** Port all current embedded dashboard management features to My Canister Dashboard, operating on managed dapps.

**Tasks:**
- [ ] Canister status panel — cycles, memory, module hash for each managed dapp
- [ ] Manual cycles top-up — transfer ICP → mint cycles for a managed dapp
- [ ] Auto top-up rules — configure per-dapp timer-based top-up (runs in dashboard)
- [ ] Controllers management — view/modify controllers of managed dapps
- [ ] Alternative origins management — manage II origins for managed dapps
- [ ] Canister logs — view logs for managed dapps
- [ ] Dashboard self-management panel — status, top-up for the dashboard itself
- [ ] Dapp removal — uninstall wasm from canister, keep canister for reuse
- [ ] Canister deletion — delete an empty canister and recover remaining cycles

**Design note:** Auto top-up rules move from individual dapps to the dashboard. The dashboard runs timers that check each managed dapp's cycles and tops them up as needed. This centralizes the ICP reserve in one place.

**Depends on:** Phase 1
**Output:** Feature parity with current per-dapp embedded dashboard, but centralized

### Phase 3 — Upgrade and Snapshot Safety

**Goal:** Implement safe upgrade and snapshot management per the [Upgrade Advisory](./CANISTER_UPGRADE_ADVISORY.md).

**Tasks:**
- [ ] Implement upgrade flow in dashboard:
  - Check registry for new version
  - Stop dapp → take snapshot → install new wasm (upgrade mode) → verify health → start dapp
  - On failure: load snapshot → start dapp → report error
- [ ] Build snapshot management UI:
  - List snapshots per dapp
  - Take manual snapshot
  - Restore snapshot
  - Delete snapshot
- [ ] Add health check endpoint to dapp template (basic HTTP check)
- [ ] Implement upgrade audit log (stored in dashboard's state)
- [ ] Handle edge cases:
  - Upgrade interrupted (browser closes mid-flow)
  - Snapshot limit reached (10 per canister)
  - Dapp doesn't respond after upgrade

**Depends on:** Phase 2 (needs management features)
**Output:** Safe, snapshot-backed upgrade flow for all managed dapps

### Phase 4 — Refactor Examples and Installer

**Goal:** Strip the embedded dashboard from example dapps and simplify the installer.

**Tasks:**
- [ ] Refactor `my-hello-world`:
  - Remove `my-canister-dashboard` crate dependency
  - Remove management endpoints and guards
  - Keep `my-canister-frontend` + application endpoints
  - Update frontend (remove dashboard link/navigation)
  - Add persistent state for application data if applicable
- [ ] Refactor `my-notepad`:
  - Same as above, plus ensure note storage persists across upgrades
- [ ] Update `canister-dapp-test` acceptance tests:
  - Remove dashboard-related assertions
  - Verify dapps work without embedded dashboard
- [ ] Refactor `my-canister-app` (installer):
  - Remove dapp store page
  - Remove my-dapps page
  - Hardcode dashboard wasm installation (or fetch latest dashboard wasm from registry)
  - Remove ledger TX history lookup (no longer needed — one dashboard per user)
  - Simplify install flow to dashboard-only
  - Add recovery/rollback option for broken dashboard (restore snapshot from installer)
- [ ] Update wasm-registry with dashboard wasm
- [ ] Update deployment scripts

**Depends on:** Phase 3 (dashboard must be fully functional before stripping dapps)
**Output:** Examples work as standalone dapps managed by My Canister Dashboard. Installer installs dashboard only.

### Phase 5 — Crate and Package Evaluation

**Goal:** Decide the fate of existing packages based on what the refactored architecture actually needs.

**Evaluation matrix:**

| Package | Options | Decision Criteria |
|---------|---------|-------------------|
| `my-canister-dashboard` (old crate) | Deprecate / Slim down to types-only / Repurpose as dapp-sdk | Does any code remain useful to dapp developers? |
| `my-canister-dashboard-js` (npm) | Deprecate / Repurpose as dashboard client lib | Is a JS client lib for the dashboard needed? |
| `my-canister-frontend` (crate) | Keep as-is | Dapps still need certified asset serving |
| `vite-plugin-canister-dapp` | Keep as-is | Dapps still use Vite |
| `canister-dapp-test` | Update assertions | Must test dapps without embedded dashboard |

**Tasks:**
- [ ] Evaluate each package against the new architecture
- [ ] Create migration guides if deprecating
- [ ] Update published packages (new major versions or deprecation notices)
- [ ] Update documentation and README files

**Depends on:** Phase 4
**Output:** Clean package landscape with clear purpose for each remaining package

### Phase 6 — CI/CD and Documentation

**Goal:** Update all infrastructure and documentation.

**Tasks:**
- [ ] Update `icp.yaml` — add dashboard canister to environments
- [ ] Update build scripts — add dashboard build to `build-all-wasm.sh`
- [ ] Update deploy scripts — deploy dashboard, upload dashboard wasm to registry
- [ ] Update E2E tests:
  - Dashboard installation test (installer → My Canister Dashboard)
  - Dashboard dapp management test (browse → install → manage → upgrade)
  - Dapp removal and canister reuse test
  - Canister deletion and cycle recovery test
  - Snapshot and rollback test
- [ ] Update `validate-and-test-all.sh` pipeline
- [ ] Update GitHub Actions workflows
- [ ] Write user documentation for My Canister Dashboard
- [ ] Update project README and CLAUDE.md

**Depends on:** Phase 5
**Output:** Fully tested, documented, and deployable new architecture

---

## Technical Considerations

### Cycles Economics

The dashboard needs cycles to create canisters and manage them. Two funding models:

**Model A — Dashboard as Cycles Bank:**
User deposits ICP into the dashboard. Dashboard holds ICP and pays for canister creation + management operations. Simpler UX (one deposit location), but the dashboard must manage funds.

**Model B — Per-Operation Funding:**
User transfers ICP for each operation (similar to current installer flow). More explicit, but requires ICP transfers for every install/top-up.

Recommendation: **Model A** for better UX. The dashboard already needs cycles for its own operation, and centralizing the ICP reserve simplifies auto top-up for managed dapps.

### Inter-Canister Communication

The dashboard interacts with:
- **IC Management Canister** — create canister, install code, uninstall code, delete canister, canister status, start/stop, snapshots
- **ICP Ledger** — balance, transfers (for cycles minting)
- **CMC** — notify_create_canister, notify_top_up, exchange rate
- **Wasm Registry** — list wasms, get wasm bytes
- **Managed Dapps** — health checks

All of these are standard inter-canister calls. The dashboard's Candid interface exposes update methods that the frontend calls, and the dashboard backend makes the cross-canister calls.

### State Management (Dashboard)

The dashboard stores its state in regular heap memory, persisted across upgrades via `pre_upgrade`/`post_upgrade` serialization (same pattern as the current dapps). Stable structures can be evaluated later if state grows large enough to warrant it.

Core state:

```rust
struct DappRecord {
    canister_id: Principal,
    name: String,
    wasm_hash: String,
    version: String,
    installed_at: u64,
    last_upgrade: Option<u64>,
    status: DappStatus, // Running, Stopped, UpgradeInProgress, Empty
}
```

Top-level state includes: user config (II principal, settings), managed dapps registry, top-up rules, upgrade audit log, and ICP reserve tracking.

### Frontend Architecture

The dashboard frontend is a vanilla JS app — no framework, no build step beyond bundling. This keeps the WASM size small and avoids framework churn.

```
frontend/
  index.html                — Dashboard overview (status, dapp count)
  js/
    app.js                  — Main entry point, routing, state management
    pages/
      dapps.js              — List managed dapps with status cards
      dapp-detail.js        — Individual dapp management (status, top-up, logs)
      dapp-upgrade.js       — Upgrade flow with snapshot safety
      dapp-snapshots.js     — Snapshot management
      store.js              — Browse wasm registry, install dapps
      settings.js           — Dashboard settings, self-management
  css/
    styles.css              — Dashboard styles
```

### Dapp Discovery and Verification

When the dashboard manages a dapp, it needs to:
1. **Discover**: Look up dapp name + version from the wasm registry using the module hash
2. **Verify**: Compare wasm module hash against registry to detect custom/unknown wasms
3. **Track**: Store canister ID + metadata in dashboard state

If a dapp's module hash is not found in the registry, the dashboard shows it as "unrecognized" but still allows basic management (status, cycles, controllers).

### Dashboard Self-Upgrade

The dashboard is itself a canister that may need upgrading. This is a bootstrapping problem:
- The dashboard can orchestrate its own upgrade via self-upgrade (`Call::oneway()` to `install_code`)
- But if the self-upgrade fails silently, the user needs a fallback
- **Fallback:** The installer app retains a "recover dashboard" feature — it can take a snapshot and upgrade/restore the dashboard from outside

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Dashboard canister compromise gives access to all dapps | Critical | Dashboard is user-owned (not shared). Each user has their own dashboard. Attack surface is per-user, not systemic. |
| Dashboard itself breaks after upgrade | High | Installer app has recovery option. Dashboard state persists via pre_upgrade/post_upgrade. IC auto-reverts on trap. |
| User loses access to dashboard | High | User's dapp-domain II principals still work as controllers. Direct dapp access remains possible. |
| Cycles accounting complexity | Medium | Start with Model A (dashboard as cycles bank). Keep accounting simple initially — no credit system, just direct ICP → cycles conversion. |
| Migration complexity for existing users | Medium | Not applicable yet — no production users. Examples are developer templates, not deployed instances. |
| Scope creep — dashboard becomes too complex | Medium | Strict phasing. Each phase delivers working software. Feature parity with current embedded dashboard before new features. |
| Inter-canister call failures | Medium | Retry logic, timeout handling, partial-state recovery (similar to current installer's pending canister flow). |

---

## Open Questions

1. **Multi-user dashboards:** Should a dashboard support multiple users (e.g., a shared team workspace)? Initially no — one dashboard per user. But the architecture should not preclude it.
2. **Dapp access control post-refactor:** If dapps lose `only_ii_principal_guard`, how do they restrict access? Options: rely on controller checks, or keep a lightweight guard.
3. **Dashboard discovery:** How does the user find their dashboard after initial install? Bookmark? A lookup from installer?
4. **Registry versioning for dashboard:** Should the dashboard wasm be in the same registry as dapps, or a separate channel?
