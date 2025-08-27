use candid::Principal;
use ic_cdk::call::Call;
use ic_ledger_types::{
    AccountIdentifier, GetBlocksArgs, Memo, Operation, QueryBlocksResponse, Transaction,
};
use icrc_ledger_types::icrc1::account::Account;

// Canister IDs sourced from dfx-env/dfx.json
pub const ICP_LEDGER_CANISTER_ID: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
pub const FAKE_CMC_CANISTER_ID: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";

pub const CREATE_MEMO: Memo = Memo(0x0000000041455243);
pub const TPUP_MEMO: Memo = Memo(0x0000000050555054);

pub fn cmc_account_for_principal(cmc: Principal, p: Principal) -> Account {
    let pb = p.as_slice();
    let mut sub = [0u8; 32];
    sub[0] = pb.len() as u8;
    let len = pb.len().min(31);
    sub[1..1 + len].copy_from_slice(&pb[..len]);

    Account {
        owner: cmc,
        subaccount: Some(sub),
    }
}

pub async fn get_ledger_transaction(
    ledger_id: Principal,
    block_index: u64,
) -> Result<Transaction, String> {
    let request = GetBlocksArgs {
        start: block_index,
        length: 1,
    };

    let response: QueryBlocksResponse = Call::unbounded_wait(ledger_id, "query_blocks")
        .with_args(&(request,))
        .await
        .map_err(|err| format!("Call failed: {err:?}"))?
        .candid()
        .map_err(|e| format!("Failed to decode query_blocks response: {e}"))?;

    if response.blocks.is_empty() {
        return Err(format!("Block {block_index} not found"));
    }

    Ok(response.blocks[0].transaction.clone())
}

pub fn verify_transfer_memo(transaction: &Transaction, expected_memo: Memo) -> Result<(), String> {
    let memo = get_u64_memo(transaction);

    if memo == expected_memo.0 {
        Ok(())
    } else {
        Err(format!(
            "Transaction memo mismatch: expected {}, got {}",
            expected_memo.0, memo
        ))
    }
}

pub fn verify_transfer_destination(
    transaction: &Transaction,
    expected_destination: &AccountIdentifier,
) -> Result<(), String> {
    match &transaction.operation {
        Some(Operation::Transfer { to, .. }) => {
            if to == expected_destination {
                Ok(())
            } else {
                Err(format!(
                    "Transfer destination mismatch: expected {expected_destination}, got {to}"
                ))
            }
        }
        _ => Err("Transaction is not a transfer".to_string()),
    }
}

fn get_u64_memo(transaction: &Transaction) -> u64 {
    if let Some(icrc1_memo) = &transaction.icrc1_memo {
        if icrc1_memo.len() >= 8 {
            let memo_array: [u8; 8] = icrc1_memo[..8].try_into().unwrap_or([0; 8]);
            return u64::from_le_bytes(memo_array);
        }
    }
    0
}
