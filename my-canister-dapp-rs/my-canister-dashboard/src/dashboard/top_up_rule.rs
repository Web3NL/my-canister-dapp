use candid::Principal;
use candid::{CandidType, Nat};
use ic_cdk::call::Call;
use ic_cdk::futures::spawn;
use ic_cdk_timers::{TimerId, clear_timer, set_timer_interval};
use icrc_ledger_types::icrc1::account::Account as Icrc1Account;
use num_traits::ToPrimitive;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

const ICP_LEDGER_ID_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const CMC_CANISTER_ID_TEXT: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";
const ICRC1_FEE_E8S: u64 = 10_000;

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageTopUpRuleArg {
    Get,
    Add(TopUpRule),
    Clear,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageTopUpRuleResult {
    Ok(Option<TopUpRule>),
    Err(String),
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum TopUpInterval {
    Hourly,
    Daily,
    Weekly,
    Monthly,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum CyclesAmount {
    _0_25T,
    _0_5T,
    _1T,
    _2T,
    _5T,
    _10T,
    _50T,
    _100T,
}

impl CyclesAmount {
    pub fn as_cycles(&self) -> u64 {
        match self {
            CyclesAmount::_0_25T => 250_000_000_000,
            CyclesAmount::_0_5T => 500_000_000_000,
            CyclesAmount::_1T => 1_000_000_000_000,
            CyclesAmount::_2T => 2_000_000_000_000,
            CyclesAmount::_5T => 5_000_000_000_000,
            CyclesAmount::_10T => 10_000_000_000_000,
            CyclesAmount::_50T => 50_000_000_000_000,
            CyclesAmount::_100T => 100_000_000_000_000,
        }
    }
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct TopUpRule {
    pub interval: TopUpInterval,
    pub cycles_threshold: CyclesAmount, // top up when canister's cycles below this
    pub cycles_amount: CyclesAmount,    // cycles amount
}

thread_local! {
    static TOP_UP_RULE: RefCell<Option<TopUpRule>> = const { RefCell::new(None) };
    static TOP_UP_TIMER_ID: RefCell<Option<TimerId>> = const { RefCell::new(None) };
    static TOP_UP_MINT_INFLIGHT: RefCell<bool> = const { RefCell::new(false) };
    static TOP_UP_LAST_BLOCK_INDEX: RefCell<Option<u64>> = const { RefCell::new(None) };
}

pub fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    match arg {
        ManageTopUpRuleArg::Get => ManageTopUpRuleResult::Ok(current_rule()),
        ManageTopUpRuleArg::Add(rule) => {
            // Clear any existing timer first
            clear_existing_timer();

            // Store rule
            TOP_UP_RULE.with(|cell| {
                *cell.borrow_mut() = Some(rule.clone());
            });
            ic_cdk::println!(
                "top-up: rule set amount={} threshold={} interval={:?}",
                rule.cycles_amount.as_cycles(),
                rule.cycles_threshold.as_cycles(),
                rule.interval
            );

            // Set new interval timer and store its id
            let interval = interval_duration(&rule.interval);
            let timer_id = set_timer_interval(interval, on_top_up_interval_tick);
            TOP_UP_TIMER_ID.with(|cell| {
                *cell.borrow_mut() = Some(timer_id);
            });
            ic_cdk::println!("top-up: timer set every {}s", interval.as_secs());
            // set_timer_interval schedules the first tick after the interval elapses.
            // Trigger once immediately so the first check happens right away.
            on_top_up_interval_tick();
            ManageTopUpRuleResult::Ok(current_rule())
        }
        ManageTopUpRuleArg::Clear => {
            // Clear any active timer and the stored rule, unconditionally
            clear_existing_timer();
            TOP_UP_RULE.with(|cell| {
                *cell.borrow_mut() = None;
            });
            ic_cdk::println!("top-up: rule cleared");
            ManageTopUpRuleResult::Ok(current_rule())
        }
    }
}

fn current_rule() -> Option<TopUpRule> {
    TOP_UP_RULE.with(|cell| cell.borrow().clone())
}

fn clear_existing_timer() {
    TOP_UP_TIMER_ID.with(|cell| {
        if let Some(timer_id) = cell.borrow_mut().take() {
            clear_timer(timer_id);
            ic_cdk::println!("top-up: timer cleared");
        }
    });
}

fn on_top_up_interval_tick() {
    spawn(async move {
        ic_cdk::println!("top-up: tick");
        if let Some(rule) = current_rule() {
            // Log the active rule and its interval duration for traceability
            let every = interval_duration(&rule.interval).as_secs();
            ic_cdk::println!(
                "top-up: active rule amount={} threshold={} interval={:?} every={}s",
                rule.cycles_amount.as_cycles(),
                rule.cycles_threshold.as_cycles(),
                rule.interval,
                every
            );
            // Hysteresis: only top up if cycles are below threshold minus 10% buffer
            let threshold = rule.cycles_threshold.as_cycles() as u128;
            let hysteresis = threshold / 10; // 10%
            let activate_below = threshold - hysteresis;

            let current_cycles = ic_cdk::api::canister_cycle_balance();

            if current_cycles < activate_below {
                ic_cdk::println!(
                    "top-up: below threshold current={} activate_below={}",
                    current_cycles,
                    activate_below
                );
                let needed_cycles = rule.cycles_amount.as_cycles();
                match compute_icp_needed_e8s(&needed_cycles.into()).await {
                    Ok(needed_icp_e8s) => {
                        ic_cdk::println!(
                            "top-up: convert cycles={} -> icp_e8s={}",
                            needed_cycles,
                            needed_icp_e8s
                        );
                        match icrc1_balance_of_e8s(ic_cdk::api::canister_self()).await {
                            Ok(balance_e8s) if balance_e8s >= needed_icp_e8s => {
                                // Idempotency: skip if previous mint is still in flight
                                let busy = TOP_UP_MINT_INFLIGHT.with(|f| *f.borrow());
                                if busy {
                                    ic_cdk::println!("Mint in-flight; skipping this tick");
                                } else {
                                    TOP_UP_MINT_INFLIGHT.with(|f| *f.borrow_mut() = true);
                                    ic_cdk::println!("top-up: starting transfer + notify flow");
                                    let res = cmc_deposit_and_mint(needed_icp_e8s).await;
                                    if let Err(e) = res {
                                        ic_cdk::println!("CMC mint error: {}", e);
                                    } else {
                                        ic_cdk::println!("top-up: flow completed");
                                    }
                                    TOP_UP_MINT_INFLIGHT.with(|f| *f.borrow_mut() = false);
                                }
                            }
                            Ok(balance_e8s) => ic_cdk::println!(
                                "Insufficient ICP balance: have {}, need {}",
                                balance_e8s,
                                needed_icp_e8s
                            ),
                            Err(e) => ic_cdk::println!("Ledger balance error: {}", e),
                        }
                    }
                    Err(e) => {
                        ic_cdk::println!(
                            "top-up: failed to compute needed ICP for cycles={}: {}",
                            needed_cycles,
                            e
                        );
                    }
                }
            } else {
                ic_cdk::println!(
                    "top-up: cycles above threshold; skipping current={} activate_below={}",
                    current_cycles,
                    activate_below
                );
            }
        } else {
            ic_cdk::println!("top-up: no rule set; skipping");
        }
    });
}

fn interval_duration(interval: &TopUpInterval) -> std::time::Duration {
    use std::time::Duration;
    match interval {
        TopUpInterval::Hourly => Duration::from_secs(60 * 60),
        TopUpInterval::Daily => Duration::from_secs(24 * 60 * 60),
        TopUpInterval::Weekly => Duration::from_secs(7 * 24 * 60 * 60),
        TopUpInterval::Monthly => Duration::from_secs(30 * 24 * 60 * 60),
    }
}

// --- ICP ledger and exchange rate helpers (stubs/minimal impls) ---

// Get this canister's ICP balance by calling the ICRC-1 ledger balance_of
async fn icrc1_balance_of_e8s(owner: Principal) -> Result<u64, String> {
    // Mainnet ICP ICRC-1 ledger canister
    let ledger = Principal::from_text(ICP_LEDGER_ID_TEXT)
        .map_err(|e| format!("ledger principal parse error: {e}"))?;
    let account = Icrc1Account {
        owner,
        subaccount: None,
    };
    let res = Call::unbounded_wait(ledger, "icrc1_balance_of")
        .with_arg((account,))
        .await
        .map_err(|e| format!("icrc1_balance_of failed: {e:?}"))?;
    let (balance_nat,): (Nat,) = res
        .candid_tuple()
        .map_err(|e| format!("icrc1_balance_of candid decode failed: {e:?}"))?;
    let bal_u128 = balance_nat
        .0
        .to_u128()
        .ok_or_else(|| "balance too large".to_string())?;
    let bal = bal_u128 as u64;
    ic_cdk::println!("top-up: icp balance e8s={}", bal);
    Ok(bal)
}

// Compute ICP needed (e8s) from cycles needed.
// Tries an exchange rate canister; falls back to a sanity ratio if unavailable.
async fn compute_icp_needed_e8s(cycles: &Nat) -> Result<u64, String> {
    // Fallback sanity ratio: 1 ICP (1e8 e8s) per 1e12 cycles
    let fallback_cycles_per_icp = Nat::from(1_000_000_000_000u64);
    let fallback = || -> Result<u64, String> {
        let cycles_u128 = cycles
            .0
            .to_u128()
            .ok_or_else(|| "cycles too large".to_string())?;
        let denom = fallback_cycles_per_icp
            .0
            .to_u128()
            .ok_or_else(|| "invalid denom".to_string())?;
        if denom == 0 {
            return Err("invalid denom".to_string());
        }
        let icp = (cycles_u128 / denom).saturating_mul(100_000_000u128);
        Ok(icp as u64)
    };

    match fetch_cycles_per_icp().await {
        Ok(cycles_per_icp) if cycles_per_icp > 0 => {
            ic_cdk::println!("top-up: xrc cycles_per_icp={}", cycles_per_icp);
            let cycles_u128 = cycles
                .0
                .to_u128()
                .ok_or_else(|| "cycles too large".to_string())?;
            let denom: u128 = cycles_per_icp as u128;
            if denom == 0 {
                return Err("invalid denom".to_string());
            }
            let icp = (cycles_u128 / denom).saturating_mul(100_000_000u128);
            Ok(icp as u64)
        }
        _ => {
            ic_cdk::println!("top-up: xrc unavailable; using fallback ratio");
            fallback()
        }
    }
}

// Exchange rate fetch (stub): returns cycles per ICP as u64
async fn fetch_cycles_per_icp() -> Result<u64, String> {
    // Query CMC's get_icp_xdr_conversion_rate and convert XDR→cycles using 1 XDR = 1e12 cycles.
    let cmc = Principal::from_text(CMC_CANISTER_ID_TEXT)
        .map_err(|e| format!("CMC principal parse error: {e}"))?;

    #[derive(CandidType, Deserialize)]
    struct IcpXdrConversionRate {
        timestamp_seconds: u64,
        xdr_permyriad_per_icp: u64,
    }
    #[derive(CandidType, Deserialize)]
    struct IcpXdrConversionRateResponse {
        data: IcpXdrConversionRate,
        hash_tree: Vec<u8>,
        certificate: Vec<u8>,
    }

    let res = Call::unbounded_wait(cmc, "get_icp_xdr_conversion_rate")
        .with_arg(())
        .await
        .map_err(|e| format!("get_icp_xdr_conversion_rate failed: {e:?}"))?;
    let resp: IcpXdrConversionRateResponse = res
        .candid()
        .map_err(|e| format!("get_icp_xdr_conversion_rate candid decode failed: {e:?}"))?;

    let permyriad = resp.data.xdr_permyriad_per_icp as u128; // XDR*10_000 per 1 ICP
    // cycles_per_icp = (permyriad / 10_000) * 1e12 = permyriad * 1e8
    let cycles_per_icp = permyriad
        .checked_mul(100_000_000u128)
        .ok_or_else(|| "cycles_per_icp overflow".to_string())?;
    if cycles_per_icp > u64::MAX as u128 {
        return Err("cycles_per_icp too large".to_string());
    }
    Ok(cycles_per_icp as u64)
}

// Deposit ICP and mint cycles via CMC: minimal idempotency using last block index.
async fn cmc_deposit_and_mint(amount_e8s: u64) -> Result<(), String> {
    // Always use standard ICP ledger fee and deduct it from the transfer amount
    let cmc = Principal::from_text(CMC_CANISTER_ID_TEXT)
        .map_err(|e| format!("CMC principal parse error: {e}"))?;
    let this_canister = ic_cdk::api::canister_self();

    // 1) If we have a pending block_index, try notifying it first.
    if let Some(prev_block) = TOP_UP_LAST_BLOCK_INDEX.with(|c| *c.borrow()) {
        ic_cdk::println!("top-up: notifying previous block_index={}", prev_block);
        match cmc_notify_top_up(prev_block, this_canister).await {
            Ok(_minted_cycles) => {
                TOP_UP_LAST_BLOCK_INDEX.with(|c| *c.borrow_mut() = None);
                ic_cdk::println!("top-up: notify previous block succeeded");
                return Ok(());
            }
            Err(NotifyError::Processing) => {
                // Still processing; keep the block stored and exit to retry later
                ic_cdk::println!("top-up: notify still processing");
                return Err("CMC notify_top_up still processing".into());
            }
            Err(_) => {
                // Non-retriable errors; drop the stored block and proceed to a new transfer
                TOP_UP_LAST_BLOCK_INDEX.with(|c| *c.borrow_mut() = None);
                ic_cdk::println!("top-up: notify failed non-retriable; proceeding to new transfer");
            }
        }
    }

    // 2) No pending notification; perform transfer to CMC minting account for this canister
    if amount_e8s <= ICRC1_FEE_E8S {
        return Err("required ICP amount is not sufficient to cover the fee".into());
    }
    let transfer_amount_e8s = amount_e8s - ICRC1_FEE_E8S;
    ic_cdk::println!(
        "top-up: transfer {} e8s to CMC (fee {} e8s, total debit {} e8s)",
        transfer_amount_e8s,
        ICRC1_FEE_E8S,
        amount_e8s
    );
    let block_index = icrc1_transfer_to_cmc_topup(cmc, this_canister, transfer_amount_e8s).await?;
    ic_cdk::println!("top-up: transfer ok, block_index={}", block_index);
    TOP_UP_LAST_BLOCK_INDEX.with(|c| *c.borrow_mut() = Some(block_index));

    // 3) Try to notify immediately
    ic_cdk::println!("top-up: notifying block_index={}", block_index);
    match cmc_notify_top_up(block_index, this_canister).await {
        Ok(_minted_cycles) => {
            TOP_UP_LAST_BLOCK_INDEX.with(|c| *c.borrow_mut() = None);
            ic_cdk::println!("top-up: notify succeeded");
            Ok(())
        }
        Err(NotifyError::Processing) => {
            // Keep stored; will retry later
            ic_cdk::println!("top-up: notify processing; will retry later");
            Err("CMC notify_top_up processing".into())
        }
        Err(e) => {
            // Drop stored index on non-retriable errors
            TOP_UP_LAST_BLOCK_INDEX.with(|c| *c.borrow_mut() = None);
            Err(format!("CMC notify_top_up error: {e:?}"))
        }
    }
}

// Compute the CMC top-up destination account for a target canister: CMC as owner, subaccount derived from canister id
fn cmc_topup_account_for(cmc: Principal, target: Principal) -> Icrc1Account {
    // Official CMC top-up subaccount derivation:
    // subaccount[0] = len(principal_bytes); subaccount[1..1+len] = principal_bytes; rest zeroed
    let mut sub = [0u8; 32];
    let bytes = target.as_slice();
    let len = bytes.len().min(31); // reserve sub[0] for the length
    sub[0] = len as u8;
    sub[1..1 + len].copy_from_slice(&bytes[..len]);
    Icrc1Account {
        owner: cmc,
        subaccount: Some(sub),
    }
}

// Perform an ICRC-1 transfer to the CMC minting account for this canister and return the ledger block index (u64)
async fn icrc1_transfer_to_cmc_topup(
    cmc: Principal,
    target_canister: Principal,
    amount_e8s: u64,
) -> Result<u64, String> {
    use icrc_ledger_types::icrc1::transfer::{TransferArg, TransferError};

    let ledger = Principal::from_text(ICP_LEDGER_ID_TEXT)
        .map_err(|e| format!("ledger principal parse error: {e}"))?;

    let to = cmc_topup_account_for(cmc, target_canister);
    let arg = TransferArg {
        from_subaccount: None,
        to,
        amount: Nat::from(amount_e8s),
        fee: Some(Nat::from(ICRC1_FEE_E8S)),
        memo: None,
        created_at_time: None,
    };

    // icrc1_transfer returns Result<Nat, TransferError>
    let res = Call::unbounded_wait(ledger, "icrc1_transfer")
        .with_arg((arg,))
        .await
        .map_err(|e| format!("icrc1_transfer failed: {e:?}"))?;
    let result: Result<Nat, TransferError> = res
        .candid()
        .map_err(|e| format!("icrc1_transfer candid decode failed: {e:?}"))?;

    match result {
        Ok(block_index_nat) => {
            let bi = block_index_nat
                .0
                .to_u128()
                .ok_or_else(|| "block index too large".to_string())?;
            if bi > u64::MAX as u128 {
                return Err("block index does not fit u64".into());
            }
            Ok(bi as u64)
        }
        Err(e) => Err(format!("icrc1_transfer error: {e:?}")),
    }
}

// notify_top_up definitions and call
#[derive(CandidType, Deserialize, Debug)]
struct NotifyTopUpArg {
    block_index: u64,
    canister_id: Principal,
}

#[derive(CandidType, Deserialize, Debug)]
enum NotifyError {
    Refunded {
        reason: String,
        block_index: Option<u64>,
    },
    Processing,
    TransactionTooOld(u64),
    InvalidTransaction(String),
    Other {
        error_code: u64,
        error_message: String,
    },
}

#[derive(CandidType, Deserialize, Debug)]
enum NotifyTopUpResult {
    Ok(Nat),
    Err(NotifyError),
}

async fn cmc_notify_top_up(block_index: u64, canister_id: Principal) -> Result<Nat, NotifyError> {
    let cmc = Principal::from_text(CMC_CANISTER_ID_TEXT).map_err(|_| NotifyError::Other {
        error_code: 0,
        error_message: "invalid CMC principal".into(),
    })?;

    let res = Call::unbounded_wait(cmc, "notify_top_up")
        .with_arg((NotifyTopUpArg {
            block_index,
            canister_id,
        },))
        .await
        .map_err(|e| NotifyError::Other {
            error_code: 1,
            error_message: format!("notify_top_up failed: {e:?}"),
        })?;
    let result: NotifyTopUpResult = res.candid().map_err(|e| NotifyError::Other {
        error_code: 2,
        error_message: format!("notify_top_up candid decode failed: {e:?}"),
    })?;

    match result {
        NotifyTopUpResult::Ok(cycles) => Ok(cycles),
        NotifyTopUpResult::Err(e) => Err(e),
    }
}
