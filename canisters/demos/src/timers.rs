use std::cell::RefCell;
use std::time::Duration;

use ic_cdk_timers::TimerId;

use crate::ic_management;
use crate::storage::{self, AccessCodeStatus, GenericResult};

// ---------------------------------------------------------------------------
// Timer state
// ---------------------------------------------------------------------------

thread_local! {
    static EXPIRATION_TIMER: RefCell<Option<TimerId>> = const { RefCell::new(None) };
    static CYCLES_MONITOR_TIMER: RefCell<Option<TimerId>> = const { RefCell::new(None) };
}

/// Check and reclaim interval: every 5 minutes.
const EXPIRATION_CHECK_INTERVAL: Duration = Duration::from_secs(5 * 60);

/// Cycles monitor interval: every hour.
const CYCLES_MONITOR_INTERVAL: Duration = Duration::from_secs(60 * 60);

/// Minimum cycles threshold before topping up a demo canister.
const MIN_CYCLES_THRESHOLD: u128 = 500_000_000_000; // 0.5T cycles

/// Amount of cycles to top up when below threshold.
const TOP_UP_AMOUNT: u128 = 1_000_000_000_000; // 1T cycles

// ---------------------------------------------------------------------------
// Timer lifecycle
// ---------------------------------------------------------------------------

/// Start periodic timers. Called from init (after configure) and post_upgrade.
pub fn start_timers() {
    // Only start if configured
    let configured = storage::with_state(|s| s.config.is_some());
    if !configured {
        return;
    }

    // Stop existing timers first to avoid duplicates
    stop_timers();

    let expiry_timer = ic_cdk_timers::set_timer_interval(EXPIRATION_CHECK_INTERVAL, || async {
        if let GenericResult::Err(e) = reclaim_all_expired().await {
            ic_cdk::println!("timer: expiration check error: {e}");
        }
    });
    EXPIRATION_TIMER.with(|t| *t.borrow_mut() = Some(expiry_timer));

    let cycles_timer = ic_cdk_timers::set_timer_interval(CYCLES_MONITOR_INTERVAL, || async {
        if let Err(e) = monitor_cycles().await {
            ic_cdk::println!("timer: cycles monitor error: {e}");
        }
    });
    CYCLES_MONITOR_TIMER.with(|t| *t.borrow_mut() = Some(cycles_timer));

    ic_cdk::println!(
        "timers: started (expiry: {:?}, cycles: {:?})",
        EXPIRATION_CHECK_INTERVAL,
        CYCLES_MONITOR_INTERVAL
    );
}

/// Stop all periodic timers. Called from pre_upgrade.
pub fn stop_timers() {
    EXPIRATION_TIMER.with(|t| {
        if let Some(id) = t.borrow_mut().take() {
            ic_cdk_timers::clear_timer(id);
        }
    });
    CYCLES_MONITOR_TIMER.with(|t| {
        if let Some(id) = t.borrow_mut().take() {
            ic_cdk_timers::clear_timer(id);
        }
    });
}

// ---------------------------------------------------------------------------
// Expiration reclamation
// ---------------------------------------------------------------------------

/// Reclaim all expired demos. Returns summary result.
pub async fn reclaim_all_expired() -> GenericResult {
    let now = ic_cdk::api::time();

    // Collect expired demo canister IDs
    let expired: Vec<(candid::Principal, String)> = storage::with_state(|s| {
        s.active_demos
            .values()
            .filter(|d| d.expires_at <= now)
            .map(|d| (d.canister_id, d.access_code.clone()))
            .collect()
    });

    if expired.is_empty() {
        return GenericResult::Ok;
    }

    ic_cdk::println!("reclaim: {} expired demos to process", expired.len());

    let mut errors = Vec::new();
    for (canister_id, access_code) in &expired {
        match reclaim_demo(*canister_id, access_code).await {
            Ok(()) => ic_cdk::println!("reclaim: {} reclaimed", canister_id),
            Err(e) => {
                ic_cdk::println!("reclaim: {} failed: {}", canister_id, e);
                errors.push(format!("{canister_id}: {e}"));
            }
        }
    }

    if errors.is_empty() {
        GenericResult::Ok
    } else {
        GenericResult::Err(format!("Some reclamations failed: {}", errors.join("; ")))
    }
}

/// Reclaim a single demo canister: uninstall code, reset controllers, return to pool.
async fn reclaim_demo(canister_id: candid::Principal, access_code: &str) -> Result<(), String> {
    let demos_self = ic_cdk::api::canister_self();

    // First reset controllers so we have full control (needed before uninstall if
    // the user's dapp_principal was a controller)
    ic_management::update_settings(canister_id, vec![demos_self]).await?;

    // Uninstall the wasm code
    ic_management::uninstall_code(canister_id).await?;

    // Update state
    storage::with_state_mut(|s| {
        // Remove from active demos
        if let Some(demo) = s.active_demos.remove(&canister_id) {
            // Remove from service_principal_index
            if let Some(ids) = s.service_principal_index.get_mut(&demo.service_principal) {
                ids.retain(|id| *id != canister_id);
                if ids.is_empty() {
                    s.service_principal_index.remove(&demo.service_principal);
                }
            }
        }

        // Mark access code as expired
        if let Some(ac) = s.access_codes.get_mut(access_code) {
            ac.status = AccessCodeStatus::Expired;
        }

        // Return canister to pool
        s.canister_pool.push_back(canister_id);
    });

    Ok(())
}

// ---------------------------------------------------------------------------
// Cycles monitoring
// ---------------------------------------------------------------------------

/// Monitor cycles for all active demo canisters and pool canisters.
async fn monitor_cycles() -> Result<(), String> {
    // Collect all canister IDs to check
    let canister_ids: Vec<candid::Principal> = storage::with_state(|s| {
        let mut ids: Vec<candid::Principal> = s.active_demos.keys().copied().collect();
        ids.extend(s.canister_pool.iter().copied());
        ids
    });

    if canister_ids.is_empty() {
        return Ok(());
    }

    let mut topped_up = 0u32;
    for canister_id in &canister_ids {
        match ic_management::canister_status(*canister_id).await {
            Ok(status) => {
                let cycles: u128 = status.cycles.0.try_into().unwrap_or(u128::MAX);

                if cycles < MIN_CYCLES_THRESHOLD {
                    ic_cdk::println!(
                        "cycles: {} has {} cycles (below threshold {}), topping up",
                        canister_id,
                        cycles,
                        MIN_CYCLES_THRESHOLD
                    );
                    match ic_management::deposit_cycles(*canister_id, TOP_UP_AMOUNT).await {
                        Ok(()) => topped_up += 1,
                        Err(e) => {
                            ic_cdk::println!("cycles: top-up failed for {}: {}", canister_id, e)
                        }
                    }
                }
            }
            Err(e) => {
                ic_cdk::println!("cycles: status check failed for {}: {}", canister_id, e);
            }
        }
    }

    if topped_up > 0 {
        ic_cdk::println!("cycles: topped up {} canisters", topped_up);
    }

    Ok(())
}
