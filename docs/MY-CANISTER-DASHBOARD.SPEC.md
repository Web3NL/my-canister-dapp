# My Canister Dashboard — Specification

> **Status:** Draft
> **Date:** 2026-02-26

---

## Summary

My Canister Dashboard is a single user-owned canister on the Internet Computer that serves as the central management interface for all of a user's dapps. It has an onboard vanilla JS frontend embedded via the `my-canister-frontend` crate, a Rust backend, and connects to one or more wasm registries to browse, install, upgrade, and manage dapps.

One user owns one dashboard. The dashboard is the sole management surface — individual dapps contain no management UI.

---

## Architecture

```
My Canister Dashboard (user-owned canister)
  ├─ Rust backend (ic-cdk)
  ├─ Vanilla JS frontend (embedded via my-canister-frontend crate)
  ├─ Connects to wasm registries (default + user-added)
  └─ Acts as controller of managed dapp canisters

Managed dapps
  ├─ Pure application logic + own frontend
  ├─ Use my-canister-frontend for certified asset serving
  └─ No embedded management UI — managed externally by dashboard
```

### Controller Model

```
Dashboard canister
  controllers: [dashboard_canister_id, user_ii_principal]

Managed dapp canister
  controllers: [dapp_canister_id, dashboard_canister_id, user_ii_principal_at_dapp_domain]
```

- The dashboard is added as a controller of every dapp it manages, enabling IC management API calls (install_code, stop/start, snapshots, delete).
- Each dapp retains itself as controller for self-management (timers, cycle checks).
- The user's dapp-domain II principal is preserved as a controller, providing direct fallback access independent of the dashboard.

### Authentication

The user authenticates with Internet Identity at the dashboard's domain. The dashboard stores the user's II principal and guards all management operations behind principal validation. The dashboard then acts as an authorized intermediary — calling IC management APIs as a controller on behalf of the authenticated user.

---

## Wasm Registries

The dashboard connects to a **default wasm registry** (the project's own `wasm-registry` canister). Users can add additional registries by canister ID.

Each registry exposes:
- List of available dapps (name, description, versions)
- Wasm bytes for a given dapp version
- Module hash for verification

The dashboard queries connected registries for dapp metadata (name, version) using wasm module hashes. If a managed dapp's module hash is not found in any connected registry, it is shown as "unrecognized" but still manageable.

---

## Features

### Dapp Lifecycle

| Operation | Description |
|-----------|-------------|
| **Browse registry** | List available dapps from all connected registries |
| **Install dapp** | Default: spawn new canister + install wasm in one go. Add dashboard as controller. |
| **Install on existing canister** | Install wasm onto an empty user-owned canister |
| **View my dapps** | List managed dapps with status |
| **Upgrade dapp** | Stop → snapshot → install new wasm → health check → start. On failure: restore snapshot. |
| **Rollback dapp** | Restore a previous snapshot |
| **Remove dapp** | Uninstall wasm from canister, keep canister empty for reuse |
| **Delete canister** | Delete an empty canister, recover remaining cycles to dashboard |

### Per-Dapp Management

| Operation | Description |
|-----------|-------------|
| **Canister status** | Cycles balance, memory usage, module hash, running status |
| **Manual top-up** | Transfer ICP → mint cycles for a managed dapp |
| **Auto top-up rules** | Per-dapp timer-based automatic cycles top-up |
| **Controllers** | View and modify controllers |
| **Alternative origins** | Manage II alternative origins |
| **Canister logs** | View canister logs |
| **Wasm info** | Look up dapp name, version, and metadata from connected registries |

### Snapshot Management

| Operation | Description |
|-----------|-------------|
| **List snapshots** | Show snapshots for a dapp (max 10 per canister) |
| **Take snapshot** | Stop → snapshot → start |
| **Restore snapshot** | Stop → load snapshot → start |
| **Delete snapshot** | Remove a snapshot to free the slot |

### Dashboard Self-Management

| Operation | Description |
|-----------|-------------|
| **Status** | View dashboard's own cycles, memory, status |
| **Top-up** | Top up dashboard's own cycles |
| **Self-upgrade** | Upgrade dashboard wasm via `install_code` self-call |

---

## Cycles Economics

The dashboard acts as a cycles bank. The user deposits ICP into the dashboard. The dashboard converts ICP to cycles as needed for:
- Creating new canisters
- Topping up managed dapps (manual and auto)
- Topping up itself

All ICP → cycles conversion goes through the CMC (Cycles Minting Canister).

---

## Inter-Canister Dependencies

| Canister | Operations |
|----------|------------|
| **IC Management Canister** | create_canister, install_code, uninstall_code, delete_canister, canister_status, start_canister, stop_canister, take_canister_snapshot, load_canister_snapshot, delete_canister_snapshot, list_canister_snapshots |
| **ICP Ledger** | icrc1_balance_of, icrc1_transfer |
| **CMC** | notify_create_canister, notify_top_up |
| **Wasm Registries** | list dapps, get wasm bytes, get metadata |
| **Managed Dapps** | HTTP health checks |

---

## State

State is stored in heap memory, persisted across upgrades via `pre_upgrade`/`post_upgrade` serialization.

### Core Types

```rust
struct DashboardState {
    owner: Principal,                              // user's II principal at dashboard domain
    registries: Vec<Principal>,                    // connected wasm registry canister IDs
    dapps: BTreeMap<Principal, DappRecord>,         // managed dapps keyed by canister ID
    top_up_rules: BTreeMap<Principal, TopUpRule>,   // per-dapp auto top-up config
    upgrade_log: Vec<UpgradeEvent>,                // audit log of upgrade operations
}

struct DappRecord {
    canister_id: Principal,
    name: String,
    wasm_hash: String,
    version: String,
    registry: Principal,       // which registry this dapp came from
    installed_at: u64,
    last_upgrade: Option<u64>,
    status: DappStatus,
}

enum DappStatus {
    Running,
    Stopped,
    UpgradeInProgress,
    Empty,                     // wasm removed, canister kept
}

struct TopUpRule {
    threshold_cycles: u128,    // top up when dapp cycles fall below this
    top_up_amount_icp: u64,    // amount of ICP to convert to cycles
    enabled: bool,
}

struct UpgradeEvent {
    canister_id: Principal,
    from_version: String,
    to_version: String,
    timestamp: u64,
    result: UpgradeResult,     // Success, RolledBack, Failed
}
```

---

## Frontend

Vanilla JS — no framework. Embedded into the canister wasm at compile time via `my-canister-frontend` (certified HTTP asset serving with security headers and gzip).

### Pages

| Page | Purpose |
|------|---------|
| **Overview** | Dashboard status, dapp count, cycle balance |
| **My Dapps** | List managed dapps with status cards |
| **Dapp Detail** | Per-dapp management (status, top-up, controllers, logs) |
| **Dapp Upgrade** | Upgrade flow with snapshot safety |
| **Dapp Snapshots** | Snapshot list, take/restore/delete |
| **Store** | Browse connected registries, install dapps |
| **Settings** | Manage registries, dashboard self-management |

---

## Upgrade Safety

### Dapp Upgrade Flow

```
1. Check connected registries for new version
2. Stop dapp canister
3. Take snapshot
4. Install new wasm (upgrade mode)
5. Health check (HTTP request to dapp)
6. Start dapp canister
7. Log result

On failure at step 5:
  → Load snapshot
  → Start dapp canister
  → Log rollback
```

### Dashboard Self-Upgrade

The dashboard upgrades itself via a one-way `install_code` call. If the self-upgrade fails silently, an external recovery mechanism (e.g., the installer app) can take a snapshot and restore the dashboard from outside.

---

## Security

- All management operations require the caller to match the stored owner principal (II guard).
- The dashboard is user-owned — not shared. Each user has their own isolated dashboard instance.
- Dapps are unaware of the dashboard. They see it as an opaque controller.
- The user's dapp-domain II principals remain as controllers on each dapp, providing direct access independent of the dashboard.
