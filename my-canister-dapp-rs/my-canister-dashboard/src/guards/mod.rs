use crate::dashboard::ii_principal::{
    ManageIIPrincipalArg, ManageIIPrincipalResult, manage_ii_principal,
};
use ic_cdk::api::{is_controller, msg_caller};

pub fn only_canister_controllers_guard() -> Result<(), String> {
    if is_controller(&msg_caller()) {
        Ok(())
    } else {
        Err("Caller is not a controller".to_string())
    }
}

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
