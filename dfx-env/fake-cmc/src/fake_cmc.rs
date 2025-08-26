// moved from nested crate
use ic_cdk::management_canister::{
    CanisterSettings as MgmtCanisterSettings, ProvisionalCreateCanisterWithCyclesArgs,
    ProvisionalTopUpCanisterArgs, provisional_create_canister_with_cycles,
    provisional_top_up_canister,
};
use ic_cdk::{query, update};

use crate::{
    IcpXdrConversionRate, IcpXdrConversionRateResponse, IndexGetAccountIdentifierTransactionsArgs,
    IndexGetAccountIdentifierTransactionsResult, IndexOperation, NotifyCreateCanisterArg,
    NotifyCreateCanisterResult, NotifyError, NotifyTopUpArg, NotifyTopUpResult,
    TransferCheckResult,
};
use candid::Principal;
use candid::candid_method;
use ic_ledger_types::{AccountIdentifier, Subaccount};

// --- Constants & helpers ---

// Constant conversion rate for now
// We follow the convention used in rs: cycles_per_icp = permyriad * 1e8.
// Pick 1 ICP = 100 XDR => permyriad = 100 * 10_000 = 1_000_000
const XDR_PERMYRIAD_PER_ICP: u64 = 1_000_000; // 100 XDR per ICP

// ICP Ledger principal (mainnet)
const _ICP_LEDGER_ID_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const ICP_INDEX_CANISTER_ID: &str = "qhbym-qaaaa-aaaaa-aaafq-cai";

// ICRC-1 memos used by the flow
// CREATE memo required by CMC for canister-creation transfers: 'CREA' + zeros in LE
const CREATE_MEMO: [u8; 8] = [0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x00];
// TPUP memo required by CMC for top-up transfers
const TPUP_MEMO: [u8; 8] = [0x54, 0x50, 0x55, 0x50, 0x00, 0x00, 0x00, 0x00];

// Compute the AccountIdentifier for sending ICP to the CMC with the subaccount derived from a principal.
fn cmc_account_for_principal(cmc: Principal, p: Principal) -> AccountIdentifier {
    // Subaccount: [len(principal), principal-bytes..., padding]
    let pb = p.as_slice();
    let mut sub = [0u8; 32];
    sub[0] = pb.len() as u8;
    let len = pb.len().min(31);
    sub[1..1 + len].copy_from_slice(&pb[..len]);
    let subaccount = Subaccount(sub);
    AccountIdentifier::new(&cmc, &subaccount)
}

async fn verify_transfer_via_index(
    block_index: u64,
    expected_to: &AccountIdentifier,
    expected_memo: &[u8; 8],
) -> Result<TransferCheckResult, String> {
    let index_id = Principal::from_text(ICP_INDEX_CANISTER_ID)
        .map_err(|e| format!("invalid index canister id: {e}"))?;
    let to_text = expected_to.to_string();

    // Fetch up to N latest txs for that destination account id
    let args = IndexGetAccountIdentifierTransactionsArgs {
        account_identifier: to_text.clone(),
        start: None,
        max_results: 500,
    };

    let res = ic_cdk::call::Call::unbounded_wait(index_id, "get_account_identifier_transactions")
        .with_arg(args)
        .await
        .map_err(|e| format!("index call failed: {e:?}"))?;
    let decoded: (IndexGetAccountIdentifierTransactionsResult,) = res
        .candid()
        .map_err(|e| format!("index decode failed: {e:?}"))?;

    let list = match decoded.0 {
        IndexGetAccountIdentifierTransactionsResult::Ok(r) => r.transactions,
        IndexGetAccountIdentifierTransactionsResult::Err(e) => {
            return Err(format!("index returned error: {}", e.message));
        }
    };

    // Find the tx with matching id
    if let Some(t) = list.into_iter().find(|t| t.id == block_index) {
        // Check memo
        match &t.transaction.icrc1_memo {
            Some(m) if m.as_slice() == expected_memo => {}
            Some(m) => return Err(format!("memo mismatch: got {m:?}")),
            None => return Err("missing memo".into()),
        }

        // Also ensure destination account id matches expected
        if let IndexOperation::Transfer { to, .. } = &t.transaction.operation {
            if to.as_str() != to_text.as_str() {
                return Err(format!(
                    "destination mismatch: expected {to_text}, got {to}"
                ));
            }
        }

        // Return amount e8s
        if let IndexOperation::Transfer { amount, .. } = &t.transaction.operation {
            return Ok(TransferCheckResult::Found(amount.e8s));
        }
        return Err("not a transfer operation".into());
    }

    Ok(TransferCheckResult::Processing)
}

#[candid_method]
#[query]
fn get_icp_xdr_conversion_rate() -> IcpXdrConversionRateResponse {
    IcpXdrConversionRateResponse {
        certificate: Default::default(),
        hash_tree: Default::default(),
        data: IcpXdrConversionRate {
            xdr_permyriad_per_icp: XDR_PERMYRIAD_PER_ICP,
            timestamp_seconds: ic_cdk::api::time() / 1_000_000_000,
        },
    }
}

#[candid_method]
#[update]
async fn notify_create_canister(arg: NotifyCreateCanisterArg) -> NotifyCreateCanisterResult {
    // 1) Validate the transfer destination and memo. Destination is CMC account with subaccount = controller principal.
    let cmc_id = ic_cdk::api::canister_self();
    let expected_ai = cmc_account_for_principal(cmc_id, arg.controller);

    let amount_e8s =
        match verify_transfer_via_index(arg.block_index, &expected_ai, &CREATE_MEMO).await {
            Ok(TransferCheckResult::Found(a)) => a,
            Ok(TransferCheckResult::Processing) => return Err(NotifyError::Processing),
            Err(err) => return Err(NotifyError::InvalidTransaction(err)),
        };

    // Use minimal settings: set controller only (safe for stub)
    let settings_final = MgmtCanisterSettings {
        controllers: Some(vec![arg.controller]),
        ..Default::default()
    };

    // Compute cycles to attach from received ICP
    let minted_cycles: u128 = (amount_e8s as u128).saturating_mul(XDR_PERMYRIAD_PER_ICP as u128);

    let res = provisional_create_canister_with_cycles(&ProvisionalCreateCanisterWithCyclesArgs {
        settings: Some(settings_final),
        amount: Some(minted_cycles.into()),
        specified_id: None,
    })
    .await;

    match res {
        Ok(cid_record) => Ok(cid_record.canister_id),
        Err(e) => Err(NotifyError::Other {
            error_code: 500,
            error_message: format!("failed to create canister: {e:?}"),
        }),
    }
}

#[candid_method]
#[update]
async fn notify_top_up(arg: NotifyTopUpArg) -> NotifyTopUpResult {
    // Validate memo and destination similarly to creation flow.
    let cmc_id = ic_cdk::api::canister_self();
    let expected_ai = cmc_account_for_principal(cmc_id, arg.canister_id);
    let amount_e8s =
        match verify_transfer_via_index(arg.block_index, &expected_ai, &TPUP_MEMO).await {
            Ok(TransferCheckResult::Found(a)) => a,
            Ok(TransferCheckResult::Processing) => return Err(NotifyError::Processing),
            Err(err) => return Err(NotifyError::InvalidTransaction(err)),
        };

    // Convert ICP to cycles and top up provisionally
    let minted_cycles: u128 = (amount_e8s as u128).saturating_mul(XDR_PERMYRIAD_PER_ICP as u128);

    let res = provisional_top_up_canister(&ProvisionalTopUpCanisterArgs {
        canister_id: arg.canister_id,
        amount: minted_cycles.into(),
    })
    .await;

    match res {
        Ok(()) => Ok(minted_cycles.into()),
        Err(e) => Err(NotifyError::Other {
            error_code: 501,
            error_message: format!("failed to deposit cycles: {e:?}"),
        }),
    }
}

#[test]
fn test_candid_interface_compatibility() {
    use candid_parser::utils::{CandidSource, service_equal};
    use std::path::PathBuf;

    candid::export_service!();
    let exported_interface = __export_service();

    let expected_interface =
        PathBuf::from(std::env::var("CARGO_MANIFEST_DIR").unwrap()).join("fake-cmc.did");

    println!(
        "Expected interface: {}\n\n",
        CandidSource::File(expected_interface.as_path())
            .load()
            .unwrap()
            .1
            .unwrap()
    );
    println!("Exported interface: {exported_interface}\n\n");

    service_equal(
        CandidSource::Text(&exported_interface),
        CandidSource::File(expected_interface.as_path()),
    )
    .expect("The fake-cmc interface is not compatible with the fake-cmc.did file");
}
