use candid::{CandidType, Principal};
use ic_cdk::call::Call;
use serde::Deserialize;

// ---------------------------------------------------------------------------
// Local Candid types for dashboard endpoints (no dependency on the crate)
// ---------------------------------------------------------------------------

#[derive(CandidType)]
enum ManageAlternativeOriginsArg {
    Add(String),
    #[allow(dead_code)]
    Remove(String),
    #[allow(dead_code)]
    Get,
}

#[derive(CandidType, Deserialize)]
enum ManageAlternativeOriginsResult {
    Ok,
    Err(String),
}

#[derive(CandidType)]
enum ManageIIPrincipalArg {
    Set(Principal),
    #[allow(dead_code)]
    Get,
}

#[derive(CandidType, Deserialize)]
enum ManageIIPrincipalResult {
    Ok(Principal),
    Err(String),
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Add an alternative origin to a canister's II configuration.
pub async fn add_alternative_origin(canister_id: Principal, origin: String) -> Result<(), String> {
    let arg = ManageAlternativeOriginsArg::Add(origin);

    let res = Call::unbounded_wait(canister_id, "manage_alternative_origins")
        .with_arg(arg)
        .await
        .map_err(|e| format!("manage_alternative_origins failed: {e}"))?;

    let result: ManageAlternativeOriginsResult = res
        .candid()
        .map_err(|e| format!("manage_alternative_origins decode failed: {e}"))?;

    match result {
        ManageAlternativeOriginsResult::Ok => Ok(()),
        ManageAlternativeOriginsResult::Err(e) => {
            Err(format!("manage_alternative_origins error: {e}"))
        }
    }
}

/// Set the II principal on a canister's dashboard.
pub async fn set_ii_principal(canister_id: Principal, principal: Principal) -> Result<(), String> {
    let arg = ManageIIPrincipalArg::Set(principal);

    let res = Call::unbounded_wait(canister_id, "manage_ii_principal")
        .with_arg(arg)
        .await
        .map_err(|e| format!("manage_ii_principal failed: {e}"))?;

    let result: ManageIIPrincipalResult = res
        .candid()
        .map_err(|e| format!("manage_ii_principal decode failed: {e}"))?;

    match result {
        ManageIIPrincipalResult::Ok(_) => Ok(()),
        ManageIIPrincipalResult::Err(e) => Err(format!("manage_ii_principal error: {e}")),
    }
}
