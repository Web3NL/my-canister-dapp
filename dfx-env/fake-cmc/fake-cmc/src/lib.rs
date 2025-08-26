use candid::{CandidType, Deserialize, Principal};

pub mod fake_cmc;

#[derive(CandidType, Deserialize)]
pub struct IcpXdrConversionRate {
    pub xdr_permyriad_per_icp: u64,
    pub timestamp_seconds: u64,
}
#[derive(CandidType, Deserialize)]
pub struct IcpXdrConversionRateResponse {
    pub certificate: serde_bytes::ByteBuf,
    pub data: IcpXdrConversionRate,
    pub hash_tree: serde_bytes::ByteBuf,
}
pub type BlockIndex = u64;
#[derive(CandidType, Deserialize)]
pub struct SubnetFilter {
    pub subnet_type: Option<String>,
}
#[derive(CandidType, Deserialize)]
pub enum SubnetSelection {
    Filter(SubnetFilter),
    Subnet { subnet: Principal },
}
#[derive(CandidType, Deserialize)]
pub enum LogVisibility {
    #[serde(rename = "controllers")]
    Controllers,
    #[serde(rename = "public")]
    Public,
}
#[derive(CandidType, Deserialize)]
pub struct CanisterSettings {
    pub freezing_threshold: Option<candid::Nat>,
    pub wasm_memory_threshold: Option<candid::Nat>,
    pub controllers: Option<Vec<Principal>>,
    pub reserved_cycles_limit: Option<candid::Nat>,
    pub log_visibility: Option<LogVisibility>,
    pub wasm_memory_limit: Option<candid::Nat>,
    pub memory_allocation: Option<candid::Nat>,
    pub compute_allocation: Option<candid::Nat>,
}
#[derive(CandidType, Deserialize)]
pub struct NotifyCreateCanisterArg {
    pub controller: Principal,
    pub block_index: BlockIndex,
    pub subnet_selection: Option<SubnetSelection>,
    pub settings: Option<CanisterSettings>,
    pub subnet_type: Option<String>,
}
#[derive(CandidType, Deserialize)]
pub enum NotifyError {
    Refunded {
        block_index: Option<BlockIndex>,
        reason: String,
    },
    InvalidTransaction(String),
    Other {
        error_message: String,
        error_code: u64,
    },
    Processing,
    TransactionTooOld(BlockIndex),
}
pub type NotifyCreateCanisterResult = std::result::Result<Principal, NotifyError>;
#[derive(CandidType, Deserialize)]
pub struct NotifyTopUpArg {
    pub block_index: BlockIndex,
    pub canister_id: Principal,
}
pub type Cycles = candid::Nat;
pub type NotifyTopUpResult = std::result::Result<Cycles, NotifyError>;

// Index-related types for ledger interaction
#[derive(CandidType, Deserialize)]
pub struct IndexGetAccountIdentifierTransactionsArgs {
    pub max_results: u64,
    pub start: Option<u64>,
    pub account_identifier: String,
}

#[derive(CandidType, Deserialize)]
pub struct IndexTokens {
    pub e8s: u64,
}

#[derive(CandidType, Deserialize)]
pub struct IndexTimeStamp {
    pub timestamp_nanos: u64,
}

#[derive(CandidType, Deserialize)]
pub struct IndexTransaction {
    pub memo: u64,
    pub icrc1_memo: Option<Vec<u8>>, // ic index uses opt vec nat8
    #[allow(dead_code)]
    pub operation: IndexOperation,
    #[allow(dead_code)]
    pub created_at_time: Option<IndexTimeStamp>,
    #[allow(dead_code)]
    pub timestamp: Option<IndexTimeStamp>,
}

#[derive(CandidType, Deserialize)]
pub enum IndexOperation {
    #[allow(dead_code)]
    Approve {
        fee: IndexTokens,
        from: String,
        allowance: IndexTokens,
        expires_at: Option<IndexTimeStamp>,
        spender: String,
        expected_allowance: Option<IndexTokens>,
    },
    Burn {
        from: String,
        amount: IndexTokens,
        spender: Option<String>,
    },
    Mint {
        to: String,
        amount: IndexTokens,
    },
    Transfer {
        to: String,
        fee: IndexTokens,
        from: String,
        amount: IndexTokens,
        spender: Option<String>,
    },
}

#[derive(CandidType, Deserialize)]
pub struct IndexTransactionWithId {
    pub id: u64,
    pub transaction: IndexTransaction,
}

#[derive(CandidType, Deserialize)]
pub struct IndexGetAccountIdentifierTransactionsResponse {
    #[allow(dead_code)]
    pub balance: u64,
    pub transactions: Vec<IndexTransactionWithId>,
    #[allow(dead_code)]
    pub oldest_tx_id: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct IndexError {
    pub message: String,
}

#[derive(CandidType, Deserialize)]
pub enum IndexGetAccountIdentifierTransactionsResult {
    Ok(IndexGetAccountIdentifierTransactionsResponse),
    Err(IndexError),
}

pub enum TransferCheckResult {
    Found(u64),
    Processing,
}
