# Canister Upgrade Mechanism — Advisory Report

> **Status:** Exploration / Design
> **Branch:** `docs/canister-upgrade-advisory`
> **Date:** 2026-02-26
> **Scope:** No code changes — analysis and recommendations only

---

## Executive Summary

User-owned canisters are inherently fragile. The user's only interface is a web frontend embedded in the WASM itself. If an upgrade breaks that frontend, the user is **locked out of their own canister** with no CLI fallback. This document addresses how to make upgrades safe, reversible, and — where possible — automatic.

### Key Findings

1. **All canister state is currently volatile.** Every piece of data lives on the WASM heap and is destroyed on any upgrade or reinstall. This includes the user's Internet Identity principal, top-up rules, and all application data.

2. **The installer uses `reinstall` mode exclusively.** There is no distinction between first install and subsequent update. An "update" today is a full wipe.

3. **ICP Canister Snapshots are production-ready** and capture the complete canister state (WASM binary, heap, stable memory, certified variables). They are the strongest fail-safe available but require the canister to be stopped, meaning they cannot be taken by the canister itself.

4. **The IC automatically reverts failed upgrades.** If `pre_upgrade` or `post_upgrade` traps, the canister returns to its previous state. This is a built-in safety net, but it does not protect against upgrades that "succeed" with subtle bugs.

### Recommendations

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| **P0** | Adopt `ic-stable-structures` for all persistent state | Eliminates `pre_upgrade` entirely — removes the single most dangerous brick risk. Data survives upgrades without serialization. |
| **P0** | Change installer to use `install` for new canisters and `upgrade` for existing ones | Without this, every "update" wipes all state regardless of stable memory work. |
| **P1** | Implement **frontend-orchestrated upgrades with canister snapshots** as the primary manual upgrade path | The user's browser (as controller) stops the canister, takes a snapshot, installs the new WASM, and starts it. If anything goes wrong, the snapshot provides a complete rollback. |
| **P1** | Add a **health-check endpoint** that the frontend can call immediately after upgrade to verify the canister is functional | Enables automated detection of "successful but broken" upgrades. |
| **P1** | Add upgrade management to the **installer app** (not just the embedded dashboard) | If the embedded dashboard is broken after a bad upgrade, the installer app is the only place the user can trigger a snapshot rollback. This is the critical escape hatch. |
| **P2** | Implement self-upgrade via `Call::oneway()` for auto-upgrade (timer-based) | Auto-upgrades cannot use snapshots (canister can't stop itself), but `ic-stable-structures` + IC auto-revert on trap provides sufficient safety for patch/minor updates. |
| **P2** | Add an **upgrade audit log** in stable memory | Append-only record of all upgrades (timestamp, from-version, to-version, trigger). Essential for debugging issues across a fleet of user-owned canisters. |
| **P3** | Consider a **guardian canister** for fully on-chain automated snapshot-safe upgrades | A separate canister that acts as controller and orchestrates stop → snapshot → upgrade → verify → start. Eliminates dependency on the user's browser being open. |

### What Not to Do

- **Do not use `pre_upgrade` for bulk state serialization.** A trap in `pre_upgrade` bricks the canister permanently. Use `ic-stable-structures` instead.
- **Do not auto-upgrade across major versions.** Major versions may require data migrations. Always require explicit user consent.
- **Do not rely solely on the embedded dashboard for upgrade management.** If the upgrade breaks the dashboard, the user has no way to roll back.

---

## Table of Contents

0. [Executive Summary](#executive-summary)
1. [Current State Assessment](#1-current-state-assessment)
2. [The Frontend Lockout Problem](#2-the-frontend-lockout-problem)
3. [Stable Memory Strategy](#3-stable-memory-strategy)
4. [Memory Standard Schema](#4-memory-standard-schema)
5. [Version Skip Upgrades](#5-version-skip-upgrades)
6. [Major Version Upgrades](#6-major-version-upgrades)
7. [Canister Snapshots — Fail-Safe Mechanism](#7-canister-snapshots--fail-safe-mechanism)
8. [Upgrade Orchestration Patterns](#8-upgrade-orchestration-patterns)
9. [Self-Upgrade Mechanism](#9-self-upgrade-mechanism)
10. [Auto-Upgrade Capability](#10-auto-upgrade-capability)
11. [Manual Upgrades from Dashboard](#11-manual-upgrades-from-dashboard)
12. [Health Checks and Verification](#12-health-checks-and-verification)
13. [Upgrade Audit Log](#13-upgrade-audit-log)
14. [Implementation Roadmap](#14-implementation-roadmap)
15. [Risks and Mitigations](#15-risks-and-mitigations)

---

## 1. Current State Assessment

### 1.1 All State Is Volatile

Every piece of state across the codebase uses `thread_local! { RefCell<T> }`, which lives on the WASM heap and is **destroyed on every upgrade or reinstall**:

| Crate | State | Location |
|-------|-------|----------|
| `my-canister-dashboard` | `II_PRINCIPAL: Option<Principal>` | `ii_principal.rs` |
| `my-canister-dashboard` | `TOP_UP_RULE: Option<TopUpRule>` | `top_up_rule.rs` |
| `my-canister-dashboard` | `TOP_UP_TIMER_ID: Option<TimerId>` | `top_up_rule.rs` |
| `my-canister-dashboard` | `TOP_UP_MINT_INFLIGHT: bool` | `top_up_rule.rs` |
| `my-canister-dashboard` | `TOP_UP_LAST_BLOCK_INDEX: Option<u64>` | `top_up_rule.rs` |
| `my-canister-dashboard` | `ALTERNATIVE_ORIGINS: Vec<String>` | `alternative_origins.rs` |
| `my-canister-frontend` | `ASSET_ROUTER: AssetRouter` | `asset_router.rs` |
| `my-notepad` (example) | `NOTES: Vec<Note>`, `NEXT_ID: u32` | `lib.rs` |
| `wasm-registry` | `REGISTRY: HashMap<String, WasmRecord>` | `storage.rs` |

### 1.2 No Upgrade Infrastructure Exists

- **No `pre_upgrade` / `post_upgrade` hooks** anywhere in the codebase
- **No `ic-stable-structures` dependency** in the workspace
- **No stable memory usage** of any kind
- **No `ciborium` or `semver` crate** in the workspace

### 1.3 Installation Uses Reinstall Mode

The installer (`canisters/my-canister-app/src/lib/api/icManagement.ts`) uses:

```typescript
mode: { reinstall: null }
```

This **wipes all state** (heap and stable memory) on every installation. There is currently no distinction between first install and subsequent updates.

### 1.4 Existing Building Blocks

Despite missing upgrade support, the project has key infrastructure already in place:

- **Canister is self-controller** — controllers are set to `[canister_id, user_ii_principal]`, enabling self-managed upgrades
- **`wasm-registry` canister** — stores versioned WASM binaries with semver, SHA-256 hashes, and metadata
- **Timer infrastructure** — `ic-cdk-timers` is in workspace deps, actively used by auto-top-up
- **Candid-ready types** — all state types derive `CandidType` and `Deserialize`
- **Version tracking** — `WasmStatus` exposes name/version/memo via query endpoint
- **`@icp-sdk/canisters/ic-management`** — the installer app already imports `IcManagementCanister`, which provides `installCode`, `updateSettings`, and snapshot methods
- **Serde + SHA2 + Hex** — `serde`, `serde_cbor`, `sha2`, and `hex` are already workspace dependencies

### 1.5 Version Mismatch

- `WasmStatus.version` is `u16` (integer) — currently `6` for my-hello-world, `1` for my-notepad
- `wasm-registry` uses semver strings (`"0.2.1"`)

These must be unified before upgrade logic can compare versions.

---

## 2. The Frontend Lockout Problem

This is the **existential risk** of user-owned canisters.

### 2.1 The Problem

User-owned canisters serve their frontend from within the WASM itself (`setup_frontend(&FRONTEND_DIR)`). The frontend is compiled into the binary at build time via `include_dir!`. If an upgrade installs a WASM with a broken frontend:

1. The canister serves broken or no HTML/JS/CSS
2. The user cannot open the dashboard
3. The user cannot trigger a rollback from the dashboard
4. The user has **no other interface** — there is no CLI, no terminal, no SSH

The user is locked out of their own canister.

### 2.2 Failure Scenarios

| Scenario | IC Auto-Revert? | Frontend Loads? | User Can Recover? |
|----------|:-:|:-:|:-:|
| `post_upgrade` traps | Yes | Yes (old code) | Yes — automatic |
| `post_upgrade` succeeds, frontend has JS error | No | No | **No** — locked out |
| `post_upgrade` succeeds, backend endpoint broken | No | Yes | Partially — UI loads but actions fail |
| `post_upgrade` succeeds, asset certification fails | No | No (browser rejects) | **No** — locked out |
| `post_upgrade` succeeds, `setup_frontend` panics silently | No | No (404s) | **No** — locked out |

In the "No" recovery cases, the user needs an external escape hatch.

### 2.3 Escape Hatches (Defense in Depth)

**Layer 1: IC Auto-Revert.** If `post_upgrade` traps, the IC automatically restores the canister to its pre-upgrade state. This handles the most obvious failures (panics, assertion failures, instruction limit exceeded).

**Layer 2: Canister Snapshots.** For manual upgrades, the user's browser takes a snapshot before upgrading (see section 7). If the upgrade "succeeds" but breaks the frontend, the user can load the snapshot from the **installer app** (which is a separate canister, unaffected by the broken dapp).

**Layer 3: Installer App as Recovery Console.** The installer app (`my-canister-app`) knows which canisters the user has installed. It must be extended to serve as a recovery console:
- List user's installed canisters with health status
- Show snapshots for each canister
- Provide "stop → load snapshot → start" rollback flow
- Provide "stop → reinstall known-good version → start" as a last resort

**Layer 4: Guardian Canister (future).** A dedicated on-chain canister that acts as controller and can autonomously detect unhealthy canisters and roll them back. See section 8.3.

### 2.4 Why the Installer App Is Critical

The embedded dashboard cannot be the sole upgrade management interface. It is part of the WASM being upgraded — if the upgrade breaks it, it breaks the upgrade UI too. The installer app is the only independent interface the user has access to through a browser. It must be able to:

1. Query the management canister for canister status
2. List and load canister snapshots
3. Stop and start canisters
4. Install a known-good WASM version as a last resort

All of these operations are possible because the user's II principal is a controller of their canisters, and the installer app uses `@icp-sdk/canisters/ic-management` which already supports these management canister calls.

---

## 3. Stable Memory Strategy

### 3.1 Recommendation: `ic-stable-structures`

We recommend **`ic-stable-structures`** over manual Candid serialization for the following reasons:

| Criteria | Candid Serialization | `ic-stable-structures` |
|----------|---------------------|------------------------|
| Persistence | Requires `pre_upgrade`/`post_upgrade` hooks | **Automatic** — data survives upgrades without hooks |
| Brick risk | `pre_upgrade` trap = **permanently bricked canister** | No `pre_upgrade` needed = **no brick risk** |
| Large state | Must serialize entire state within instruction limit | Reads/writes individual records on demand |
| Complexity | Simple for small state, dangerous at scale | More boilerplate upfront, safer at scale |
| Schema evolution | Candid handles missing `Option` fields | Requires careful `Storable` implementation |

The primary advantage is **eliminating `pre_upgrade` entirely**. A canister that traps during `pre_upgrade` becomes permanently stuck — it cannot be upgraded because every attempt triggers the same trap. With `ic-stable-structures`, data lives directly in stable memory and is never bulk-serialized.

### 3.2 Hybrid Approach

Not all state belongs in stable structures:

**Persistent (stable memory via `ic-stable-structures`):**
- `II_PRINCIPAL` — user identity, cannot be re-derived
- `TOP_UP_RULE` — user configuration
- `TOP_UP_LAST_BLOCK_INDEX` — financial state
- `ALTERNATIVE_ORIGINS` — user configuration
- Application data (e.g. `NOTES`, `NEXT_ID` in my-notepad)

**Reconstructible (heap, rebuilt on init/post_upgrade):**
- `ASSET_ROUTER` — rebuilt from compile-time embedded assets via `setup_frontend()`
- `TOP_UP_TIMER_ID` — re-created from persisted `TOP_UP_RULE`
- `TOP_UP_MINT_INFLIGHT` — transient flag, safe to reset to `false`

### 3.3 Data Structures

`ic-stable-structures` provides:

| Structure | Use Case |
|-----------|----------|
| `StableCell<T, M>` | Single values (II_PRINCIPAL, TOP_UP_RULE, config) |
| `StableBTreeMap<K, V, M>` | Key-value collections (notes, user data) |
| `StableVec<T, M>` | Ordered lists |
| `Log<T, M>` | Append-only event logs (upgrade audit log) |

The `MemoryManager` partitions stable memory into up to 255 virtual memories, one per data structure.

### 3.4 `post_upgrade` Discipline

Even with `ic-stable-structures` eliminating `pre_upgrade`, we still need a `post_upgrade` hook to rebuild reconstructible state. Critical rules:

1. **No async calls** — `post_upgrade` must be synchronous and deterministic
2. **No inter-canister calls** — only local operations (read stable memory, rebuild asset router, re-register timers)
3. **Fail fast** — if something is wrong, `ic_cdk::trap()` immediately so the IC auto-reverts
4. **Keep it minimal** — the less code in `post_upgrade`, the less that can go wrong

```rust
#[post_upgrade]
fn post_upgrade() {
    // 1. Rebuild frontend (from compile-time embedded assets — cannot fail)
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");

    // 2. Rebuild dashboard assets
    with_asset_router_mut(|router| {
        let origins = read_alternative_origins_from_stable();
        setup_dashboard_assets(router, Some(origins))
            .expect("Failed to setup dashboard assets");
    });

    // 3. Re-register timers from persisted config
    maybe_start_top_up_timer();
    maybe_start_auto_upgrade_timer();
}
```

Note: `setup_frontend` reads from `include_dir!` assets compiled into the WASM. This cannot fail due to external state — if the WASM is valid, the assets are valid. This is a key safety property.

---

## 4. Memory Standard Schema

### 4.1 MemoryId Allocation Convention

Define a standard memory layout that all canister dapps must follow:

```
MemoryId Allocation:
┌─────────────────────────────────────────────────────────┐
│ MemoryId(0)   : UpgradeMetadata (StableCell)            │  ← schema version, wasm version, audit
│ MemoryId(1)   : DashboardConfig (StableCell)            │  ← II principal, top-up rule, origins
│ MemoryId(2)   : UpgradeAuditLog (Log)                   │  ← append-only upgrade history
│ MemoryId(3-9) : Reserved for future dashboard features  │
│ MemoryId(10+) : Application-specific data               │  ← dapp developers use these
└─────────────────────────────────────────────────────────┘
```

### 4.2 Core Schema Types

```rust
/// Upgrade metadata — always at MemoryId(0).
/// Tracks the schema version and WASM version for upgrade compatibility checks.
#[derive(Serialize, Deserialize)]
pub struct UpgradeMetadata {
    /// Schema version for the stable memory layout.
    /// Incremented on breaking changes to the memory layout itself.
    pub schema_version: u16,
    /// Semver string of the currently installed WASM.
    pub wasm_version: String,
    /// Semver string of the previous WASM (for rollback reference).
    #[serde(default)]
    pub previous_wasm_version: Option<String>,
    /// Whether auto-upgrade is enabled.
    #[serde(default)]
    pub auto_upgrade_enabled: bool,
    /// Timestamp (nanoseconds) of the last successful upgrade.
    #[serde(default)]
    pub last_upgrade_timestamp: Option<u64>,
    /// Number of consecutive failed upgrade attempts (reset on success).
    #[serde(default)]
    pub consecutive_failures: u32,
}

/// Dashboard persistent state — always at MemoryId(1).
#[derive(Serialize, Deserialize)]
pub struct DashboardPersistentState {
    pub ii_principal: Option<Principal>,
    pub top_up_rule: Option<TopUpRule>,
    #[serde(default)]
    pub top_up_last_block_index: Option<u64>,
    #[serde(default)]
    pub alternative_origins: Vec<String>,
}

/// A single entry in the upgrade audit log — append-only at MemoryId(2).
#[derive(Serialize, Deserialize)]
pub struct UpgradeLogEntry {
    pub timestamp: u64,
    pub from_version: String,
    pub to_version: String,
    /// "auto", "manual", "rollback"
    pub trigger: String,
    /// true if post_upgrade completed without trapping
    pub success: bool,
}
```

### 4.3 Storable Implementation

Use CBOR (via `ciborium`) for the storage layer, not Candid. CBOR consumes ~11x fewer instructions for serialization and ~8x fewer for deserialization compared to Candid. The types already derive `Serialize`/`Deserialize` via serde.

```rust
impl Storable for UpgradeMetadata {
    fn to_bytes(&self) -> Cow<[u8]> {
        let mut buf = vec![];
        ciborium::ser::into_writer(self, &mut buf).unwrap();
        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        ciborium::de::from_reader(bytes.as_ref()).unwrap()
    }

    const BOUND: Bound = Bound::Unbounded;
}
```

### 4.4 Schema Evolution Rules

1. **New fields must be `Option<T>` with `#[serde(default)]`** — CBOR deserialization fills missing fields with defaults
2. **Never remove fields** — mark deprecated with `Option<T>` wrapping instead
3. **Never change field types** — add a new field with the new type
4. **Use `Bound::Unbounded`** for all custom types — avoids the irreversible `max_size` trap
5. **Increment `schema_version`** only on breaking changes to the memory layout itself (e.g. reassigning a MemoryId)

---

## 5. Version Skip Upgrades

### 5.1 The Problem

A user running `0.1.0` should be able to upgrade directly to `0.3.0`, skipping `0.2.0`. The stable memory must be readable by the `0.3.0` code even though it was written by `0.1.0`.

### 5.2 Strategy: Forward-Compatible Schemas

With the CBOR + `#[serde(default)]` approach, version skipping works naturally for **additive changes**:

```
0.1.0 schema:  { ii_principal, top_up_rule }
0.2.0 schema:  { ii_principal, top_up_rule, alternative_origins }     ← new Option field
0.3.0 schema:  { ii_principal, top_up_rule, alternative_origins, ... } ← another new field
```

When `0.3.0` reads stable memory written by `0.1.0`:
- `ii_principal` and `top_up_rule` deserialize normally
- `alternative_origins` and newer fields get their `#[serde(default)]` values (`None` or `vec![]`)

**No migration code needed.** The `0.3.0` code simply reads what exists and defaults the rest.

### 5.3 Application State Skips

For dapp-specific state (e.g. `NOTES` in my-notepad), the same rules apply:

```rust
#[derive(Serialize, Deserialize)]
pub struct Note {
    pub id: u32,
    pub title: String,
    pub content: String,
    #[serde(default)]  // Added in 0.2.0, absent in 0.1.0 data
    pub created_at: Option<u64>,
    #[serde(default)]  // Added in 0.3.0
    pub tags: Vec<String>,
}
```

A `0.3.0` canister reading a `Note` written at `0.1.0` will get `created_at: None` and `tags: []`. No migration, no version-specific code paths.

### 5.4 When Skips Require Migration

Version skipping is only problematic for **non-additive changes** (field renames, type changes, removed fields). These should be reserved for major versions — see section 6.

### 5.5 Pre-Upgrade Version Check

Before any upgrade, validate compatibility:

```rust
fn is_upgrade_compatible(current: &semver::Version, target: &semver::Version) -> bool {
    // Same major version AND target is newer
    current.major == target.major && target > current
}
```

The dashboard (or auto-upgrade logic) should enforce this check and block incompatible upgrades.

---

## 6. Major Version Upgrades

### 6.1 When Is a Major Version Needed?

Major versions (`0.x.y → 1.0.0`, or `1.x.y → 2.0.0`) are needed when:

| Change | Example | Why Major? |
|--------|---------|------------|
| MemoryId reassignment | Moving notes from `MemoryId(10)` to `MemoryId(11)` | Old data at wrong MemoryId |
| Field type change | `id: u32` → `id: u64` | CBOR deserialization fails |
| Field removal | Removing `memo` field | Old data has extra bytes |
| Key type change in BTreeMap | `BTreeMap<u32, Note>` → `BTreeMap<String, Note>` | Entire map unreadable |
| Structural change | Splitting one struct into two | Layout incompatible |

### 6.2 How Rarely This Should Happen

With good upfront design, **major versions should be extremely rare**:

- Use `String` over enums for extensible identifiers
- Use `Option<T>` for every field that might be optional later
- Use `Bound::Unbounded` so you never hit the `max_size` trap
- Reserve extra MemoryIds upfront (the schema reserves 3-9 for dashboard growth)

### 6.3 Migration Strategy for Major Versions

When a major version is unavoidable, use a **migration function** in `post_upgrade`:

```rust
#[post_upgrade]
fn post_upgrade() {
    let metadata = read_upgrade_metadata();

    match metadata.schema_version {
        1 => {
            // Migrate schema v1 → v2
            migrate_v1_to_v2();
            update_schema_version(2);
        }
        2 => {
            // Current schema, no migration needed
        }
        v => ic_cdk::trap(&format!("Unknown schema version: {v}")),
    }

    // Rebuild reconstructible state
    setup_frontend(&ASSETS);
    restore_timers();
}
```

### 6.4 Chained Migrations

For a canister at schema v1 upgrading to code expecting schema v3:

```rust
fn migrate_to_latest(current_schema: u16) {
    let mut v = current_schema;
    while v < CURRENT_SCHEMA_VERSION {
        match v {
            1 => { migrate_v1_to_v2(); v = 2; }
            2 => { migrate_v2_to_v3(); v = 3; }
            _ => ic_cdk::trap(&format!("No migration path from schema v{v}")),
        }
    }
}
```

This ensures even very old canisters can upgrade to the latest version by walking through each migration step. Each migration function is small and testable.

### 6.5 Major Version Upgrade UX

The dashboard should:
1. Detect that the target version is a major upgrade
2. Show a warning: "This is a major upgrade. A snapshot will be taken before proceeding."
3. **Automatically take a canister snapshot** before installing
4. Require explicit user confirmation
5. Auto-upgrades should **never** perform major version upgrades

---

## 7. Canister Snapshots — Fail-Safe Mechanism

### 7.1 What Are Canister Snapshots?

Canister snapshots are a production-ready ICP feature (available since late 2024) that captures the **complete state** of a canister at a point in time:

| Captured | Description |
|----------|-------------|
| WASM binary | The compiled WASM module currently installed |
| Heap memory | The linear memory used by WASM execution |
| Stable memory | All `ic-stable-structures` data |
| Certified variables | Any certified data set by the canister |
| Chunk store | Chunks stored in the canister's chunk store |

Loading a snapshot fully restores the canister to that exact state — including the WASM module itself. This is a true point-in-time restore.

### 7.2 API

The management canister exposes four snapshot methods:

```
take_canister_snapshot(canister_id, replace_snapshot?)  → Snapshot { id, taken_at_timestamp, total_size }
load_canister_snapshot(canister_id, snapshot_id)        → ()
list_canister_snapshots(canister_id)                    → Vec<Snapshot>
delete_canister_snapshot(canister_id, snapshot_id)      → ()
```

These are available via `@icp-sdk/canisters/ic-management` (TypeScript) and `ic-cdk` (Rust).

### 7.3 Constraints

| Constraint | Detail |
|------------|--------|
| **Canister must be stopped** | Cannot take or load a snapshot on a running canister |
| **Controller-only access** | Only canister controllers can perform snapshot operations |
| **Max 10 snapshots per canister** | Use `replace_snapshot` to maintain a rolling window |
| **No self-snapshots** | A canister cannot snapshot itself (it must be stopped first) |
| **Destructive load** | Loading a snapshot deletes all data accumulated since the snapshot was taken |
| **Storage cost** | Snapshots count toward canister storage (~$0.43/GiB/month) |

### 7.4 Why a Canister Cannot Snapshot Itself

Taking a snapshot requires the canister to be stopped. A stopped canister cannot execute code. This creates a fundamental chicken-and-egg problem: the canister needs to be running to call `take_canister_snapshot`, but the canister must be stopped for the call to succeed.

This means **snapshots must be orchestrated externally** — either by the user's browser (which acts as a controller via II) or by a separate guardian canister.

### 7.5 Snapshot-Safe Upgrade Flow

The recommended flow for manual upgrades:

```
User clicks "Upgrade" in Installer App (or Dashboard)
       │
       ▼
Frontend calls: stop_canister(dapp_canister_id)
       │
       ▼
Frontend calls: take_canister_snapshot(dapp_canister_id, replace: prev_snapshot_id?)
       │                                                    │
       │                              Stores snapshot_id locally (localStorage/sessionStorage)
       ▼
Frontend calls: install_code(dapp_canister_id, new_wasm, mode: upgrade)
       │
       ▼
Frontend calls: start_canister(dapp_canister_id)
       │
       ▼
Frontend calls: health_check(dapp_canister_id)
       │
       ├── Health check PASSES → show success, optionally delete old snapshot
       │
       └── Health check FAILS  → prompt user:
                                   "The upgrade may have a problem. Roll back?"
                                   [Roll Back] → stop → load_snapshot → start
                                   [Keep]      → keep new version, user accepts the risk
```

### 7.6 Handling Browser Closure Mid-Upgrade

If the user closes their browser during the upgrade, the canister may be left in a stopped state. Mitigations:

1. **Installer app "My Canisters" view** — shows canister status (running/stopped) and provides start/stop/rollback controls
2. **Store upgrade state in localStorage** — when the user returns, the frontend detects the interrupted upgrade and resumes or offers rollback
3. **Timeout-based auto-start** — if the canister is stopped for more than N minutes without a management call, a guardian canister could auto-start it (future enhancement)

### 7.7 Snapshots Are Not a Substitute for Stable Memory

Snapshots are a **safety net**, not a **persistence strategy**:

| Concern | Stable Memory | Snapshots |
|---------|:---:|:---:|
| Survives routine upgrades | Yes | N/A — snapshots are for rollback |
| Protects against broken upgrades | Partially (IC auto-revert on trap) | **Yes** — full point-in-time restore |
| Protects against "successful but broken" upgrades | No | **Yes** |
| Works with auto-upgrade (no human) | Yes | **No** — requires external orchestration |
| Data granularity | Per-field | All-or-nothing |

Both are needed. `ic-stable-structures` handles routine upgrades. Snapshots handle the "oh no" scenario.

---

## 8. Upgrade Orchestration Patterns

There are three distinct patterns for upgrading a user-owned canister, each with different safety profiles:

### 8.1 Pattern A: Frontend-Orchestrated Upgrade (Recommended for Manual)

The user's browser orchestrates the full lifecycle via the management canister.

```
┌──────────────────────────────────────────────────────────────┐
│  User's Browser (II Principal = Controller)                   │
│                                                              │
│  1. stop_canister(dapp_id)           ── management canister  │
│  2. take_canister_snapshot(dapp_id)  ── management canister  │
│  3. install_code(dapp_id, wasm)      ── management canister  │
│  4. start_canister(dapp_id)          ── management canister  │
│  5. health_check(dapp_id)            ── dapp canister query  │
│  6a. OK → done                                               │
│  6b. FAIL → stop → load_snapshot → start                     │
└──────────────────────────────────────────────────────────────┘
```

**Pros:** Full snapshot safety, user in control, no on-chain intermediary.
**Cons:** Requires user's browser to stay open; if closed mid-upgrade, canister may be stuck stopped.

**Where this runs:** Both the installer app (`my-canister-app`) and the embedded dashboard can implement this flow. The installer app is the critical fallback if the dashboard is broken.

### 8.2 Pattern B: Self-Upgrade via Oneway Call (For Auto-Upgrade)

The canister upgrades itself without external orchestration.

```
┌──────────────────────────────────────────────────────────────┐
│  Canister (Self-Controller)                                   │
│                                                              │
│  Timer fires → check_for_upgrade()                           │
│    1. Query wasm-registry for latest version                 │
│    2. Compare versions (semver)                              │
│    3. Fetch WASM bytes                                       │
│    4. Verify SHA-256 hash                                    │
│    5. Write metadata to stable memory                        │
│    6. Call::oneway() → install_code(self, wasm, upgrade)     │
│                                                              │
│  (IC processes upgrade, old code replaced)                   │
│                                                              │
│  post_upgrade() runs on new code:                            │
│    - Rebuild frontend from embedded assets                   │
│    - Re-register timers from stable config                   │
│    - Write success to upgrade audit log                      │
└──────────────────────────────────────────────────────────────┘
```

**Pros:** Fully autonomous, no human needed, works while user is offline.
**Cons:** No snapshot safety net. Relies on `ic-stable-structures` (no `pre_upgrade` trap) + IC auto-revert (if `post_upgrade` traps).

**Safety justification:** Auto-upgrade is restricted to patch and minor versions, which by convention are additive-only schema changes. The risk of a broken upgrade is lower for these versions. If `post_upgrade` traps, the IC reverts automatically. If it "succeeds" with a bug, the `previous_wasm_version` in stable memory enables manual rollback.

### 8.3 Pattern C: Guardian Canister (Future — Fully On-Chain Safety)

A dedicated canister that acts as a controller and orchestrates snapshot-safe upgrades without requiring the user's browser.

```
┌──────────────────────────────────────────────────────────────┐
│  Guardian Canister (Controller of user dapps)                 │
│                                                              │
│  Timer or trigger:                                           │
│    1. stop_canister(dapp_id)                                 │
│    2. take_canister_snapshot(dapp_id, replace: prev?)        │
│    3. install_code(dapp_id, new_wasm, mode: upgrade)         │
│    4. start_canister(dapp_id)                                │
│    5. health_check(dapp_id) — query the dapp                 │
│    6a. OK → done, record success                             │
│    6b. FAIL → stop → load_snapshot → start, record failure   │
└──────────────────────────────────────────────────────────────┘
```

**Pros:** Full snapshot safety, works autonomously, can detect and auto-rollback broken upgrades.
**Cons:** The guardian must be a controller of the user's canister — this requires the user to trust the guardian. Adds a third controller alongside `[canister_id, user_ii_principal]`.

**Trust model:** The guardian could be an immutable (no controller) canister, or it could be governed by a DAO. The user would need to explicitly opt in to adding it as a controller.

**Recommendation:** This is a P3 enhancement. Start with Pattern A (frontend-orchestrated) + Pattern B (self-upgrade) and evaluate whether a guardian canister is needed based on real-world upgrade failures.

---

## 9. Self-Upgrade Mechanism

### 9.1 Can a Canister Upgrade Itself?

**Yes.** A canister can call the management canister's `install_code` on its own `canister_id`, provided it is listed as one of its own controllers. This project already sets `[canister_id, user_ii_principal]` as controllers.

### 9.2 The Callback Trap Problem

When a canister calls `install_code` on itself via a standard async call:

1. The IC processes the upgrade (runs `pre_upgrade` on old code, installs new WASM, runs `post_upgrade` on new code)
2. The IC tries to deliver the response to the **now-replaced** calling code
3. The callback function pointers are invalid in the new WASM module → **trap**

The upgrade succeeds, but the response callback traps. This is confusing but not harmful.

### 9.3 Solution: One-Way (Fire-and-Forget) Call

Use `Call::oneway()` from `ic-cdk` v0.19.0. This sends the `install_code` request without registering a response callback:

```rust
use ic_cdk::call::Call;
use candid::Principal;

fn perform_self_upgrade(new_wasm: Vec<u8>, upgrade_arg: Vec<u8>) -> Result<(), String> {
    let self_id = ic_cdk::api::canister_self();

    #[derive(CandidType)]
    struct InstallCodeArg {
        mode: CanisterInstallMode,
        canister_id: Principal,
        wasm_module: Vec<u8>,
        arg: Vec<u8>,
    }

    Call::new(Principal::management_canister(), "install_code")
        .with_arg(&InstallCodeArg {
            mode: CanisterInstallMode::Upgrade(None),
            canister_id: self_id,
            wasm_module: new_wasm,
            arg: upgrade_arg,
        })
        .oneway()
        .map_err(|e| format!("Self-upgrade call failed: {:?}", e))
}
```

After `oneway()` returns `Ok(())`, the upgrade is queued. The current execution context will not run further code — the canister is being replaced.

### 9.4 WASM Size Consideration

ICP limits inter-canister messages to ~2MB. Large WASMs may exceed this. Two options:

- **Keep WASMs under 2MB** — current registry already enforces this (`max 2MB` validation)
- **Use `install_chunked_code`** — uploads WASM in chunks before installing (available in `ic-cdk` management canister API, for future use if WASMs grow)

### 9.5 Cycles Check Before Upgrade

An upgrade consumes cycles for computation and storage. The canister should verify it has sufficient cycles before attempting:

```rust
async fn try_upgrade() -> Result<(), String> {
    let balance = ic_cdk::api::canister_balance128();
    const MIN_CYCLES_FOR_UPGRADE: u128 = 500_000_000_000; // 0.5T cycles
    if balance < MIN_CYCLES_FOR_UPGRADE {
        return Err(format!("Insufficient cycles for upgrade: {balance}"));
    }
    // ... proceed with upgrade
}
```

---

## 10. Auto-Upgrade Capability

### 10.1 Design

Auto-upgrade uses the same timer pattern already proven by the auto-top-up feature:

```
┌─────────────────────────────────────────────────────────┐
│                    Canister Runtime                      │
│                                                         │
│  ┌──────────────┐     ┌──────────────────────────────┐  │
│  │ Timer (1h)   │────>│ check_for_upgrade()          │  │
│  └──────────────┘     │  1. Read UpgradeMetadata     │  │
│                       │  2. Query wasm-registry       │  │
│                       │  3. Compare versions          │  │
│                       │  4. Fetch WASM bytes          │  │
│                       │  5. Verify SHA-256 hash       │  │
│                       │  6. Check semver compat       │  │
│                       │  7. Check cycles balance      │  │
│                       │  8. Write metadata + audit    │  │
│                       │  9. Call oneway install_code  │  │
│                       └──────────────────────────────┘  │
│                                                         │
│  ┌──────────────┐     ┌──────────────────────────────┐  │
│  │ Stable Mem   │     │ UpgradeMetadata              │  │
│  │ MemoryId(0)  │────>│  schema_version: 1           │  │
│  │              │     │  wasm_version: "0.2.0"       │  │
│  │              │     │  auto_upgrade_enabled: true   │  │
│  └──────────────┘     └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 10.2 Safety Rules

Auto-upgrades must enforce strict safety:

1. **Patch and minor only** — never auto-upgrade across major versions
2. **Hash verification** — verify SHA-256 of fetched WASM against registry metadata before installing
3. **In-flight guard** — prevent concurrent upgrade attempts (mirror `TOP_UP_MINT_INFLIGHT` pattern)
4. **Cooldown** — after a failed upgrade attempt, back off exponentially (1h → 2h → 4h → ..., capped at 24h)
5. **Consecutive failure limit** — after 3 consecutive failures, disable auto-upgrade and log the reason
6. **Toggle** — `auto_upgrade_enabled` in `UpgradeMetadata`, controllable from dashboard
7. **Cycles floor** — do not attempt upgrade if cycles balance is below threshold
8. **Registry availability** — gracefully handle `wasm-registry` being unreachable (don't count as a failure)
9. **Staged rollout delay** — optionally delay auto-upgrade by N hours after a new version is published (configurable, default 0)

### 10.3 Timer Survival

Timers do **not** survive upgrades — the IC clears all timers during the upgrade process. The auto-upgrade timer must be re-registered in `post_upgrade`:

```rust
#[init]
fn init() {
    setup_frontend(&ASSETS).unwrap();
    maybe_start_auto_upgrade_timer();
    maybe_start_top_up_timer();
}

#[post_upgrade]
fn post_upgrade() {
    setup_frontend(&ASSETS).unwrap();
    restore_state_from_stable_memory();
    maybe_start_auto_upgrade_timer();  // Re-register if enabled
    maybe_start_top_up_timer();        // Re-register if rule exists
}
```

### 10.4 Pseudocode

```rust
const CHECK_INTERVAL: Duration = Duration::from_secs(3600); // 1 hour
const MAX_CONSECUTIVE_FAILURES: u32 = 3;
const MIN_CYCLES_FOR_UPGRADE: u128 = 500_000_000_000;

thread_local! {
    static UPGRADE_IN_FLIGHT: RefCell<bool> = const { RefCell::new(false) };
    static UPGRADE_TIMER_ID: RefCell<Option<TimerId>> = const { RefCell::new(None) };
}

fn maybe_start_auto_upgrade_timer() {
    let metadata = read_upgrade_metadata();
    if metadata.auto_upgrade_enabled {
        let timer_id = set_timer_interval(CHECK_INTERVAL, || {
            ic_cdk::futures::spawn(check_and_upgrade());
        });
        UPGRADE_TIMER_ID.with(|cell| *cell.borrow_mut() = Some(timer_id));
    }
}

async fn check_and_upgrade() {
    // In-flight guard
    let already_running = UPGRADE_IN_FLIGHT.with(|c| {
        let was = *c.borrow();
        if !was { *c.borrow_mut() = true; }
        was
    });
    if already_running { return; }

    let result = try_upgrade().await;

    UPGRADE_IN_FLIGHT.with(|c| *c.borrow_mut() = false);

    if let Err(e) = result {
        ic_cdk::println!("Auto-upgrade check failed: {e}");
    }
}

async fn try_upgrade() -> Result<(), String> {
    let metadata = read_upgrade_metadata();

    // Check consecutive failure limit
    if metadata.consecutive_failures >= MAX_CONSECUTIVE_FAILURES {
        return Err("Auto-upgrade disabled: too many consecutive failures".into());
    }

    // Check cycles balance
    if ic_cdk::api::canister_balance128() < MIN_CYCLES_FOR_UPGRADE {
        return Err("Insufficient cycles for upgrade".into());
    }

    let current = semver::Version::parse(&metadata.wasm_version)
        .map_err(|e| format!("Bad current version: {e}"))?;

    // 1. Query registry for latest version
    let entry: Option<WasmEntry> = /* query wasm-registry */;
    let entry = entry.ok_or("No entry found in registry")?;

    let target = semver::Version::parse(&entry.version)
        .map_err(|e| format!("Bad target version: {e}"))?;

    // 2. Skip if already current or older
    if target <= current { return Ok(()); }

    // 3. Block major version jumps
    if target.major != current.major {
        return Err(format!("Major upgrade {current} → {target} blocked (manual only)"));
    }

    // 4. Fetch WASM bytes
    let wasm_bytes: Vec<u8> = /* fetch from registry */;

    // 5. Verify hash
    let actual_hash = hex::encode(sha2::Sha256::digest(&wasm_bytes));
    if actual_hash != entry.wasm_hash {
        return Err("WASM hash mismatch — aborting upgrade".into());
    }

    // 6. Write audit log entry
    append_upgrade_log(UpgradeLogEntry {
        timestamp: ic_cdk::api::time(),
        from_version: metadata.wasm_version.clone(),
        to_version: entry.version.clone(),
        trigger: "auto".to_string(),
        success: false, // Will be set to true in post_upgrade if it succeeds
    });

    // 7. Update metadata (previous version for rollback reference)
    write_upgrade_metadata(UpgradeMetadata {
        previous_wasm_version: Some(metadata.wasm_version),
        wasm_version: entry.version.clone(),
        consecutive_failures: metadata.consecutive_failures + 1, // Decremented on success
        ..metadata
    });

    // 8. Fire-and-forget self-upgrade
    perform_self_upgrade(wasm_bytes, vec![])?;

    Ok(()) // This line may never execute — the canister is being replaced
}
```

### 10.5 On/Off Toggle

Expose via the dashboard interface:

```candid
type ManageAutoUpgradeArg = variant {
  Enable;
  Disable;
  GetStatus;
};

type AutoUpgradeStatus = record {
  enabled : bool;
  current_version : text;
  last_check : opt nat64;
  consecutive_failures : nat32;
};
```

---

## 11. Manual Upgrades from Dashboard

### 11.1 Dashboard Awareness

The dashboard needs two new capabilities:

1. **Know what WASM it's running** — read `UpgradeMetadata` from stable memory (version, name)
2. **Know what upgrades are available** — query the `wasm-registry` canister

### 11.2 New Dashboard Endpoints

```candid
// Query: current version + available upgrades
"upgrade_status" : () -> (UpgradeStatusResponse) query;

// Update: trigger manual upgrade to specific version (self-upgrade path)
"upgrade_to_version" : (text) -> (UpgradeResult);

// Update: toggle auto-upgrade
"manage_auto_upgrade" : (ManageAutoUpgradeArg) -> (ManageAutoUpgradeResult);

// Query: upgrade history
"upgrade_history" : () -> (vec UpgradeLogEntry) query;

// Query: health check (lightweight — returns ok if canister is functional)
"health_check" : () -> (HealthCheckResponse) query;
```

### 11.3 Two Manual Upgrade Paths

**Path A: Frontend-Orchestrated (Recommended — with snapshot safety)**

The frontend calls the management canister directly:

```
User opens Dashboard or Installer App
       │
       ▼
Frontend calls upgrade_status() on the dapp canister
       │
       ▼
Shows: "Running v0.1.0 — v0.3.0 available"
       │
       ▼
User clicks "Upgrade to v0.3.0"
       │
       ▼
Frontend orchestrates via management canister:
  1. stop_canister(dapp_id)
  2. take_canister_snapshot(dapp_id)     ← safety net
  3. install_code(dapp_id, wasm, upgrade)
  4. start_canister(dapp_id)
  5. health_check(dapp_id)
       │
       ├── PASS → "Upgraded to v0.3.0 ✓"
       └── FAIL → offer rollback via load_snapshot
```

**Path B: Self-Upgrade (Fallback — no snapshot)**

The frontend calls an endpoint on the canister itself:

```
User clicks "Upgrade to v0.3.0"
       │
       ▼
Frontend calls upgrade_to_version("0.3.0") on the dapp canister
       │
       ▼
Canister performs self-upgrade (oneway install_code)
       │
       ▼
Dashboard loses connection briefly → polls → verifies new version
```

This is simpler but has no snapshot safety net. It should be the fallback when the frontend cannot call the management canister directly (e.g., permission issues).

### 11.4 Rollback

Two rollback mechanisms:

**Snapshot rollback (full state restore):**
```
User opens Installer App → "My Canisters" → selects dapp
Shows: "Running v0.3.0 — Snapshot from v0.1.0 available"
[Restore Snapshot]
→ stop_canister → load_canister_snapshot → start_canister
→ Canister is back to exact v0.1.0 state
```

**Version rollback (re-upgrade to previous version):**
```
Dashboard shows: "Running v0.3.0 (upgraded from v0.1.0)"
[Rollback to v0.1.0]
→ Fetches v0.1.0 WASM from registry → performs upgrade
→ State is preserved (stable memory) but code is v0.1.0
```

The snapshot rollback is stronger (restores everything including data) but destructive (loses data added since the snapshot). The version rollback preserves data but may have schema incompatibilities if the older code can't read newer stable memory fields. In practice, both options should be available and the user should be informed of the trade-offs.

---

## 12. Health Checks and Verification

### 12.1 Why Health Checks Matter

The IC auto-reverts upgrades where `post_upgrade` traps. But it does **not** detect upgrades that "succeed" with a broken frontend, a broken backend endpoint, or corrupted state. A health check endpoint fills this gap.

### 12.2 Health Check Endpoint

```rust
#[derive(CandidType, Serialize)]
pub struct HealthCheckResponse {
    pub healthy: bool,
    pub version: String,
    pub checks: Vec<HealthCheckItem>,
}

#[derive(CandidType, Serialize)]
pub struct HealthCheckItem {
    pub name: String,
    pub passed: bool,
    pub detail: Option<String>,
}

#[query]
fn health_check() -> HealthCheckResponse {
    let mut checks = vec![];

    // Check 1: Can we read upgrade metadata from stable memory?
    let metadata_ok = read_upgrade_metadata_safe().is_ok();
    checks.push(HealthCheckItem {
        name: "stable_memory_readable".into(),
        passed: metadata_ok,
        detail: None,
    });

    // Check 2: Does the asset router have the index page?
    let frontend_ok = with_asset_router(|r| r.has_asset("/index.html"));
    checks.push(HealthCheckItem {
        name: "frontend_assets_loaded".into(),
        passed: frontend_ok,
        detail: None,
    });

    // Check 3: Is the dashboard HTML present?
    let dashboard_ok = with_asset_router(|r| r.has_asset("/_/dashboard/index.html"));
    checks.push(HealthCheckItem {
        name: "dashboard_assets_loaded".into(),
        passed: dashboard_ok,
        detail: None,
    });

    let all_passed = checks.iter().all(|c| c.passed);

    HealthCheckResponse {
        healthy: all_passed,
        version: read_upgrade_metadata()
            .map(|m| m.wasm_version)
            .unwrap_or_else(|_| "unknown".into()),
        checks,
    }
}
```

### 12.3 Frontend Health Verification

After an upgrade, the frontend should:

1. Call `health_check()` on the canister
2. If `healthy: false`, offer snapshot rollback or version rollback
3. If the canister is unreachable (no response at all), assume the upgrade failed and offer rollback
4. Use a timeout (e.g., 30 seconds) — if the canister doesn't respond within the timeout, treat as failure

### 12.4 HTTP-Level Health Check

Additionally, a simple HTTP health check can be added that doesn't require Candid:

```
GET /_/health → 200 OK {"status": "healthy", "version": "0.3.0"}
```

This can be checked by external monitoring, by the guardian canister (via HTTP outcalls), or by the installer app without needing to know the Candid interface.

---

## 13. Upgrade Audit Log

### 13.1 Purpose

Every user-owned canister should maintain an append-only log of all upgrades. This is essential for:

- **Debugging** — when a user reports an issue, knowing the upgrade history narrows the cause
- **Rollback decisions** — knowing which version was running before helps choose the right rollback target
- **Fleet monitoring** — if the installer app queries upgrade logs across user canisters, patterns (e.g., "v0.3.0 is causing failures") can be detected early

### 13.2 Implementation

Use `ic-stable-structures::Log` at `MemoryId(2)`:

```rust
thread_local! {
    static UPGRADE_LOG: RefCell<Log<UpgradeLogEntry, VirtualMemory<DefaultMemoryImpl>>> =
        RefCell::new(Log::init(memory_manager().get(MemoryId::new(2))).unwrap());
}

fn append_upgrade_log(entry: UpgradeLogEntry) {
    UPGRADE_LOG.with(|log| log.borrow_mut().append(&entry).unwrap());
}

fn read_upgrade_log() -> Vec<UpgradeLogEntry> {
    UPGRADE_LOG.with(|log| {
        let log = log.borrow();
        (0..log.len()).filter_map(|i| log.get(i)).collect()
    })
}
```

### 13.3 Post-Upgrade Success Marker

In `post_upgrade`, after all initialization succeeds, mark the latest log entry as successful:

```rust
#[post_upgrade]
fn post_upgrade() {
    // ... rebuild state ...

    // Mark upgrade as successful
    let metadata = read_upgrade_metadata();
    append_upgrade_log(UpgradeLogEntry {
        timestamp: ic_cdk::api::time(),
        from_version: metadata.previous_wasm_version.unwrap_or_default(),
        to_version: metadata.wasm_version.clone(),
        trigger: "post_upgrade_confirm".to_string(),
        success: true,
    });

    // Reset consecutive failure counter
    write_upgrade_metadata(UpgradeMetadata {
        consecutive_failures: 0,
        ..metadata
    });
}
```

---

## 14. Implementation Roadmap

### Phase 1: Stable Memory Foundation

| Step | Description | Crate |
|------|-------------|-------|
| 1.1 | Add `ic-stable-structures`, `ciborium`, and `semver` to workspace deps | `Cargo.toml` |
| 1.2 | Define `UpgradeMetadata`, `DashboardPersistentState`, and `UpgradeLogEntry` types | `my-canister-dashboard` |
| 1.3 | Implement `Storable` for schema types (CBOR serialization) | `my-canister-dashboard` |
| 1.4 | Set up `MemoryManager` with standard MemoryId allocation | `my-canister-dashboard` |
| 1.5 | Migrate dashboard state from `RefCell` heap to `StableCell` | `my-canister-dashboard` |
| 1.6 | Add `#[post_upgrade]` hook to rebuild reconstructible state (frontend, timers) | `my-canister-dashboard` |
| 1.7 | Unify `WasmStatus.version` from `u16` to semver `String` | `my-canister-dashboard` |
| 1.8 | Add upgrade audit log (`Log` at `MemoryId(2)`) | `my-canister-dashboard` |

### Phase 2: Health Check and Installer Mode Fix

| Step | Description | Crate |
|------|-------------|-------|
| 2.1 | Add `health_check()` query endpoint | `my-canister-dashboard` |
| 2.2 | Add HTTP `/_/health` endpoint in asset router | `my-canister-frontend` |
| 2.3 | Change installer to use `install` for new canisters, `upgrade` for existing | `my-canister-app` |
| 2.4 | Update Candid interfaces (`.did` files) | both |

### Phase 3: Frontend-Orchestrated Upgrade (Snapshot-Safe)

| Step | Description | Location |
|------|-------------|----------|
| 3.1 | Add management canister snapshot methods to installer app API layer | `my-canister-app` |
| 3.2 | Build "My Canisters" view in installer app (list, status, snapshots) | `my-canister-app` |
| 3.3 | Implement snapshot-safe upgrade flow (stop → snapshot → install → start → verify) | `my-canister-app` |
| 3.4 | Implement snapshot rollback flow (stop → load snapshot → start) | `my-canister-app` |
| 3.5 | Handle interrupted upgrades (localStorage state, resume on return) | `my-canister-app` |

### Phase 4: Self-Upgrade Capability

| Step | Description | Crate |
|------|-------------|-------|
| 4.1 | Add `perform_self_upgrade()` using `Call::oneway()` | `my-canister-dashboard` |
| 4.2 | Add `upgrade_to_version()` update endpoint with version validation | `my-canister-dashboard` |
| 4.3 | Add `upgrade_status()` query endpoint | `my-canister-dashboard` |
| 4.4 | Add `upgrade_history()` query endpoint | `my-canister-dashboard` |

### Phase 5: Auto-Upgrade

| Step | Description | Crate |
|------|-------------|-------|
| 5.1 | Implement `check_and_upgrade()` timer-based flow | `my-canister-dashboard` |
| 5.2 | Add `manage_auto_upgrade()` endpoint (enable/disable/status) | `my-canister-dashboard` |
| 5.3 | Re-register auto-upgrade timer in `post_upgrade` | `my-canister-dashboard` |
| 5.4 | Add in-flight guard, cooldown, failure limit logic | `my-canister-dashboard` |
| 5.5 | Add cycles balance check before upgrade | `my-canister-dashboard` |

### Phase 6: Testing & Safety

| Step | Description | Crate |
|------|-------------|-------|
| 6.1 | Add upgrade acceptance tests (state survival) to `canister-dapp-test` | `canister-dapp-test` |
| 6.2 | Test version-skip scenarios (0.1.0 → 0.3.0) | `canister-dapp-test` |
| 6.3 | Test schema migration (major version) | `canister-dapp-test` |
| 6.4 | Test `post_upgrade` trap → IC auto-revert | `canister-dapp-test` |
| 6.5 | Test health check endpoint | `canister-dapp-test` |
| 6.6 | Test snapshot-safe upgrade flow (PocketIC + management canister) | `canister-dapp-test` |
| 6.7 | Update example dapps (`my-notepad`) with app-specific stable state | `examples/my-notepad` |
| 6.8 | E2E test: installer app upgrade flow with snapshot | `tests/` (Playwright) |

### Phase 7: Dashboard UI (Frontend)

| Step | Description | Location |
|------|-------------|----------|
| 7.1 | Add upgrade status display (current version, available) | dashboard frontend |
| 7.2 | Add manual upgrade button with confirmation (self-upgrade path) | dashboard frontend |
| 7.3 | Add auto-upgrade toggle | dashboard frontend |
| 7.4 | Add upgrade history view | dashboard frontend |
| 7.5 | Handle upgrade-in-progress state (polling) | dashboard frontend |

---

## 15. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Frontend lockout** — upgrade breaks embedded frontend, user loses all access | **Critical** | Installer app serves as independent recovery console with snapshot rollback. Frontend-orchestrated upgrades take snapshot before installing. |
| **`pre_upgrade` trap bricks canister** | **Critical** | Use `ic-stable-structures` to eliminate `pre_upgrade` entirely. All persistent data in stable structures — no bulk serialization needed. |
| **`post_upgrade` succeeds with silent corruption** | **High** | Health check endpoint validates stable memory readability, frontend asset presence, and dashboard assets. Frontend verifies health after every upgrade. |
| **`post_upgrade` trap** | High | IC auto-reverts to pre-upgrade state. Test `post_upgrade` thoroughly. Keep it deterministic (no async). If repeated traps occur, snapshot rollback from installer app. |
| **WASM hash mismatch / corruption** | High | Always verify SHA-256 hash against registry metadata before installing. |
| **Unauthorized upgrade** | High | Guard `upgrade_to_version()` with `only_ii_principal_guard`. Guard `wasm-registry.upload_wasm()` with controller check. Frontend-orchestrated upgrades inherit II principal identity automatically. |
| **Browser closed mid-upgrade** (canister left stopped) | High | Installer app "My Canisters" view shows canister status. localStorage tracks upgrade state for resume. |
| **Snapshot limit exceeded** (max 10 per canister) | Medium | Use `replace_snapshot` to maintain a rolling single snapshot. Only keep the most recent pre-upgrade snapshot. |
| **Inter-canister message size limit (~2MB)** | Medium | Registry already enforces 2MB WASM limit. Use `install_chunked_code` if WASMs grow beyond this. |
| **Timer loss after upgrade** | Medium | Always re-register timers in `post_upgrade`. Test this path explicitly. |
| **Concurrent upgrade attempts** | Medium | Use in-flight guard (same pattern as `TOP_UP_MINT_INFLIGHT`). Frontend disables upgrade button during in-progress upgrade. |
| **Schema incompatibility on major version** | Medium | Chained migrations (`v1→v2→v3`). Dashboard blocks major auto-upgrades. Snapshot taken before major upgrades. |
| **Old canisters (pre-stable-memory) can't upgrade** | Medium | First "upgrade" from pre-stable canisters requires a one-time reinstall with state loss. Document this clearly and inform users via the installer app with a prominent warning. |
| **Auto-upgrade installs buggy version** | Medium | Configurable staged rollout delay. Consecutive failure limit (3) auto-disables. Patch/minor only. |
| **`wasm-registry` canister unavailable** | Medium | Auto-upgrade gracefully skips check (no failure count increment). Manual upgrade shows clear error. Cache registry responses for status display. |
| **Cycles exhaustion during upgrade** | Low | Check cycles balance before attempting upgrade. Existing auto-top-up feature keeps balance healthy. |
| **`oneway()` gives no upgrade confirmation** | Low | `post_upgrade` writes success to audit log. Dashboard polls and verifies version. Health check confirms functional state. |
| **Snapshot storage cost** | Low | One snapshot per canister. Cost is proportional to canister size (~$0.43/GiB/month). Negligible for typical dapps. |

---

## Appendix A: `ic-stable-structures` Quick Reference

### Crate Version

Current stable: `0.7.x` (crates.io)

### Key Types

```rust
use ic_stable_structures::{
    DefaultMemoryImpl,              // Maps to IC stable memory
    StableBTreeMap,                 // Persistent key-value map
    Cell as StableCell,             // Persistent single value
    Vec as StableVec,               // Persistent growable array
    Log,                            // Persistent append-only log
    memory_manager::{
        MemoryManager,              // Partitions stable memory
        MemoryId,                   // Virtual memory identifier (0-254)
        VirtualMemory,              // A partition of stable memory
    },
    storable::Bound,                // Size bounds for Storable
    Storable,                       // Serialization trait
};
```

### Serialization Format Comparison

| Format | Encode Cost | Decode Cost | Output Size | Schema Evolution |
|--------|-------------|-------------|-------------|-----------------|
| CBOR (ciborium) | ~11x cheaper than Candid | ~8x cheaper | Slightly larger | `#[serde(default)]` for new fields |
| Candid | Baseline | Baseline | Compact | `Option<T>` for new fields |
| Bincode | Fastest | Fastest | Smallest | **No schema evolution** — positional format |

**Recommendation:** CBOR for storage layer (instruction-efficient), Candid for inter-canister communication (standard).

---

## Appendix B: Version Unification Plan

### Current State

```
WasmStatus.version: u16     (in canister metadata endpoint — currently 6 for hello-world, 1 for notepad)
WasmEntry.version:  String   (in wasm-registry, semver format)
```

### Target State

```
WasmStatus.version: String   (semver: "MAJOR.MINOR.PATCH")
WasmEntry.version:  String   (unchanged)
UpgradeMetadata.wasm_version: String  (semver, matches both)
```

### Migration Path

1. Change `WasmStatus.version` from `u16` to `String`
2. Update `.did` file: `version : nat16` → `version : text`
3. Update TypeScript bindings: `version: number` → `version: string`
4. Update acceptance tests to validate semver format
5. Update all example dapps to pass semver string

This is a **breaking change** to the Candid interface. It should be released as part of a coordinated version bump. Since all dapps embed the dashboard crate at compile time, the change propagates when dapps rebuild.

---

## Appendix C: Canister Snapshot API Reference

### TypeScript (via @icp-sdk/canisters/ic-management)

```typescript
const icMgmt = IcManagementCanister.create({ agent });

// Take snapshot (canister must be stopped)
const snapshot = await icMgmt.takeCanisterSnapshot({
  canisterId,
  replaceSnapshot: previousSnapshotId, // optional — replaces old snapshot
});
// snapshot: { id: Uint8Array, taken_at_timestamp: bigint, total_size: bigint }

// Load snapshot (canister must be stopped)
await icMgmt.loadCanisterSnapshot({ canisterId, snapshotId: snapshot.id });

// List snapshots
const snapshots = await icMgmt.listCanisterSnapshots({ canisterId });

// Delete snapshot
await icMgmt.deleteCanisterSnapshot({ canisterId, snapshotId: snapshot.id });
```

### Rust (via ic-cdk management canister calls)

```rust
use ic_cdk::api::management_canister::main::{
    take_canister_snapshot, load_canister_snapshot,
    list_canister_snapshots, delete_canister_snapshot,
    TakeCanisterSnapshotArgs, LoadCanisterSnapshotArgs,
};

// Note: canister must be stopped before these calls
let (snapshot,) = take_canister_snapshot(TakeCanisterSnapshotArgs {
    canister_id: target,
    replace_snapshot: None,
}).await.unwrap();
```

---

## Appendix D: Existing Code References

| File | Relevance |
|------|-----------|
| `canisters/my-canister-app/src/lib/api/icManagement.ts` | Current `installCode` with `reinstall` mode — must add `upgrade` mode + snapshot methods |
| `canisters/my-canister-app/src/lib/api/wasmRegistry.ts` | TypeScript client for WASM registry |
| `canisters/wasm-registry/src/lib.rs` | Registry endpoints and WASM storage |
| `canisters/wasm-registry/src/storage.rs` | In-memory HashMap storage (also needs stable memory) |
| `canisters/wasm-registry/src/validation.rs` | Name/version/WASM validation |
| `packages-rs/my-canister-dashboard/src/dashboard/wasm_status.rs` | `WasmStatus` type (u16 version) — must change to String |
| `packages-rs/my-canister-dashboard/src/dashboard/ii_principal.rs` | Volatile `II_PRINCIPAL` state — must persist |
| `packages-rs/my-canister-dashboard/src/dashboard/top_up_rule.rs` | Timer pattern, volatile state — must persist rule + block index |
| `packages-rs/my-canister-dashboard/src/dashboard/alternative_origins.rs` | Volatile `ALTERNATIVE_ORIGINS` — must persist |
| `packages-rs/my-canister-frontend/src/lib.rs` | `setup_frontend()` + `setup_frontend_with_config()` — called in `post_upgrade` |
| `packages-rs/canister-dapp-test/src/lib.rs` | Acceptance test suite — must add upgrade tests |
| `examples/my-notepad/src/backend/src/lib.rs` | Example dapp with application state — must add stable memory |
| `examples/my-hello-world/src/backend/src/lib.rs` | Reference implementation — must add `post_upgrade` + stable memory |
