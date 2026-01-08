use ic_cdk::{
    api::msg_caller,
    management_canister::{
        create_canister, deposit_cycles, CanisterSettings as ManagementCanisterSettings,
        CreateCanisterArgs, DepositCyclesArgs,
    },
    query, update,
};

use crate::helpers::{
    cmc_account_for_principal, get_ledger_transaction, get_transfer_amount,
    verify_transfer_destination, verify_transfer_memo, CREATE_MEMO, FAKE_CMC_CANISTER_ID,
    TPUP_MEMO,
};
use crate::{
    helpers::ICP_LEDGER_CANISTER_ID, IcpXdrConversionRate, IcpXdrConversionRateResponse,
    NotifyCreateCanisterArg, NotifyCreateCanisterResult, NotifyError, NotifyTopUpArg,
    NotifyTopUpResult,
};
use candid::{candid_method, Principal};
use ic_ledger_types::{AccountIdentifier, Subaccount};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static STORAGE: RefCell<HashMap<u64, Principal>> = RefCell::new(HashMap::new());
}

// Fixed conversion rate: 5 XDR per ICP => 5 * 10_000 permyriad
const XDR_PERMYRIAD_PER_ICP: u64 = 5 * 10_000;
// Conversion rate: 5T cycles per ICP (5 trillion cycles)
const CYCLES_PER_ICP: u128 = 5_000_000_000_000;

#[candid_method]
#[query]
fn get_icp_xdr_conversion_rate() -> IcpXdrConversionRateResponse {
    // Fixed at 5 XDR per ICP => 5 * 10_000 permyriad
    let data = IcpXdrConversionRate {
        xdr_permyriad_per_icp: XDR_PERMYRIAD_PER_ICP,
        timestamp_seconds: 0,
    };

    IcpXdrConversionRateResponse {
        certificate: serde_bytes::ByteBuf::from(Vec::new()),
        hash_tree: serde_bytes::ByteBuf::from(Vec::new()),
        data,
    }
}

#[candid_method]
#[update]
async fn notify_create_canister(arg: NotifyCreateCanisterArg) -> NotifyCreateCanisterResult {
    if let Some(existing_canister_id) =
        STORAGE.with(|storage| storage.borrow().get(&arg.block_index).copied())
    {
        return Ok(existing_canister_id);
    }

    let message_caller = msg_caller();

    let ledger_principal =
        Principal::from_text(ICP_LEDGER_CANISTER_ID).map_err(|e| NotifyError::Other {
            error_code: 500,
            error_message: format!("Invalid ledger canister ID: {e}"),
        })?;

    let transaction = get_ledger_transaction(ledger_principal, arg.block_index)
        .await
        .map_err(|e| {
            NotifyError::InvalidTransaction(format!("Failed to fetch transaction: {e}"))
        })?;

    verify_transfer_memo(&transaction, CREATE_MEMO).map_err(|e| {
        NotifyError::InvalidTransaction(format!("Transfer memo verification failed: {e}"))
    })?;

    let fake_cmc_principal =
        Principal::from_text(FAKE_CMC_CANISTER_ID).map_err(|e| NotifyError::Other {
            error_code: 500,
            error_message: format!("Invalid CMC canister ID: {e}"),
        })?;

    let expected_cmc_account = cmc_account_for_principal(fake_cmc_principal, message_caller);
    let expected_account_id = expected_cmc_account
        .subaccount
        .as_ref()
        .map(|subaccount_bytes| {
            let subaccount = Subaccount(*subaccount_bytes);
            AccountIdentifier::new(&expected_cmc_account.owner, &subaccount)
        })
        .unwrap_or_else(|| {
            AccountIdentifier::new(&expected_cmc_account.owner, &Subaccount([0; 32]))
        });

    verify_transfer_destination(&transaction, &expected_account_id)
        .map_err(NotifyError::InvalidTransaction)?;

    let canister_settings = ManagementCanisterSettings {
        controllers: Some(vec![arg.controller]),
        compute_allocation: arg
            .settings
            .as_ref()
            .and_then(|s| s.compute_allocation.clone()),
        memory_allocation: arg
            .settings
            .as_ref()
            .and_then(|s| s.memory_allocation.clone()),
        freezing_threshold: arg
            .settings
            .as_ref()
            .and_then(|s| s.freezing_threshold.clone()),
        reserved_cycles_limit: arg
            .settings
            .as_ref()
            .and_then(|s| s.reserved_cycles_limit.clone()),
        log_visibility: None, // Simplified for now
        wasm_memory_limit: arg
            .settings
            .as_ref()
            .and_then(|s| s.wasm_memory_limit.clone()),
        wasm_memory_threshold: arg
            .settings
            .as_ref()
            .and_then(|s| s.wasm_memory_threshold.clone()),
        environment_variables: None,
    };

    let create_arg = CreateCanisterArgs {
        settings: Some(canister_settings),
    };

    match create_canister(&create_arg).await {
        Ok(canister_record) => {
            STORAGE.with(|storage| {
                storage
                    .borrow_mut()
                    .insert(arg.block_index, canister_record.canister_id);
            });
            Ok(canister_record.canister_id)
        }
        Err(e) => Err(NotifyError::Other {
            error_code: 500,
            error_message: format!("Failed to create canister: {e:?}"),
        }),
    }
}

#[candid_method]
#[update]
async fn notify_top_up(arg: NotifyTopUpArg) -> NotifyTopUpResult {
    let ledger_principal =
        Principal::from_text(ICP_LEDGER_CANISTER_ID).map_err(|e| NotifyError::Other {
            error_code: 500,
            error_message: format!("Invalid ledger canister ID: {e}"),
        })?;

    let transaction = get_ledger_transaction(ledger_principal, arg.block_index)
        .await
        .map_err(|e| {
            NotifyError::InvalidTransaction(format!("Failed to fetch transaction: {e}"))
        })?;

    verify_transfer_memo(&transaction, TPUP_MEMO).map_err(|e| {
        NotifyError::InvalidTransaction(format!("Transfer memo verification failed: {e}"))
    })?;

    let fake_cmc_principal =
        Principal::from_text(FAKE_CMC_CANISTER_ID).map_err(|e| NotifyError::Other {
            error_code: 500,
            error_message: format!("Invalid CMC canister ID: {e}"),
        })?;

    let expected_cmc_account = cmc_account_for_principal(fake_cmc_principal, arg.canister_id);
    let expected_account_id = expected_cmc_account
        .subaccount
        .as_ref()
        .map(|subaccount_bytes| {
            let subaccount = Subaccount(*subaccount_bytes);
            AccountIdentifier::new(&expected_cmc_account.owner, &subaccount)
        })
        .unwrap_or_else(|| {
            AccountIdentifier::new(&expected_cmc_account.owner, &Subaccount([0; 32]))
        });

    verify_transfer_destination(&transaction, &expected_account_id)
        .map_err(NotifyError::InvalidTransaction)?;

    // Extract transfer amount and convert to cycles
    let icp_amount_e8s = get_transfer_amount(&transaction).map_err(|e| {
        NotifyError::InvalidTransaction(format!("Failed to get transfer amount: {e}"))
    })?;

    // Convert ICP (in e8s) to cycles: amount_e8s / 1e8 * CYCLES_PER_ICP
    let cycles_amount = (icp_amount_e8s as u128 * CYCLES_PER_ICP) / 100_000_000;

    // Deposit cycles to the specified canister
    let deposit_args = DepositCyclesArgs {
        canister_id: arg.canister_id,
    };

    deposit_cycles(&deposit_args, cycles_amount as u128)
        .await
        .map_err(|e| NotifyError::Other {
            error_code: 500,
            error_message: format!("Failed to deposit cycles: {e:?}"),
        })?;

    Ok(candid::Nat::from(cycles_amount))
}

#[test]
fn test_candid_interface_compatibility() {
    use candid_parser::utils::{service_equal, CandidSource};
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
