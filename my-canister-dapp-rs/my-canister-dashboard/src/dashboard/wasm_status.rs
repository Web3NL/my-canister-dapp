use candid::CandidType;
use serde::{Deserialize, Serialize};

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct WasmStatus {
    pub name: String,
    pub version: u16,
    pub memo: Option<String>,
}
