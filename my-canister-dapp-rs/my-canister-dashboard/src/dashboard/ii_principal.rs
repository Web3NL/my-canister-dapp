use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

thread_local! {
    static II_PRINCIPAL: RefCell<Option<Principal>> = const { RefCell::new(None) };
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ManageIIPrincipalArg {
    Set(Principal),
    Get,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum ManageIIPrincipalResult {
    Ok(Principal),
    Err(String),
}

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
