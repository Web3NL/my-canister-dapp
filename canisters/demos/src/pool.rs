use candid::Principal;

use crate::ic_management;
use crate::storage::{self, GenericResult};

/// Create a single empty canister and add it to the pool.
pub async fn create_pool_canister() -> Result<Principal, String> {
    let (demos_self, cycles) = storage::with_state(|s| {
        let config = s.config.as_ref().ok_or("Demos canister not configured")?;
        Ok::<_, String>((
            ic_cdk::api::canister_self(),
            config.cycles_per_demo_canister,
        ))
    })?;

    let canister_id = ic_management::create_canister_with_cycles(vec![demos_self], cycles).await?;

    storage::with_state_mut(|s| {
        s.canister_pool.push_back(canister_id);
    });

    ic_cdk::println!("pool: created canister {} ({} cycles)", canister_id, cycles);
    Ok(canister_id)
}

/// Replenish the pool up to the configured target size.
pub async fn replenish_pool() -> GenericResult {
    let (current_size, target_size) = storage::with_state(|s| match &s.config {
        Some(config) => Ok((s.canister_pool.len() as u32, config.pool_target_size)),
        None => Err("Demos canister not configured".to_string()),
    })
    .unwrap_or_else(|e| {
        // Can't return early from async, handle below
        ic_cdk::println!("pool: {e}");
        (0, 0)
    });

    if target_size == 0 {
        return GenericResult::Err("Demos canister not configured".to_string());
    }

    if current_size >= target_size {
        ic_cdk::println!("pool: already at target ({}/{})", current_size, target_size);
        return GenericResult::Ok;
    }

    let to_create = target_size - current_size;
    ic_cdk::println!("pool: creating {} canisters", to_create);

    let mut created = 0u32;
    for _ in 0..to_create {
        match create_pool_canister().await {
            Ok(_) => created += 1,
            Err(e) => {
                ic_cdk::println!("pool: failed to create canister: {e}");
                return GenericResult::Err(format!(
                    "Created {created}/{to_create} canisters, then failed: {e}"
                ));
            }
        }
    }

    ic_cdk::println!("pool: replenished {created} canisters");
    GenericResult::Ok
}

/// Take a canister from the pool (FIFO). Returns None if pool is empty.
pub fn take_from_pool() -> Option<Principal> {
    storage::with_state_mut(|s| s.canister_pool.pop_front())
}

/// Return a canister to the pool after resetting its controllers.
pub async fn return_to_pool(canister_id: Principal) -> Result<(), String> {
    let demos_self = ic_cdk::api::canister_self();

    // Reset controllers to only the demos canister
    ic_management::update_settings(canister_id, vec![demos_self]).await?;

    storage::with_state_mut(|s| {
        s.canister_pool.push_back(canister_id);
    });

    ic_cdk::println!("pool: returned canister {} to pool", canister_id);
    Ok(())
}
