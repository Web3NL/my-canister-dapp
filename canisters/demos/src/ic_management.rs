use candid::{CandidType, Nat, Principal};
use ic_cdk::call::Call;
use serde::Deserialize;

// ---------------------------------------------------------------------------
// Types for IC management canister calls
// ---------------------------------------------------------------------------

#[derive(CandidType)]
struct CreateCanisterArgs {
    settings: Option<CanisterSettings>,
}

#[derive(CandidType)]
struct CanisterSettings {
    controllers: Option<Vec<Principal>>,
    compute_allocation: Option<Nat>,
    memory_allocation: Option<Nat>,
    freezing_threshold: Option<Nat>,
}

#[derive(CandidType, Deserialize)]
struct CanisterIdRecord {
    canister_id: Principal,
}

#[derive(CandidType)]
struct InstallCodeArgs {
    mode: InstallMode,
    canister_id: Principal,
    wasm_module: Vec<u8>,
    arg: Vec<u8>,
}

#[derive(CandidType)]
#[allow(dead_code)]
#[allow(non_camel_case_types)]
enum InstallMode {
    install,
    reinstall,
    upgrade,
}

#[derive(CandidType)]
struct UninstallCodeArgs {
    canister_id: Principal,
}

#[derive(CandidType)]
struct UpdateSettingsArgs {
    canister_id: Principal,
    settings: CanisterSettings,
}

#[derive(CandidType)]
struct CanisterStatusArgs {
    canister_id: Principal,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct CanisterStatusResponse {
    pub status: CanisterStatus,
    pub settings: CanisterSettingsResponse,
    pub module_hash: Option<Vec<u8>>,
    pub memory_size: Nat,
    pub cycles: Nat,
    pub idle_cycles_burned_per_day: Nat,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum CanisterStatus {
    #[serde(rename = "running")]
    Running,
    #[serde(rename = "stopping")]
    Stopping,
    #[serde(rename = "stopped")]
    Stopped,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct CanisterSettingsResponse {
    pub controllers: Vec<Principal>,
    pub compute_allocation: Nat,
    pub memory_allocation: Nat,
    pub freezing_threshold: Nat,
}

#[derive(CandidType)]
struct DepositCyclesArgs {
    canister_id: Principal,
}

// ---------------------------------------------------------------------------
// Management canister ID
// ---------------------------------------------------------------------------

fn management_canister() -> Principal {
    Principal::management_canister()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Create a new canister with given controllers, attaching cycles from this canister's balance.
pub async fn create_canister_with_cycles(
    controllers: Vec<Principal>,
    cycles: u128,
) -> Result<Principal, String> {
    let args = CreateCanisterArgs {
        settings: Some(CanisterSettings {
            controllers: Some(controllers),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
        }),
    };

    let res = Call::unbounded_wait(management_canister(), "create_canister")
        .with_arg(args)
        .with_cycles(cycles)
        .await
        .map_err(|e| format!("create_canister failed: {e}"))?;

    let record: CanisterIdRecord = res
        .candid()
        .map_err(|e| format!("create_canister decode failed: {e}"))?;

    Ok(record.canister_id)
}

/// Install wasm code on a canister (reinstall mode).
pub async fn install_code(
    canister_id: Principal,
    wasm_module: Vec<u8>,
    arg: Vec<u8>,
) -> Result<(), String> {
    let args = InstallCodeArgs {
        mode: InstallMode::reinstall,
        canister_id,
        wasm_module,
        arg,
    };

    Call::unbounded_wait(management_canister(), "install_code")
        .with_arg(args)
        .await
        .map_err(|e| format!("install_code failed: {e}"))?;

    Ok(())
}

/// Uninstall wasm code from a canister (removes the running module).
pub async fn uninstall_code(canister_id: Principal) -> Result<(), String> {
    let args = UninstallCodeArgs { canister_id };

    Call::unbounded_wait(management_canister(), "uninstall_code")
        .with_arg(args)
        .await
        .map_err(|e| format!("uninstall_code failed: {e}"))?;

    Ok(())
}

/// Update a canister's controller list.
pub async fn update_settings(
    canister_id: Principal,
    controllers: Vec<Principal>,
) -> Result<(), String> {
    let args = UpdateSettingsArgs {
        canister_id,
        settings: CanisterSettings {
            controllers: Some(controllers),
            compute_allocation: None,
            memory_allocation: None,
            freezing_threshold: None,
        },
    };

    Call::unbounded_wait(management_canister(), "update_settings")
        .with_arg(args)
        .await
        .map_err(|e| format!("update_settings failed: {e}"))?;

    Ok(())
}

/// Query the status of a canister (cycles, controllers, etc.).
pub async fn canister_status(canister_id: Principal) -> Result<CanisterStatusResponse, String> {
    let args = CanisterStatusArgs { canister_id };

    let res = Call::unbounded_wait(management_canister(), "canister_status")
        .with_arg(args)
        .await
        .map_err(|e| format!("canister_status failed: {e}"))?;

    let status: CanisterStatusResponse = res
        .candid()
        .map_err(|e| format!("canister_status decode failed: {e}"))?;

    Ok(status)
}

/// Deposit cycles from this canister's balance to a target canister.
pub async fn deposit_cycles(canister_id: Principal, cycles: u128) -> Result<(), String> {
    let args = DepositCyclesArgs { canister_id };

    Call::unbounded_wait(management_canister(), "deposit_cycles")
        .with_arg(args)
        .with_cycles(cycles)
        .await
        .map_err(|e| format!("deposit_cycles failed: {e}"))?;

    Ok(())
}
