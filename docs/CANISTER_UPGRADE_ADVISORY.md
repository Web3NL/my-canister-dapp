# Canister Upgrade Mechanism — Advisory Report

> **Status:** Exploration / Design
> **Branch:** `feat/canister-upgrade-mechanism`
> **Date:** 2026-02-25
> **Scope:** No code changes — analysis and recommendations only

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Stable Memory Strategy](#2-stable-memory-strategy)
3. [Memory Standard Schema](#3-memory-standard-schema)
4. [Version Skip Upgrades](#4-version-skip-upgrades)
5. [Major Version Upgrades](#5-major-version-upgrades)
6. [Self-Upgrade Mechanism](#6-self-upgrade-mechanism)
7. [Auto-Upgrade Capability](#7-auto-upgrade-capability)
8. [Manual Upgrades from Dashboard](#8-manual-upgrades-from-dashboard)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Risks and Mitigations](#10-risks-and-mitigations)

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
| `wasm-registry` | `WASM_STORE: HashMap<String, WasmRecord>` | `storage.rs` |

### 1.2 No Upgrade Infrastructure Exists

- **No `pre_upgrade` / `post_upgrade` hooks** anywhere in the codebase
- **No `ic-stable-structures` dependency** in the workspace
- **No stable memory usage** of any kind

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
- **Timer infrastructure** — `ic-cdk-timers = "1.0.0"` is in workspace deps, actively used by auto-top-up
- **Candid-ready types** — all state types derive `CandidType` and `Deserialize`
- **Version tracking** — `WasmStatus` exposes name/version/memo via query endpoint

### 1.5 Version Mismatch

- `WasmStatus.version` is `u16` (integer)
- `wasm-registry` uses semver strings (`"0.2.1"`)

These must be unified before upgrade logic can compare versions.

---

## 2. Stable Memory Strategy

### 2.1 Recommendation: `ic-stable-structures`

We recommend **`ic-stable-structures`** over manual Candid serialization for the following reasons:

| Criteria | Candid Serialization | `ic-stable-structures` |
|----------|---------------------|------------------------|
| Persistence | Requires `pre_upgrade`/`post_upgrade` hooks | **Automatic** — data survives upgrades without hooks |
| Brick risk | `pre_upgrade` trap = **permanently bricked canister** | No `pre_upgrade` needed = **no brick risk** |
| Large state | Must serialize entire state within instruction limit | Reads/writes individual records on demand |
| Complexity | Simple for small state, dangerous at scale | More boilerplate upfront, safer at scale |
| Schema evolution | Candid handles missing `Option` fields | Requires careful `Storable` implementation |

The primary advantage is **eliminating `pre_upgrade` entirely**. A canister that traps during `pre_upgrade` becomes permanently stuck — it cannot be upgraded because every attempt triggers the same trap. With `ic-stable-structures`, data lives directly in stable memory and is never bulk-serialized.

### 2.2 Hybrid Approach

Not all state belongs in stable structures:

**Persistent (stable memory via `ic-stable-structures`):**
- `II_PRINCIPAL` — user identity, cannot be re-derived
- `TOP_UP_RULE` — user configuration
- `TOP_UP_LAST_BLOCK_INDEX` — financial state
- `ALTERNATIVE_ORIGINS` — user configuration
- Application data (e.g. `NOTES`, `NEXT_ID` in my-notepad)

**Reconstructible (heap, rebuilt on init/post_upgrade):**
- `ASSET_ROUTER` — rebuilt from compile-time embedded assets
- `TOP_UP_TIMER_ID` — re-created from persisted `TOP_UP_RULE`
- `TOP_UP_MINT_INFLIGHT` — transient flag, safe to reset to `false`

### 2.3 Data Structures

`ic-stable-structures` provides:

| Structure | Use Case |
|-----------|----------|
| `StableCell<T, M>` | Single values (II_PRINCIPAL, TOP_UP_RULE, config) |
| `StableBTreeMap<K, V, M>` | Key-value collections (notes, user data) |
| `StableVec<T, M>` | Ordered lists |
| `Log<T, M>` | Append-only event logs |

The `MemoryManager` partitions stable memory into up to 255 virtual memories, one per data structure.

---

## 3. Memory Standard Schema

### 3.1 MemoryId Allocation Convention

Define a standard memory layout that all canister dapps must follow:

```
MemoryId Allocation:
┌─────────────────────────────────────────────────────────┐
│ MemoryId(0)   : UpgradeMetadata (StableCell)            │  ← schema version, wasm version
│ MemoryId(1)   : DashboardConfig (StableCell)            │  ← II principal, top-up rule, origins
│ MemoryId(2-9) : Reserved for future dashboard features  │
│ MemoryId(10+) : Application-specific data               │  ← dapp developers use these
└─────────────────────────────────────────────────────────┘
```

### 3.2 Core Schema Types

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
    pub previous_wasm_version: Option<String>,
    /// Whether auto-upgrade is enabled.
    pub auto_upgrade_enabled: bool,
}

/// Dashboard persistent state — always at MemoryId(1).
#[derive(Serialize, Deserialize)]
pub struct DashboardPersistentState {
    pub ii_principal: Option<Principal>,
    pub top_up_rule: Option<TopUpRule>,
    pub top_up_last_block_index: Option<u64>,
    pub alternative_origins: Vec<String>,
}
```

### 3.3 Storable Implementation

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

### 3.4 Schema Evolution Rules

1. **New fields must be `Option<T>` with `#[serde(default)]`** — CBOR deserialization fills missing fields with defaults
2. **Never remove fields** — mark deprecated with `Option<T>` wrapping instead
3. **Never change field types** — add a new field with the new type
4. **Use `Bound::Unbounded`** for all custom types — avoids the irreversible `max_size` trap
5. **Increment `schema_version`** only on breaking changes to the memory layout itself (e.g. reassigning a MemoryId)

---

## 4. Version Skip Upgrades

### 4.1 The Problem

A user running `0.1.0` should be able to upgrade directly to `0.3.0`, skipping `0.2.0`. The stable memory must be readable by the `0.3.0` code even though it was written by `0.1.0`.

### 4.2 Strategy: Forward-Compatible Schemas

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

### 4.3 Application State Skips

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

### 4.4 When Skips Require Migration

Version skipping is only problematic for **non-additive changes** (field renames, type changes, removed fields). These should be reserved for major versions — see section 5.

### 4.5 Pre-Upgrade Version Check

Before any upgrade, validate compatibility:

```rust
fn is_upgrade_compatible(current: &semver::Version, target: &semver::Version) -> bool {
    // Same major version AND target is newer
    current.major == target.major && target > current
}
```

The dashboard (or auto-upgrade logic) should enforce this check and block incompatible upgrades.

---

## 5. Major Version Upgrades

### 5.1 When Is a Major Version Needed?

Major versions (`0.x.y → 1.0.0`, or `1.x.y → 2.0.0`) are needed when:

| Change | Example | Why Major? |
|--------|---------|------------|
| MemoryId reassignment | Moving notes from `MemoryId(10)` to `MemoryId(11)` | Old data at wrong MemoryId |
| Field type change | `id: u32` → `id: u64` | CBOR deserialization fails |
| Field removal | Removing `memo` field | Old data has extra bytes |
| Key type change in BTreeMap | `BTreeMap<u32, Note>` → `BTreeMap<String, Note>` | Entire map unreadable |
| Structural change | Splitting one struct into two | Layout incompatible |

### 5.2 How Rarely This Should Happen

With good upfront design, **major versions should be extremely rare**:

- Use `String` over enums for extensible identifiers
- Use `Option<T>` for every field that might be optional later
- Use `Bound::Unbounded` so you never hit the `max_size` trap
- Reserve extra MemoryIds upfront (the schema reserves 2-9 for dashboard growth)

### 5.3 Migration Strategy for Major Versions

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

### 5.4 Chained Migrations

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

### 5.5 Major Version Upgrade UX

The dashboard should:
1. Detect that the target version is a major upgrade
2. Show a warning: "This is a major upgrade. Please back up your data."
3. Require explicit user confirmation
4. Auto-upgrades should **never** perform major version upgrades

---

## 6. Self-Upgrade Mechanism

### 6.1 Can a Canister Upgrade Itself?

**Yes.** A canister can call the management canister's `install_code` on its own `canister_id`, provided it is listed as one of its own controllers. This project already sets `[canister_id, user_ii_principal]` as controllers.

### 6.2 The Callback Trap Problem

When a canister calls `install_code` on itself via a standard async call:

1. The IC processes the upgrade (runs `pre_upgrade` on old code, installs new WASM, runs `post_upgrade` on new code)
2. The IC tries to deliver the response to the **now-replaced** calling code
3. The callback function pointers are invalid in the new WASM module → **trap**

The upgrade succeeds, but the response callback traps. This is confusing but not harmful.

### 6.3 Solution: One-Way (Fire-and-Forget) Call

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

### 6.4 WASM Size Consideration

ICP limits inter-canister messages to ~2MB. Large WASMs may exceed this. Two options:

- **Keep WASMs under 2MB** — current registry already enforces this (`max 2MB` validation)
- **Use `install_chunked_code`** — uploads WASM in chunks before installing (available in `ic-cdk` management canister API, for future use if WASMs grow)

---

## 7. Auto-Upgrade Capability

### 7.1 Design

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
│                       │  7. Call oneway install_code  │  │
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

### 7.2 Safety Rules

Auto-upgrades must enforce strict safety:

1. **Patch and minor only** — never auto-upgrade across major versions
2. **Hash verification** — verify SHA-256 of fetched WASM against registry metadata before installing
3. **In-flight guard** — prevent concurrent upgrade attempts (mirror `TOP_UP_MINT_INFLIGHT` pattern)
4. **Cooldown** — after a failed upgrade attempt, back off before retrying
5. **Toggle** — `auto_upgrade_enabled` in `UpgradeMetadata`, controllable from dashboard

### 7.3 Timer Survival

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

### 7.4 Pseudocode

```rust
const CHECK_INTERVAL: Duration = Duration::from_secs(3600); // 1 hour

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

    // 6. Update metadata (previous version for rollback reference)
    write_upgrade_metadata(UpgradeMetadata {
        previous_wasm_version: Some(metadata.wasm_version),
        wasm_version: entry.version.clone(),
        ..metadata
    });

    // 7. Fire-and-forget self-upgrade
    perform_self_upgrade(wasm_bytes, vec![])?;

    Ok(()) // This line may never execute — the canister is being replaced
}
```

### 7.5 On/Off Toggle

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
};
```

---

## 8. Manual Upgrades from Dashboard

### 8.1 Dashboard Awareness

The dashboard needs two new capabilities:

1. **Know what WASM it's running** — read `UpgradeMetadata` from stable memory (version, name)
2. **Know what upgrades are available** — query the `wasm-registry` canister

### 8.2 New Dashboard Endpoints

```candid
// Query: current version + available upgrades
"upgrade_status" : () -> (UpgradeStatusResponse) query;

// Update: trigger manual upgrade to specific version
"upgrade_to_version" : (text) -> (UpgradeResult);

// Update: toggle auto-upgrade
"manage_auto_upgrade" : (ManageAutoUpgradeArg) -> (ManageAutoUpgradeResult);
```

### 8.3 Manual Upgrade Flow

```
User opens Dashboard
       │
       ▼
Dashboard calls upgrade_status()
       │
       ▼
Shows: "Running v0.1.0 — v0.3.0 available"
       │
       ▼
User clicks "Upgrade to v0.3.0"
       │
       ▼
Dashboard calls upgrade_to_version("0.3.0")
       │
       ▼
Canister:
  1. Validates caller is II principal
  2. Fetches WASM bytes from wasm-registry
  3. Verifies SHA-256 hash
  4. Checks semver compatibility (same major)
  5. Updates UpgradeMetadata in stable memory
  6. Calls oneway install_code (self-upgrade)
       │
       ▼
Dashboard loses connection briefly
       │
       ▼
Dashboard polls canister until it responds
       │
       ▼
Dashboard calls upgrade_status() to confirm new version
       │
       ▼
Shows: "Running v0.3.0 ✓"
```

### 8.4 Rollback

Since `UpgradeMetadata` stores `previous_wasm_version`, the dashboard can offer:

```
"Running v0.3.0 (upgraded from v0.1.0)"
[Rollback to v0.1.0]
```

Rollback fetches the previous version from the registry and performs the same upgrade flow.

---

## 9. Implementation Roadmap

### Phase 1: Stable Memory Foundation

| Step | Description | Crate |
|------|-------------|-------|
| 1.1 | Add `ic-stable-structures` and `ciborium` to workspace deps | `Cargo.toml` |
| 1.2 | Define `UpgradeMetadata` and `DashboardPersistentState` types | `my-canister-dashboard` |
| 1.3 | Implement `Storable` for schema types (CBOR serialization) | `my-canister-dashboard` |
| 1.4 | Set up `MemoryManager` with standard MemoryId allocation | `my-canister-dashboard` |
| 1.5 | Migrate dashboard state from `RefCell` heap to `StableCell` | `my-canister-dashboard` |
| 1.6 | Add `#[post_upgrade]` hook to rebuild reconstructible state | `my-canister-dashboard` |
| 1.7 | Unify `WasmStatus.version` from `u16` to semver `String` | `my-canister-dashboard` |

### Phase 2: Self-Upgrade Capability

| Step | Description | Crate |
|------|-------------|-------|
| 2.1 | Add `perform_self_upgrade()` using `Call::oneway()` | `my-canister-dashboard` |
| 2.2 | Add `upgrade_to_version()` update endpoint | `my-canister-dashboard` |
| 2.3 | Add `upgrade_status()` query endpoint | `my-canister-dashboard` |
| 2.4 | Update installer to use `Install` for new, `Upgrade` for existing | `my-canister-app` |
| 2.5 | Update Candid interface (`.did` files) | both |

### Phase 3: Auto-Upgrade

| Step | Description | Crate |
|------|-------------|-------|
| 3.1 | Implement `check_and_upgrade()` timer-based flow | `my-canister-dashboard` |
| 3.2 | Add `manage_auto_upgrade()` endpoint (enable/disable/status) | `my-canister-dashboard` |
| 3.3 | Re-register auto-upgrade timer in `post_upgrade` | `my-canister-dashboard` |
| 3.4 | Add in-flight guard and cooldown logic | `my-canister-dashboard` |

### Phase 4: Testing & Safety

| Step | Description | Crate |
|------|-------------|-------|
| 4.1 | Add upgrade acceptance tests (state survival) to `canister-dapp-test` | `canister-dapp-test` |
| 4.2 | Test version-skip scenarios (0.1.0 → 0.3.0) | `canister-dapp-test` |
| 4.3 | Test schema migration (major version) | `canister-dapp-test` |
| 4.4 | Update example dapps (`my-notepad`) with app-specific stable state | `examples/my-notepad` |
| 4.5 | Update CHANGELOGs and READMEs | all |

### Phase 5: Dashboard UI (Frontend)

| Step | Description | Location |
|------|-------------|----------|
| 5.1 | Add upgrade status display (current version, available) | `my-canister-app` |
| 5.2 | Add manual upgrade button with confirmation | `my-canister-app` |
| 5.3 | Add auto-upgrade toggle | `my-canister-app` |
| 5.4 | Add rollback option | `my-canister-app` |
| 5.5 | Handle upgrade-in-progress state (polling) | `my-canister-app` |

---

## 10. Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| `pre_upgrade` trap bricks canister | **Critical** | Use `ic-stable-structures` to eliminate `pre_upgrade` entirely. All persistent data in stable structures — no bulk serialization needed. |
| `post_upgrade` trap | High | IC auto-reverts to pre-upgrade state. Test `post_upgrade` thoroughly. Keep it deterministic (no async). |
| WASM hash mismatch / corruption | High | Always verify SHA-256 hash against registry metadata before installing. |
| Unauthorized upgrade | High | Guard `upgrade_to_version()` with `only_ii_principal_guard`. Guard `wasm-registry.upload_wasm()` with controller check. |
| Inter-canister message size limit (~2MB) | Medium | Registry already enforces 2MB WASM limit. Use `install_chunked_code` if WASMs grow beyond this. |
| Timer loss after upgrade | Medium | Always re-register timers in `post_upgrade`. Test this path explicitly. |
| Concurrent upgrade attempts | Medium | Use in-flight guard (same pattern as `TOP_UP_MINT_INFLIGHT`). |
| Schema incompatibility on major version | Medium | Chained migrations (`v1→v2→v3`). Dashboard blocks major auto-upgrades. |
| Old canisters (pre-stable-memory) can't upgrade | Medium | First "upgrade" from pre-stable canisters requires a one-time reinstall with state loss. Document this clearly and inform users. |
| Auto-upgrade installs buggy version | Medium | Consider a staged rollout: auto-upgrade can be delayed by N hours after a new version is published, allowing manual testers to catch issues first. |
| `oneway()` gives no upgrade confirmation | Low | `post_upgrade` writes success to stable memory. Dashboard polls and verifies version after triggering upgrade. |
| Cycles exhaustion during upgrade | Low | Existing auto-top-up feature keeps cycles balance healthy. Check balance before attempting upgrade. |

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
WasmStatus.version: u16     (in canister metadata endpoint)
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

## Appendix C: Existing Code References

| File | Relevance |
|------|-----------|
| `canisters/my-canister-app/src/lib/api/icManagement.ts` | Current `installCode` with `reinstall` mode |
| `canisters/my-canister-app/src/lib/api/wasmRegistry.ts` | TypeScript client for WASM registry |
| `canisters/wasm-registry/src/lib.rs` | Registry endpoints and WASM storage |
| `canisters/wasm-registry/src/storage.rs` | In-memory HashMap storage |
| `canisters/wasm-registry/src/validation.rs` | Name/version/WASM validation |
| `packages-rs/my-canister-dashboard/src/dashboard/wasm_status.rs` | `WasmStatus` type (u16 version) |
| `packages-rs/my-canister-dashboard/src/dashboard/ii_principal.rs` | Volatile `II_PRINCIPAL` state |
| `packages-rs/my-canister-dashboard/src/dashboard/top_up_rule.rs` | Timer pattern, volatile state |
| `packages-rs/my-canister-dashboard/src/dashboard/alternative_origins.rs` | Volatile `ALTERNATIVE_ORIGINS` |
| `packages-rs/canister-dapp-test/src/lib.rs` | Acceptance test suite |
| `examples/my-notepad/src/backend/src/lib.rs` | Example dapp with application state |
| `examples/my-hello-world/src/backend/src/lib.rs` | Stateless example dapp |
