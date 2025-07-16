use crate::dashboard::ii_principal::{
    ManageIIPrincipalArg, ManageIIPrincipalResult, manage_ii_principal,
};
use ic_cdk::api::{is_controller, msg_caller};

/// Ensures the caller is a canister controller.
///
/// Returns `Ok(())` if the caller is a controller, otherwise returns an error.
///
/// See [Guard Functions](https://docs.rs/ic-cdk/latest/ic_cdk/attr.update.html#guard-functions) for usage with `#[update(guard = "...")]`.
pub fn only_canister_controllers_guard() -> Result<(), String> {
    if is_controller(&msg_caller()) {
        Ok(())
    } else {
        Err("Caller is not a controller".to_string())
    }
}

/// Ensures the caller is the configured Internet Identity principal.
///
/// Returns `Ok(())` if the caller matches the II principal, otherwise returns an error.
/// If the II principal is not set, it will return an error indicating that the II principal is not configured.
///
/// See [Guard Functions](https://docs.rs/ic-cdk/latest/ic_cdk/attr.update.html#guard-functions) for usage with `#[update(guard = "...")]`.
pub fn only_ii_principal_guard() -> Result<(), String> {
    match manage_ii_principal(ManageIIPrincipalArg::Get) {
        ManageIIPrincipalResult::Ok(principal) => {
            if msg_caller() == principal {
                Ok(())
            } else {
                Err("Caller is not the II principal".to_string())
            }
        }
        ManageIIPrincipalResult::Err(e) => Err(e),
    }
}
