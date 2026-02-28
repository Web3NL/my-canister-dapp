use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::collections::{HashMap, VecDeque};

// ---------------------------------------------------------------------------
// Access Code types
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum AccessCodeStatus {
    Available,
    Redeemed {
        canister_id: Principal,
        service_principal: Principal,
        dapp_principal: Option<Principal>,
        wasm_name: String,
    },
    Expired,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct AccessCode {
    pub code: String,
    pub status: AccessCodeStatus,
    pub created_at: u64,
    pub redeemed_at: Option<u64>,
}

// ---------------------------------------------------------------------------
// Active Demo types
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct ActiveDemo {
    pub canister_id: Principal,
    pub service_principal: Principal,
    pub dapp_principal: Principal,
    pub wasm_name: String,
    pub access_code: String,
    pub started_at: u64,
    pub expires_at: u64,
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct DemosConfig {
    pub wasm_registry_id: Principal,
    pub trial_duration_ns: u64,
    pub pool_target_size: u32,
    pub cycles_per_demo_canister: u128,
    pub installer_origin: String,
}

// ---------------------------------------------------------------------------
// Pool status (returned by queries)
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct PoolStatus {
    pub available: u32,
    pub active: u32,
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum GenericResult {
    Ok,
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum GenerateCodesResult {
    Ok(Vec<String>),
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum RedeemResult {
    Ok { canister_id: Principal },
    Err(String),
}

// ---------------------------------------------------------------------------
// Canister state
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct DemosState {
    pub config: Option<DemosConfig>,
    pub canister_pool: VecDeque<Principal>,
    pub access_codes: HashMap<String, AccessCode>,
    pub active_demos: HashMap<Principal, ActiveDemo>,
    /// Reverse index: service_principal -> list of demo canister IDs
    pub service_principal_index: HashMap<Principal, Vec<Principal>>,
}

thread_local! {
    pub static STATE: RefCell<DemosState> = RefCell::new(DemosState::default());
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

/// Run a closure with read access to global state.
pub fn with_state<R>(f: impl FnOnce(&DemosState) -> R) -> R {
    STATE.with(|s| f(&s.borrow()))
}

/// Run a closure with mutable access to global state.
pub fn with_state_mut<R>(f: impl FnOnce(&mut DemosState) -> R) -> R {
    STATE.with(|s| f(&mut s.borrow_mut()))
}
