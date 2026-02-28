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

#[pre_upgrade]
fn pre_upgrade() {
    timers::stop_timers();
    let bytes = storage::with_state(|s| serde_cbor::to_vec(s).expect("failed to serialize state"));
    ic_cdk::stable::stable_grow(
        bytes.len().div_ceil(8) as u64, // pages needed (round up to 8-byte boundary)
    )
    .expect("failed to grow stable memory");
    ic_cdk::stable::stable_write(0, &bytes);
}

#[post_upgrade]
fn post_upgrade() {
    let len = ic_cdk::stable::stable_size() * 65536; // pages -> bytes
    if len > 0 {
        let mut bytes = vec![0u8; len as usize];
        ic_cdk::stable::stable_read(0, &mut bytes);
        // Trim trailing zeros for serde_cbor
        if let Some(pos) = bytes.iter().rposition(|&b| b != 0) {
            bytes.truncate(pos + 1);
        }
        if !bytes.is_empty() {
            let state: storage::DemosState =
                serde_cbor::from_slice(&bytes).expect("failed to deserialize state");
            storage::STATE.with(|s| *s.borrow_mut() = state);
        }
    }
    timers::start_timers();
}

// ---------------------------------------------------------------------------
// Admin endpoints (controller-only)
// ---------------------------------------------------------------------------

#[update(guard = "guards::only_controllers")]
fn configure(config: DemosConfig) -> GenericResult {
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
