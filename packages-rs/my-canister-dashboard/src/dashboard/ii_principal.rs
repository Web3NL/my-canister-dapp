use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

thread_local! {
    static II_PRINCIPAL: RefCell<Option<Principal>> = const { RefCell::new(None) };
}

/// Arguments for managing the Internet Identity principal at user dapp domain.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ManageIIPrincipalArg {
    /// Set the II principal to the provided value.
    Set(Principal),
    /// Get the currently stored II principal.
    Get,
}

/// Result of managing the Internet Identity principal.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ManageIIPrincipalResult {
    /// Operation succeeded, returns the principal.
    Ok(Principal),
    /// Operation failed with an error message.
    Err(String),
}

/// Manages the storage for Internet Identity principal at user dapp domain
///
/// # Arguments
///
/// * `arg` - The operation to perform (Set or Get)
///
/// # Returns
///
/// The result of the operation containing either the principal or an error.
///
/// # Example
///
/// ```rust
/// use my_canister_dashboard::{ManageIIPrincipalArg, ManageIIPrincipalResult, guards::only_canister_controllers_guard};
/// use ic_cdk::update;
///
/// #[update(guard = "only_canister_controllers_guard")]
/// fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
///     my_canister_dashboard::manage_ii_principal(arg)
/// }
/// ```
pub fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    match arg {
        ManageIIPrincipalArg::Set(principal) => {
            set_ii_principal(principal);
            match get_ii_principal() {
                Some(p) => ManageIIPrincipalResult::Ok(p),
                None => ManageIIPrincipalResult::Err("Failed to set principal".to_string()),
            }
        }
        ManageIIPrincipalArg::Get => match get_ii_principal() {
            Some(principal) => ManageIIPrincipalResult::Ok(principal),
            None => ManageIIPrincipalResult::Err("No principal set".to_string()),
        },
    }
}

fn set_ii_principal(principal: Principal) {
    II_PRINCIPAL.with(|p| {
        *p.borrow_mut() = Some(principal);
    });
}

fn get_ii_principal() -> Option<Principal> {
    II_PRINCIPAL.with(|p| *p.borrow())
}
