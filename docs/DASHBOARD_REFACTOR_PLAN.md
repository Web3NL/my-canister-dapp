# Central Dashboard — Architecture Shift Plan

> **Status:** Proposal
> **Branch:** `feat/dashboard-refactor`
> **Date:** 2026-02-26
> **Related:** [Canister Upgrade Advisory](./CANISTER_UPGRADE_ADVISORY.md)

---

## Overview

This document outlines a major architectural shift: from **per-dapp embedded dashboards** to a **single user-owned central dashboard canister** that manages all of a user's dapps.

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
  └─ installs ONE central dashboard canister → user owns it
     └─ dashboard connects to wasm-registry
     └─ dashboard installs/upgrades/manages dapps
     └─ dashboard handles snapshots and rollback
     └─ dashboard is the user's single management interface

user's dapps (hello-world, notepad, etc.)
  └─ pure application logic + asset serving
  └─ no embedded dashboard
  └─ managed externally by central dashboard
```

### Why This Shift

1. **Single point of management.** Users manage all dapps from one place instead of navigating to each dapp's embedded dashboard.
2. **Separation of concerns.** Dapp developers focus on application logic. Management complexity lives in the central dashboard.
3. **Safer upgrades.** The dashboard is a separate canister that can orchestrate upgrades with snapshots and rollback — it doesn't break when the dapp it manages breaks.
4. **Solves the frontend lockout problem.** If a dapp upgrade breaks its frontend, the central dashboard is unaffected and can restore a snapshot. This was the single biggest risk identified in the [Upgrade Advisory](./CANISTER_UPGRADE_ADVISORY.md).
5. **Lighter dapp WASMs.** Without the embedded dashboard UI and management code, dapps are smaller and simpler.
6. **One install flow.** The installer has one job: give the user their dashboard. Everything else flows from there.

---

## Scope and Decisions

### In Scope

- Design and build the central dashboard canister (Rust backend + SvelteKit frontend)
- Refactor `my-canister-app` to install only the dashboard canister
- Refactor example dapps (`my-hello-world`, `my-notepad`) to work without embedded dashboard
- Define new naming conventions
- Define the controller/permission model between dashboard and managed dapps
- Implement upgrade orchestration with snapshot safety
- Update CI/CD, tests, and deployment scripts

### Deferred Decisions

- Whether to deprecate, repurpose, or keep `my-canister-dashboard` (Rust crate), `my-canister-dashboard-js` (npm package), and `my-canister-frontend` (Rust crate) — evaluated at the end of Phase 2 when we understand what can be reused.
- Exact naming conventions — proposed below, finalized in Phase 1.
- Auto-upgrade and guardian canister patterns — planned in the Upgrade Advisory, implemented after the central dashboard is stable.

---

## Naming Conventions (Proposal)

The project and package names need updating to reflect the new architecture. Working proposal:

| Current | Proposed | Notes |
|---------|----------|-------|
| `my-canister-app` | `my-canister-app` | Keeps existing name — it's the installer/onboarding app |
| _(new)_ | `my-canister-hub` | The central dashboard canister. "Hub" conveys central management without overloading "dashboard" |
| `my-canister-dashboard` (crate) | TBD | May be partially absorbed into hub, partially into a dapp-sdk crate |
| `my-canister-dashboard-js` (npm) | TBD | May be absorbed into hub frontend, or repurposed as hub client lib |
| `my-canister-frontend` (crate) | `my-canister-frontend` | Unchanged — dapps still need certified asset serving |
| `canister-dapp-test` | `canister-dapp-test` | Unchanged — still tests dapp WASMs |
| `vite-plugin-canister-dapp` | `vite-plugin-canister-dapp` | Unchanged |
| `wasm-registry` | `wasm-registry` | Unchanged |

The name `my-canister-hub` is a working name. Alternatives considered: `my-canister-console`, `my-canister-control`, `my-canister-manager`. Final name decided in Phase 1.

---

## Controller and Permission Model

### Current Model

After installation, a dapp has controllers: `[canister_id, user_ii_principal_at_dapp_domain]`.

The user's II principal is derived from the dapp's domain (e.g., `<canister-id>.icp0.io`), and the user authenticates at that domain to manage the dapp via the embedded dashboard.

### New Model

```
my-canister-hub (user-owned)
  controllers: [hub_canister_id, user_ii_principal_at_hub_domain]

dapp-a (user-owned)
  controllers: [dapp_a_canister_id, hub_canister_id, user_ii_principal_at_dapp_domain]

dapp-b (user-owned)
  controllers: [dapp_b_canister_id, hub_canister_id, user_ii_principal_at_dapp_domain]
```

Key changes:

1. **Hub as controller of dapps.** The hub canister is added as a controller of each dapp it manages. This allows the hub to call IC management APIs on the dapp's behalf (install_code, stop/start, take/load snapshot).
2. **Dapp self-controller preserved.** Each dapp keeps itself as controller for self-management capabilities (e.g., timers, cycle checks).
3. **User's dapp-domain principal preserved.** The user can still interact directly with their dapp's frontend and guarded endpoints using their dapp-domain II principal.
4. **User authenticates at hub domain.** All management operations go through the hub, where the user is authenticated with their hub-domain II principal.

### Authentication Flow

```
User logs into hub (II at hub domain)
  → hub knows user's hub-domain principal
  → hub is controller of user's dapps
  → hub calls IC management APIs on behalf of user
  → for dapp-specific calls (e.g., query dapp state), hub calls dapp as controller
```

The hub acts as an **authorized intermediary**: the user proves identity to the hub, and the hub (as controller) manages the dapps.

### Security Considerations

- The hub canister must validate that the caller is the authenticated user before performing management operations. This uses the same `only_ii_principal_guard` pattern as the current dashboard.
- The user's II principal at the hub domain is stored in the hub's stable memory.
- Dapps do not need to know about the hub — they just see it as a controller making authorized management calls.
- The user retains the ability to interact with their dapps directly (their dapp-domain II principal is still a controller), providing a fallback if the hub is ever unavailable.

---

## Central Dashboard (Hub) — Feature Set

### Dapp Lifecycle Management

| Feature | Description |
|---------|-------------|
| **Browse registry** | Connect to wasm-registry, list available dapps with descriptions and versions |
| **Install dapp** | Create canister, install wasm, add hub as controller, configure II |
| **View my dapps** | List all dapps managed by this hub with status overview |
| **Upgrade dapp** | Snapshot-safe upgrade flow (stop → snapshot → install → verify → start) |
| **Rollback dapp** | Restore a previous snapshot if upgrade went wrong |
| **Remove dapp** | Stop and optionally delete a managed dapp canister |

### Per-Dapp Management (Current Dashboard Features, Relocated)

| Feature | Source |
|---------|--------|
| **Canister status** | Cycles balance, memory usage, module hash, status |
| **Manual top-up** | Transfer ICP → mint cycles for a dapp |
| **Auto top-up rules** | Configure timer-based automatic cycles top-up per dapp |
| **Controllers** | View and manage controllers of a dapp |
| **Alternative origins** | Manage II alternative origins for a dapp |
| **Canister logs** | View dapp canister logs |
| **Wasm status** | Query dapp's wasm_status endpoint (name, version, memo) |

### Snapshot Management

| Feature | Description |
|---------|-------------|
| **List snapshots** | Show all snapshots for a dapp (max 10 per canister) |
| **Take snapshot** | Stop dapp → take snapshot → start dapp |
| **Restore snapshot** | Stop dapp → load snapshot → start dapp |
| **Delete snapshot** | Remove old snapshots to free the slot |

### Hub Self-Management

| Feature | Description |
|---------|-------------|
| **Hub status** | View hub canister's own cycles, memory, status |
| **Hub top-up** | Top up hub's own cycles |
| **Hub upgrade** | Upgrade the hub itself (with snapshot safety — orchestrated from installer app as fallback) |

---

## Dapp Changes

### What Dapps Keep

- `my-canister-frontend` crate — certified asset serving, security headers, gzip
- Their own frontend (Svelte/React/vanilla) served at root path
- Application-specific endpoints (e.g., `greet`, CRUD operations)
- `wasm_status` query endpoint — the hub calls this to check dapp name/version
- `init` and `post_upgrade` hooks for their own logic

### What Dapps Lose

- `my-canister-dashboard` crate dependency (no embedded dashboard UI)
- Management endpoints (`manage_ii_principal`, `manage_alternative_origins`, `manage_top_up_rule`)
- Guard functions (`only_ii_principal_guard`, `only_canister_controllers_guard`) — these move to the hub or are replaced by controller checks
- Dashboard asset routes (`/canister-dashboard/*`)

### What Dapps Gain

- Smaller WASM size (no dashboard UI bundle, no management code)
- Simpler backend code (just application logic + asset serving)
- Managed externally (upgrades, cycles, controllers handled by hub)

### Dapp Backend Template (Post-Refactor)

```rust
use my_canister_frontend::{setup_frontend, http_request};
use my_canister_dashboard::WasmStatus; // just the type, not the full crate
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

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Hello World".to_string(),
        version: "1.0.0".to_string(),
        memo: None,
    }
}

// Application endpoints — no guards needed, hub handles authorization
#[query]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
```

Note: The `only_ii_principal_guard` pattern may still be useful for dapps that want to restrict certain operations to the owner even when accessed directly (not via hub). This is evaluated per-dapp.

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
3. Create canister → Install hub wasm
4. Connect II at hub domain (remote auth) → Set II principal → Set controllers
5. Success — link to hub

The installer no longer shows the dapp store or dapp selection. It installs exactly one thing: the hub. The hub then becomes the user's interface for browsing the registry and installing dapps.

### What the Installer Keeps

- Account funding flow (ICP deposit, balance polling)
- Canister creation via CMC
- Wasm installation via IC management
- Remote authentication flow (II at hub domain)
- Controller handoff (hub_canister_id + user_ii_principal)
- Recovery from partial creation (localStorage)
- FAQ section

### What the Installer Loses

- Dapp store page (`/dapp-store`)
- Dapp selection UI
- Wasm registry browsing (moves to hub)
- My dapps page (`/my-dapps`) — moves to hub

### What the Installer Gains

- Simplicity — one wasm to install, one flow
- Hub upgrade fallback — the installer can show a "recovery" option for users whose hub is broken (restore snapshot from installer, similar to current upgrade advisory recommendation)

---

## Phase Plan

### Phase 0 — Foundation and Naming (Preparation)

**Goal:** Align on conventions, set up the hub canister scaffold, and establish the stable memory foundation.

**Tasks:**
- [ ] Finalize hub canister name (working: `my-canister-hub`)
- [ ] Add `ic-stable-structures` and `ciborium` to workspace dependencies
- [ ] Create hub canister scaffold (`canisters/my-canister-hub/`) with Rust backend + SvelteKit frontend
- [ ] Add hub to `Cargo.toml` workspace members and `icp.yaml`
- [ ] Define Candid interface for hub ↔ dapp communication
- [ ] Define stable memory schema for hub (managed dapps registry, user principal, settings)
- [ ] Set up gix-components in hub frontend (matching installer app styling)

**Depends on:** Nothing
**Output:** Empty hub canister that builds and deploys, stable memory types defined

### Phase 1 — Hub Core: Registry and Install

**Goal:** The hub can browse the wasm registry and install dapps.

**Tasks:**
- [ ] Implement registry connection (hub frontend calls wasm-registry canister)
- [ ] Build dapp store UI in hub (list dapps, show descriptions/versions)
- [ ] Implement dapp installation flow in hub:
  - Create canister (hub as caller, needs cycles)
  - Install wasm
  - Add hub as controller of new dapp
  - Store dapp reference in hub's stable memory
- [ ] Build "my dapps" view — list managed dapps with basic status
- [ ] Handle cycles: hub needs ICP/cycles to create canisters on behalf of user
  - Option A: User funds the hub directly, hub pays for canister creation
  - Option B: User transfers ICP for each install (similar to current flow)
- [ ] Implement `wasm_status` queries — hub calls each managed dapp to get name/version

**Depends on:** Phase 0
**Output:** Hub can install dapps from registry and list them

### Phase 2 — Hub Management Features

**Goal:** Port all current dashboard management features to the hub, operating on managed dapps.

**Tasks:**
- [ ] Canister status panel — cycles, memory, module hash for each managed dapp
- [ ] Manual cycles top-up — transfer ICP → mint cycles for a managed dapp
- [ ] Auto top-up rules — configure per-dapp timer-based top-up (runs in hub)
- [ ] Controllers management — view/modify controllers of managed dapps
- [ ] Alternative origins management — manage II origins for managed dapps
- [ ] Canister logs — view logs for managed dapps
- [ ] Hub self-management panel — status, top-up for the hub itself

**Design note:** Auto top-up rules move from individual dapps to the hub. The hub runs timers that check each managed dapp's cycles and tops them up as needed. This centralizes the ICP reserve in one place.

**Depends on:** Phase 1
**Output:** Feature parity with current per-dapp embedded dashboard, but centralized

### Phase 3 — Upgrade and Snapshot Safety

**Goal:** Implement safe upgrade and snapshot management per the [Upgrade Advisory](./CANISTER_UPGRADE_ADVISORY.md).

**Tasks:**
- [ ] Implement upgrade flow in hub:
  - Check registry for new version
  - Stop dapp → take snapshot → install new wasm (upgrade mode) → verify health → start dapp
  - On failure: load snapshot → start dapp → report error
- [ ] Build snapshot management UI:
  - List snapshots per dapp
  - Take manual snapshot
  - Restore snapshot
  - Delete snapshot
- [ ] Add health check endpoint to dapp template (`wasm_status` + basic HTTP check)
- [ ] Implement upgrade audit log (stored in hub's stable memory)
- [ ] Handle edge cases:
  - Upgrade interrupted (browser closes mid-flow)
  - Snapshot limit reached (10 per canister)
  - Dapp doesn't respond after upgrade

**Depends on:** Phase 2 (needs management features), Upgrade Advisory P0 items (stable memory in dapps)
**Output:** Safe, snapshot-backed upgrade flow for all managed dapps

### Phase 4 — Refactor Examples and Installer

**Goal:** Strip the embedded dashboard from example dapps and simplify the installer.

**Tasks:**
- [ ] Refactor `my-hello-world`:
  - Remove `my-canister-dashboard` dependency
  - Remove management endpoints and guards
  - Keep `my-canister-frontend` + `wasm_status` + application endpoints
  - Update frontend (remove dashboard link/navigation)
  - Add stable memory for application state if applicable
- [ ] Refactor `my-notepad`:
  - Same as above, plus migrate note storage to stable memory
- [ ] Update `canister-dapp-test` acceptance tests:
  - Remove dashboard-related assertions
  - Add `wasm_status` endpoint assertion
  - Test that dapps work without embedded dashboard
- [ ] Refactor `my-canister-app` (installer):
  - Remove dapp store page
  - Remove my-dapps page
  - Hardcode hub wasm installation (or fetch latest hub wasm from registry)
  - Simplify install flow to hub-only
  - Add recovery/rollback option for broken hub (restore snapshot from installer)
- [ ] Update wasm-registry with hub wasm
- [ ] Update deployment scripts

**Depends on:** Phase 3 (hub must be fully functional before stripping dapps)
**Output:** Examples work as standalone dapps managed by hub. Installer installs hub only.

### Phase 5 — Crate and Package Evaluation

**Goal:** Decide the fate of existing packages based on what the refactored architecture actually needs.

**Evaluation matrix:**

| Package | Options | Decision Criteria |
|---------|---------|-------------------|
| `my-canister-dashboard` (crate) | Deprecate / Slim down to types-only / Repurpose as dapp-sdk | Does any code remain useful to dapp developers? |
| `my-canister-dashboard-js` (npm) | Deprecate / Repurpose as hub client lib | Is a JS client lib for the hub needed? |
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
- [ ] Update `icp.yaml` — add hub canister to environments
- [ ] Update build scripts — add hub build to `build-all-wasm.sh`
- [ ] Update deploy scripts — deploy hub, upload hub wasm to registry
- [ ] Update E2E tests:
  - Hub installation test (installer → hub)
  - Hub dapp management test (browse → install → manage → upgrade)
  - Snapshot and rollback test
- [ ] Update `validate-and-test-all.sh` pipeline
- [ ] Update GitHub Actions workflows
- [ ] Write user documentation for the hub
- [ ] Update project README and CLAUDE.md

**Depends on:** Phase 5
**Output:** Fully tested, documented, and deployable new architecture

---

## Technical Considerations

### Cycles Economics

The hub needs cycles to create canisters and manage them. Two funding models:

**Model A — Hub as Cycles Bank:**
User deposits ICP into the hub. Hub holds ICP and pays for canister creation + management operations. Simpler UX (one deposit location), but the hub must manage funds.

**Model B — Per-Operation Funding:**
User transfers ICP for each operation (similar to current installer flow). More explicit, but requires ICP transfers for every install/top-up.

Recommendation: **Model A** for better UX. The hub already needs cycles for its own operation, and centralizing the ICP reserve simplifies auto top-up for managed dapps.

### Inter-Canister Communication

The hub interacts with:
- **IC Management Canister** — create canister, install code, canister status, start/stop, snapshots
- **ICP Ledger** — balance, transfers (for cycles minting)
- **CMC** — notify_create_canister, notify_top_up, exchange rate
- **Wasm Registry** — list wasms, get wasm bytes
- **Managed Dapps** — wasm_status queries, health checks

All of these are standard inter-canister calls. The hub's Candid interface exposes update methods that the frontend calls, and the hub backend makes the cross-canister calls.

### Stable Memory Layout (Hub)

```
MemoryId(0)  — metadata (hub version, schema version)
MemoryId(1)  — user config (II principal, settings)
MemoryId(2)  — managed dapps registry (BTreeMap<Principal, DappRecord>)
MemoryId(3)  — top-up rules (BTreeMap<Principal, TopUpRule>)
MemoryId(4)  — upgrade audit log (Log<UpgradeEvent>)
MemoryId(5)  — ICP reserve tracking
MemoryId(6-9) — reserved for future use
```

```rust
struct DappRecord {
    canister_id: Principal,
    name: String,
    wasm_hash: String,
    version: String,
    installed_at: u64,
    last_upgrade: Option<u64>,
    status: DappStatus, // Running, Stopped, UpgradeInProgress
}
```

### Frontend Architecture

The hub frontend is a SvelteKit app with gix-components, matching the installer's visual style:

```
routes/
  +page.svelte              — Dashboard overview (hub status, dapp count)
  dapps/
    +page.svelte            — List managed dapps with status cards
    [canisterId]/
      +page.svelte          — Individual dapp management (status, top-up, logs)
      upgrade/+page.svelte  — Upgrade flow with snapshot safety
      snapshots/+page.svelte — Snapshot management
  store/
    +page.svelte            — Browse wasm registry, install dapps
  settings/
    +page.svelte            — Hub settings, self-management
```

### Dapp Discovery and Verification

When the hub manages a dapp, it needs to:
1. **Discover**: Call `wasm_status` to get name + version
2. **Verify**: Compare wasm module hash against registry to detect custom/unknown wasms
3. **Track**: Store canister ID + metadata in stable memory

If a dapp doesn't respond to `wasm_status`, the hub shows it as "unrecognized" but still allows basic management (status, cycles, controllers).

### Hub Self-Upgrade

The hub is itself a canister that may need upgrading. This is a bootstrapping problem:
- The hub can orchestrate its own upgrade via self-upgrade (`Call::oneway()` to `install_code`)
- But if the self-upgrade fails silently, the user needs a fallback
- **Fallback:** The installer app retains a "recover hub" feature — it can take a snapshot and upgrade/restore the hub from outside

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Hub canister compromise gives access to all dapps | Critical | Hub is user-owned (not shared). Each user has their own hub. Attack surface is per-user, not systemic. |
| Hub itself breaks after upgrade | High | Installer app has recovery option. Hub uses stable memory so state survives. IC auto-reverts on trap. |
| User loses access to hub | High | User's dapp-domain II principals still work as controllers. Direct dapp access remains possible. |
| Cycles accounting complexity | Medium | Start simple (per-operation), add banking model later if needed. |
| Migration complexity for existing users | Medium | Not applicable yet — no production users. Examples are developer templates, not deployed instances. |
| Scope creep — hub becomes too complex | Medium | Strict phasing. Each phase delivers working software. Feature parity with current dashboard before new features. |
| Inter-canister call failures | Medium | Retry logic, timeout handling, partial-state recovery (similar to current installer's pending canister flow). |

---

## Open Questions

1. **Naming:** Is `my-canister-hub` the right name? Other candidates: `my-canister-console`, `my-canister-dock`, `my-canister-bridge`.
2. **Multi-user hubs:** Should a hub support multiple users (e.g., a shared team workspace)? Initially no — one hub per user. But the architecture should not preclude it.
3. **Dapp access control post-refactor:** If dapps lose `only_ii_principal_guard`, how do they restrict access? Options: rely on controller checks, or keep a lightweight guard.
4. **Hub discovery:** How does the user find their hub after initial install? Bookmark? A lookup from installer?
5. **Registry versioning for hub:** Should the hub wasm be in the same registry as dapps, or a separate channel?
