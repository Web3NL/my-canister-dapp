use candid::Principal;
use candid::{CandidType, Nat};
use ic_cdk::call::Call;
use ic_cdk::futures::spawn;
use ic_cdk_timers::{TimerId, clear_timer, set_timer_interval};
use ic_ledger_types::{
    AccountIdentifier, BlockIndex, Memo, Subaccount, Tokens, TransferArgs, TransferError,
};
use num_traits::ToPrimitive;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

const ICP_LEDGER_ID_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
const CMC_CANISTER_ID_TEXT: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";
const ICRC1_FEE_E8S: u64 = 10_000;
// TPUP memo required by CMC for top-up transfers
const TPUP_MEMO: [u8; 8] = [0x54, 0x50, 0x55, 0x50, 0x00, 0x00, 0x00, 0x00];

/// Arguments for managing automatic top-up rules.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageTopUpRuleArg {
    /// Get the current top-up rule, if any.
    Get,
    /// Add a new top-up rule, replacing any existing rule.
    Add(TopUpRule),
    /// Clear the current top-up rule and stop the timer.
    Clear,
}

/// Result of managing top-up rules.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum ManageTopUpRuleResult {
    /// Operation succeeded, returns the current rule (if any).
    Ok(Option<TopUpRule>),
    /// Operation failed with an error message.
    Err(String),
}

/// Interval at which to check cycles balance and potentially top up.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum TopUpInterval {
    /// Check every hour.
    Hourly,
    /// Check every day.
    Daily,
    /// Check every week.
    Weekly,
    /// Check every 30 days.
    Monthly,
}

/// Predefined cycles amounts for thresholds and top-up amounts.
///
/// Values are in trillion cycles (T = 10^12 cycles).
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum CyclesAmount {
    /// 0.25 trillion cycles (250 billion).
    _0_25T,
    /// 0.5 trillion cycles (500 billion).
    _0_5T,
    /// 1 trillion cycles.
    _1T,
    /// 2 trillion cycles.
    _2T,
    /// 5 trillion cycles.
    _5T,
    /// 10 trillion cycles.
    _10T,
    /// 50 trillion cycles.
    _50T,
    /// 100 trillion cycles.
    _100T,
}

impl CyclesAmount {
    /// Convert to raw cycles count.
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

/// Configuration for automatic cycles top-up.
///
/// When a rule is active, the canister will periodically check its cycles balance.
/// If the balance falls below `cycles_threshold`, it will transfer ICP from the
/// canister's default account to the CMC to mint `cycles_amount` cycles.
#[derive(CandidType, Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct TopUpRule {
    /// How often to check the cycles balance.
    pub interval: TopUpInterval,
    /// Top up when cycles fall below this threshold.
    pub cycles_threshold: CyclesAmount,
    /// Amount of cycles to mint when topping up.
    pub cycles_amount: CyclesAmount,
}

thread_local! {
    static TOP_UP_RULE: RefCell<Option<TopUpRule>> = const { RefCell::new(None) };
    static TOP_UP_TIMER_ID: RefCell<Option<TimerId>> = const { RefCell::new(None) };
    static TOP_UP_MINT_INFLIGHT: RefCell<bool> = const { RefCell::new(false) };
    static TOP_UP_LAST_BLOCK_INDEX: RefCell<Option<u64>> = const { RefCell::new(None) };
}

/// Manages automatic cycles top-up rules.
///
/// Allows getting, adding, or clearing a top-up rule. When a rule is added,
/// a periodic timer is started that checks the canister's cycles balance.
/// If the balance falls below the threshold, ICP is transferred to the CMC
/// to mint cycles.
///
/// # Arguments
///
/// * `arg` - The operation to perform (Get, Add, or Clear)
///
/// # Returns
///
/// The result of the operation containing the current rule (if any).
///
/// # Example
///
/// ```rust,ignore
/// use my_canister_dashboard::{
///     ManageTopUpRuleArg, ManageTopUpRuleResult, TopUpRule, TopUpInterval, CyclesAmount,
///     guards::only_ii_principal_guard,
/// };
/// use ic_cdk::update;
///
/// #[update(guard = "only_ii_principal_guard")]
/// fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
///     my_canister_dashboard::manage_top_up_rule(arg)
/// }
///
/// // Example: Add a rule to top up 1T cycles when balance falls below 0.5T, checking daily
/// let rule = TopUpRule {
///     interval: TopUpInterval::Daily,
///     cycles_threshold: CyclesAmount::_0_5T,
///     cycles_amount: CyclesAmount::_1T,
/// };
/// manage_top_up_rule(ManageTopUpRuleArg::Add(rule));
/// ```
pub fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    match arg {
        ManageTopUpRuleArg::Get => ManageTopUpRuleResult::Ok(current_rule()),
        ManageTopUpRuleArg::Add(rule) => {
            clear_existing_timer();

            TOP_UP_RULE.with(|cell| {
                *cell.borrow_mut() = Some(rule.clone());
            });
            ic_cdk::println!(
                "top-up: rule set amount={} threshold={} interval={:?}",
                rule.cycles_amount.as_cycles(),
                rule.cycles_threshold.as_cycles(),
                rule.interval
            );

            let interval = interval_duration(&rule.interval);
            let timer_id = set_timer_interval(interval, on_top_up_interval_tick);
            TOP_UP_TIMER_ID.with(|cell| {
                *cell.borrow_mut() = Some(timer_id);
            });
            ic_cdk::println!("top-up: timer set every {}s", interval.as_secs());
            // Trigger immediately for instant feedback
            spawn(on_top_up_interval_tick());
            ManageTopUpRuleResult::Ok(current_rule())
        }
        ManageTopUpRuleArg::Clear => {
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

async fn on_top_up_interval_tick() {
    ic_cdk::println!("top-up: tick");
    if let Some(rule) = current_rule() {
        let every = interval_duration(&rule.interval).as_secs();
        ic_cdk::println!(
            "top-up: active rule amount={} threshold={} interval={:?} every={}s",
            rule.cycles_amount.as_cycles(),
            rule.cycles_threshold.as_cycles(),
            rule.interval,
            every
        );

        let threshold = rule.cycles_threshold.as_cycles() as u128;
        let current_cycles = ic_cdk::api::canister_cycle_balance();

        if current_cycles < threshold {
            ic_cdk::println!(
                "top-up: below threshold current={} threshold={}",
                current_cycles,
                threshold
            );
            let needed_cycles = rule.cycles_amount.as_cycles();
            match compute_icp_needed_e8s(&needed_cycles.into()).await {
                Ok(needed_icp_e8s) => {
                    ic_cdk::println!(
                        "top-up: convert cycles={} -> icp_e8s={}",
                        needed_cycles,
                        needed_icp_e8s
                    );
                    // Skip if previous mint is still in flight
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
                "top-up: cycles above threshold; skipping current={} threshold={}",
                current_cycles,
                threshold
            );
        }
    } else {
        ic_cdk::println!("top-up: no rule set; skipping");
    }
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

// --- ICP ledger and exchange rate helpers ---

// Compute ICP needed (e8s) from cycles needed.
async fn compute_icp_needed_e8s(cycles: &Nat) -> Result<u64, String> {
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
            // Multiply by e8s first to preserve precision, then divide
            let icp_e8s = cycles_u128
                .saturating_mul(100_000_000u128)
                .saturating_div(denom);
            Ok(icp_e8s as u64)
        }
        Ok(_) => Err("CMC returned invalid exchange rate (zero cycles per ICP)".to_string()),
        Err(e) => Err(format!("CMC exchange rate unavailable: {e}")),
    }
}

// Exchange rate fetch: returns cycles per ICP as u64
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

// Deposit ICP and mint cycles via CMC with idempotency using last block index.
async fn cmc_deposit_and_mint(amount_e8s: u64) -> Result<(), String> {
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
    let block_index = ledger_transfer_to_cmc_topup(cmc, this_canister, transfer_amount_e8s).await?;
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

// Compute the CMC top-up destination account for a target canister

// Perform a legacy ledger `transfer` to the CMC minting account and return the ledger block index
async fn ledger_transfer_to_cmc_topup(
    cmc: Principal,
    target_canister: Principal,
    amount_e8s: u64,
) -> Result<BlockIndex, String> {
    let ledger = Principal::from_text(ICP_LEDGER_ID_TEXT)
        .map_err(|e| format!("ledger principal parse error: {e}"))?;
    // Derive destination AccountIdentifier: subaccount[0] = len(principal), subaccount[1..] = principal bytes
    let pb = target_canister.as_slice();
    if pb.len() > 31 {
        return Err("principal bytes too long for subaccount".into());
    }
    let mut sub = [0u8; 32];
    sub[0] = pb.len() as u8;
    sub[1..1 + pb.len()].copy_from_slice(pb);
    let subaccount = Subaccount(sub);
    let to = AccountIdentifier::new(&cmc, &subaccount);

    // Build legacy TransferArgs using ic-ledger-types struct
    let memo_bytes = TPUP_MEMO;

    let arg = TransferArgs {
        memo: Memo(u64::from_le_bytes(memo_bytes)),
        amount: Tokens::from_e8s(amount_e8s),
        fee: Tokens::from_e8s(ICRC1_FEE_E8S),
        from_subaccount: None,
        to,
        created_at_time: None,
    };

    // Call ledger.transfer and decode Result<BlockIndex, TransferError>
    let res = Call::unbounded_wait(ledger, "transfer")
        .with_arg(arg)
        .await
        .map_err(|e| format!("transfer failed: {e:?}"))?;

    let result: Result<BlockIndex, TransferError> = res
        .candid()
        .map_err(|e| format!("transfer candid decode failed: {e:?}"))?;

    result.map_err(|e| format!("transfer error: {e:?}"))
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
        .with_arg(NotifyTopUpArg {
            block_index,
            canister_id,
        })
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
