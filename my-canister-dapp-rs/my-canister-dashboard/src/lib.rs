#![doc = include_str!("../README.md")]

mod dashboard;
pub mod guards;
pub mod setup;

pub use dashboard::alternative_origins::{
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, manage_alternative_origins,
};
pub use dashboard::ii_principal::{
    ManageIIPrincipalArg, ManageIIPrincipalResult, manage_ii_principal,
};
pub use dashboard::wasm_status::WasmStatus;
pub use dashboard::{
    ALTERNATIVE_ORIGINS_PATH, CANISTER_DASHBOARD_CSS_PATH, CANISTER_DASHBOARD_HTML_PATH,
    CANISTER_DASHBOARD_JS_PATH,
};
