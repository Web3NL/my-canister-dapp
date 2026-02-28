use candid::Principal;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};

mod codes;
mod dashboard_calls;
mod guards;
mod ic_management;
mod pool;
mod redeem;
mod storage;
mod timers;
mod wasm_registry;

use storage::{
    AccessCode, ActiveDemo, DemosConfig, GenerateCodesResult, GenericResult, PoolStatus,
    RedeemResult,
};

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

#[init]
fn init() {}

/// Stable memory layout: [8-byte LE length][CBOR bytes]
const STABLE_HEADER_BYTES: u64 = 8;
const WASM_PAGE_SIZE: u64 = 65536;

#[pre_upgrade]
fn pre_upgrade() {
    timers::stop_timers();
    let bytes = storage::with_state(|s| serde_cbor::to_vec(s).expect("failed to serialize state"));

    let total = STABLE_HEADER_BYTES + bytes.len() as u64;
    let needed_pages = total.div_ceil(WASM_PAGE_SIZE);
    let current_pages = ic_cdk::stable::stable_size();
    if needed_pages > current_pages {
        ic_cdk::stable::stable_grow(needed_pages - current_pages)
            .expect("failed to grow stable memory");
    }

    ic_cdk::stable::stable_write(0, &(bytes.len() as u64).to_le_bytes());
    ic_cdk::stable::stable_write(STABLE_HEADER_BYTES, &bytes);
}

#[post_upgrade]
fn post_upgrade() {
    let stable_pages = ic_cdk::stable::stable_size();
    if stable_pages > 0 {
        let total_stable_bytes = stable_pages * WASM_PAGE_SIZE;

        // Read candidate length header (new format stores u64 LE length at offset 0)
        let mut len_buf = [0u8; 8];
        ic_cdk::stable::stable_read(0, &mut len_buf);
        let candidate_len = u64::from_le_bytes(len_buf);

        // Heuristic: new format has a small length (< 10 MB) that fits in stable memory.
        // Legacy format has raw CBOR at offset 0 whose first 8 bytes decode to a huge u64.
        if candidate_len > 0
            && candidate_len < 10_000_000
            && candidate_len + STABLE_HEADER_BYTES <= total_stable_bytes
        {
            // New format: [8-byte LE length][CBOR bytes]
            let len = candidate_len as usize;
            let mut bytes = vec![0u8; len];
            ic_cdk::stable::stable_read(STABLE_HEADER_BYTES, &mut bytes);
            let state: storage::DemosState =
                serde_cbor::from_slice(&bytes).expect("failed to deserialize state");
            storage::STATE.with(|s| *s.borrow_mut() = state);
        } else {
            // Legacy format: raw CBOR written at offset 0, trailing zeros trimmed
            let read_limit = total_stable_bytes.min(10_000_000) as usize;
            let mut bytes = vec![0u8; read_limit];
            ic_cdk::stable::stable_read(0, &mut bytes);
            if let Some(pos) = bytes.iter().rposition(|&b| b != 0) {
                bytes.truncate(pos + 1);
            }
            if !bytes.is_empty() {
                let state: storage::DemosState =
                    serde_cbor::from_slice(&bytes).expect("failed to deserialize legacy state");
                storage::STATE.with(|s| *s.borrow_mut() = state);
            }
        }
    }
    timers::start_timers();
}

// ---------------------------------------------------------------------------
// Admin endpoints (controller-only)
// ---------------------------------------------------------------------------

#[update(guard = "guards::only_controllers")]
fn configure(config: DemosConfig) -> GenericResult {
    if config.trial_duration_ns == 0 {
        return GenericResult::Err("trial_duration_ns must be > 0".to_string());
    }
    if config.pool_target_size == 0 {
        return GenericResult::Err("pool_target_size must be > 0".to_string());
    }
    if config.cycles_per_demo_canister < 500_000_000_000 {
        return GenericResult::Err("cycles_per_demo_canister must be >= 0.5T".to_string());
    }
    if config.installer_origin.is_empty() {
        return GenericResult::Err("installer_origin must not be empty".to_string());
    }

    storage::with_state_mut(|s| {
        s.config = Some(config);
    });
    timers::start_timers();
    GenericResult::Ok
}

#[update(guard = "guards::only_controllers")]
async fn generate_access_codes(count: u32) -> GenerateCodesResult {
    codes::generate_access_codes(count).await
}

#[query(guard = "guards::only_controllers")]
fn list_access_codes() -> Vec<AccessCode> {
    storage::with_state(|s| s.access_codes.values().cloned().collect())
}

#[query(guard = "guards::only_controllers")]
fn list_active_demos() -> Vec<ActiveDemo> {
    storage::with_state(|s| s.active_demos.values().cloned().collect())
}

#[query(guard = "guards::only_controllers")]
fn get_pool_status() -> PoolStatus {
    storage::with_state(|s| PoolStatus {
        available: s.canister_pool.len() as u32,
        active: s.active_demos.len() as u32,
    })
}

#[update(guard = "guards::only_controllers")]
async fn replenish_pool() -> GenericResult {
    pool::replenish_pool().await
}

#[update(guard = "guards::only_controllers")]
async fn reclaim_expired() -> GenericResult {
    timers::reclaim_all_expired().await
}

/// Set the admin principals list. Controller-only (not the shared guard,
/// so admins cannot escalate by calling this themselves).
#[update]
fn set_admins(admins: Vec<Principal>) -> GenericResult {
    if !ic_cdk::api::is_controller(&ic_cdk::api::msg_caller()) {
        return GenericResult::Err("Only controllers can set admins".to_string());
    }
    storage::with_state_mut(|s| {
        s.admins = admins;
    });
    GenericResult::Ok
}

/// Check whether the caller is a controller or admin.
#[query]
fn is_admin() -> bool {
    let caller = ic_cdk::api::msg_caller();
    if ic_cdk::api::is_controller(&caller) {
        return true;
    }
    storage::with_state(|s| s.admins.contains(&caller))
}

/// Return the current configuration.
#[query(guard = "guards::only_controllers")]
fn get_config() -> Option<DemosConfig> {
    storage::with_state(|s| s.config.clone())
}

// ---------------------------------------------------------------------------
// User endpoints
// ---------------------------------------------------------------------------

#[query]
fn validate_code(code: String) -> bool {
    codes::is_code_available(&code)
}

#[update]
async fn redeem_code(code: String, wasm_name: String) -> RedeemResult {
    redeem::redeem_code(code, wasm_name).await
}

#[update]
async fn finalize_demo(code: String, dapp_principal: Principal) -> GenericResult {
    redeem::finalize_demo(code, dapp_principal).await
}

#[query]
fn get_my_demos() -> Vec<ActiveDemo> {
    let caller = ic_cdk::api::msg_caller();
    storage::with_state(|s| {
        s.service_principal_index
            .get(&caller)
            .map(|canister_ids| {
                canister_ids
                    .iter()
                    .filter_map(|id| s.active_demos.get(id).cloned())
                    .collect()
            })
            .unwrap_or_default()
    })
}
