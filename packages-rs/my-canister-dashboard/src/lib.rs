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
pub use dashboard::top_up_rule::{
    CyclesAmount, ManageTopUpRuleArg, ManageTopUpRuleResult, TopUpInterval, TopUpRule,
    manage_top_up_rule,
};
pub use dashboard::wasm_status::WasmStatus;
pub use dashboard::{
    ALTERNATIVE_ORIGINS_PATH, CANISTER_DASHBOARD_CSS_PATH, CANISTER_DASHBOARD_HTML_PATH,
    CANISTER_DASHBOARD_JS_PATH,
};

/// SHA-256 hashes of dashboard frontend assets for each published version.
/// Used by the acceptance test library to verify deployed canisters serve
/// unmodified dashboard assets.
pub const ASSET_HASHES_JSON: &str = include_str!("../asset-hashes.json");
