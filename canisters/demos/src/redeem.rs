use candid::Principal;

use crate::dashboard_calls;
use crate::ic_management;
use crate::pool;
use crate::storage::{self, AccessCodeStatus, ActiveDemo, GenericResult, RedeemResult};
use crate::wasm_registry;

/// Redeem an access code: assign a pool canister, install wasm, prepare for II auth.
pub async fn redeem_code(code: String, wasm_name: String) -> RedeemResult {
    let caller = ic_cdk::api::msg_caller();

    // Input validation
    if wasm_name.is_empty() || wasm_name.len() > 100 {
        return RedeemResult::Err("Invalid wasm name".to_string());
    }

    // 1. Atomically claim the code (prevents TOCTOU race across await points)
    let claimed = storage::with_state_mut(|s| {
        let ac = s
            .access_codes
            .get_mut(&code)
            .filter(|ac| matches!(ac.status, AccessCodeStatus::Available));
        match ac {
            Some(ac) => {
                ac.status = AccessCodeStatus::Redeemed {
                    canister_id: Principal::anonymous(), // placeholder until canister assigned
                    service_principal: caller,
                    dapp_principal: None,
                    wasm_name: wasm_name.clone(),
                };
                ac.redeemed_at = Some(ic_cdk::api::time());
                true
            }
            None => false,
        }
    });
    if !claimed {
        return RedeemResult::Err("Invalid or already used access code".to_string());
    }

    // 2. Get config
    let (registry_id, installer_origin) = match storage::with_state(|s| {
        s.config
            .as_ref()
            .map(|c| (c.wasm_registry_id, c.installer_origin.clone()))
    }) {
        Some(config) => config,
        None => {
            reset_code_to_available(&code);
            return RedeemResult::Err("Demos canister not configured".to_string());
        }
    };

    // 3. Take canister from pool
    let canister_id = match pool::take_from_pool() {
        Some(id) => id,
        None => {
            reset_code_to_available(&code);
            return RedeemResult::Err("No demo canisters available. Try again later.".to_string());
        }
    };

    // 4. Fetch wasm bytes from registry
    let wasm_bytes = match wasm_registry::fetch_wasm_bytes(registry_id, &wasm_name).await {
        Ok(bytes) => bytes,
        Err(e) => {
            let _ = pool::return_to_pool(canister_id).await;
            reset_code_to_available(&code);
            return RedeemResult::Err(format!("Failed to fetch wasm: {e}"));
        }
    };

    // 5. Install wasm on demo canister
    if let Err(e) = ic_management::install_code(canister_id, wasm_bytes, vec![0]).await {
        let _ = pool::return_to_pool(canister_id).await;
        reset_code_to_available(&code);
        return RedeemResult::Err(format!("Failed to install wasm: {e}"));
    }

    // 6. Add installer origin to alternative origins (fatal — user can't auth without it)
    if let Err(e) = dashboard_calls::add_alternative_origin(canister_id, installer_origin).await {
        let _ = pool::return_to_pool(canister_id).await;
        reset_code_to_available(&code);
        return RedeemResult::Err(format!("Failed to configure demo canister: {e}"));
    }

    // 7. Finalize the code status with the actual canister_id
    storage::with_state_mut(|s| {
        if let Some(ac) = s.access_codes.get_mut(&code) {
            ac.status = AccessCodeStatus::Redeemed {
                canister_id,
                service_principal: caller,
                dapp_principal: None,
                wasm_name: wasm_name.clone(),
            };
        }
    });

    ic_cdk::println!(
        "redeem: code {} -> canister {} (wasm: {}, user: {})",
        code,
        canister_id,
        wasm_name,
        caller
    );

    RedeemResult::Ok { canister_id }
}

/// Reset an access code back to Available after a failed redemption attempt.
fn reset_code_to_available(code: &str) {
    storage::with_state_mut(|s| {
        if let Some(ac) = s.access_codes.get_mut(code) {
            ac.status = AccessCodeStatus::Available;
            ac.redeemed_at = None;
        }
    });
}

/// Finalize a demo after the user has completed remote II authentication.
pub async fn finalize_demo(code: String, dapp_principal: Principal) -> GenericResult {
    let caller = ic_cdk::api::msg_caller();
    let demos_self = ic_cdk::api::canister_self();

    // 1. Validate: code is Redeemed and caller matches service_principal
    let redemption_info = storage::with_state(|s| {
        s.access_codes.get(&code).and_then(|ac| {
            if let AccessCodeStatus::Redeemed {
                canister_id,
                service_principal,
                wasm_name,
                ..
            } = &ac.status
            {
                if *service_principal == caller {
                    Some((*canister_id, wasm_name.clone()))
                } else {
                    None
                }
            } else {
                None
            }
        })
    });

    let (canister_id, wasm_name) = match redemption_info {
        Some(info) => info,
        None => {
            return GenericResult::Err(
                "Code not found, not redeemed, or caller mismatch".to_string(),
            );
        }
    };

    // 2. Set II principal on the demo canister
    if let Err(e) = dashboard_calls::set_ii_principal(canister_id, dapp_principal).await {
        return GenericResult::Err(format!("Failed to set II principal: {e}"));
    }

    // 3. Set controllers: [demos_canister, dapp_principal] (NOT the canister itself)
    if let Err(e) =
        ic_management::update_settings(canister_id, vec![demos_self, dapp_principal]).await
    {
        return GenericResult::Err(format!("Failed to set controllers: {e}"));
    }

    // 4. Create ActiveDemo record
    let now = ic_cdk::api::time();
    let trial_duration = storage::with_state(|s| {
        s.config
            .as_ref()
            .map(|c| c.trial_duration_ns)
            .unwrap_or(24 * 60 * 60 * 1_000_000_000) // default 24h
    });

    let demo = ActiveDemo {
        canister_id,
        service_principal: caller,
        dapp_principal,
        wasm_name: wasm_name.clone(),
        access_code: code.clone(),
        started_at: now,
        expires_at: now + trial_duration,
    };

    storage::with_state_mut(|s| {
        // Update access code with dapp_principal
        if let Some(ac) = s.access_codes.get_mut(&code) {
            ac.status = AccessCodeStatus::Redeemed {
                canister_id,
                service_principal: caller,
                dapp_principal: Some(dapp_principal),
                wasm_name,
            };
        }

        // Store active demo
        s.active_demos.insert(canister_id, demo);

        // Update service_principal index
        s.service_principal_index
            .entry(caller)
            .or_default()
            .push(canister_id);
    });

    ic_cdk::println!(
        "finalize: demo {} finalized (user: {}, dapp_principal: {}, expires: {})",
        canister_id,
        caller,
        dapp_principal,
        now + trial_duration
    );

    GenericResult::Ok
}
