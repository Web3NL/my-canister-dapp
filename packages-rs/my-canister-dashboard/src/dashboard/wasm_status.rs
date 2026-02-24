use candid::CandidType;
use serde::{Deserialize, Serialize};

/// Status information for a Canister Dapp's WASM module.
///
/// # Example
///
/// ```rust,ignore
/// use my_canister_dashboard::WasmStatus;
/// use ic_cdk::query;
///
/// #[query]
/// fn wasm_status() -> WasmStatus {
///     WasmStatus {
///         name: "My Hello World".to_string(),
///         version: 1,
///         memo: None,
///     }
/// }
/// ```
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct WasmStatus {
    /// Name of the Canister Dapp.
    pub name: String,
    /// Version number of the WASM.
    pub version: u16,
    /// Optional memo or description.
    pub memo: Option<String>,
}
