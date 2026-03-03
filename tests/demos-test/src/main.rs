use candid::{CandidType, Principal};
use pocket_ic::{PocketIc, PocketIcBuilder, query_candid, update_candid_as};
use serde::{Deserialize, Serialize};
use std::fs;
use std::time::Duration;

// ---------------------------------------------------------------------------
// Synthetic test principals (same byte-pattern convention as my-canister-dapp-test)
// ---------------------------------------------------------------------------

const CONTROLLER_BYTE: u8 = 255;
const USER_BYTE: u8 = 254;
const STRANGER_BYTE: u8 = 253;
const DAPP_PRINCIPAL_BYTE: u8 = 252;

fn controller() -> Principal {
    Principal::from_slice(&[CONTROLLER_BYTE; 29])
}

fn user() -> Principal {
    Principal::from_slice(&[USER_BYTE; 29])
}

fn stranger() -> Principal {
    Principal::from_slice(&[STRANGER_BYTE; 29])
}

fn dapp_principal() -> Principal {
    Principal::from_slice(&[DAPP_PRINCIPAL_BYTE; 29])
}

// ---------------------------------------------------------------------------
// Candid types (redefined locally — demos is cdylib, can't be a dependency)
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct DemosConfig {
    wasm_registry_id: Principal,
    trial_duration_ns: u64,
    pool_target_size: u32,
    cycles_per_demo_canister: u128,
    installer_origin: String,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum GenericResult {
    Ok,
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum GenerateCodesResult {
    Ok(Vec<String>),
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum RedeemResult {
    Ok { canister_id: Principal },
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum AccessCodeStatus {
    Available,
    Redeemed {
        canister_id: Principal,
        service_principal: Principal,
        dapp_principal: Option<Principal>,
        wasm_name: String,
    },
    Expired,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct AccessCode {
    code: String,
    status: AccessCodeStatus,
    created_at: u64,
    redeemed_at: Option<u64>,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct ActiveDemo {
    canister_id: Principal,
    service_principal: Principal,
    dapp_principal: Principal,
    wasm_name: String,
    access_code: String,
    started_at: u64,
    expires_at: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct PoolStatus {
    available: u32,
    active: u32,
}

// Wasm-registry types
#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct UploadWasmArg {
    name: String,
    description: String,
    version: String,
    wasm_bytes: Vec<u8>,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
struct WasmEntry {
    name: String,
    description: String,
    version: String,
    wasm_hash: String,
    wasm_size: u64,
    created_at: u64,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
enum UploadWasmResult {
    Ok(WasmEntry),
    Err(String),
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_BALANCE: u128 = 500_000_000_000; // 0.5T cycles
const DEMO_CANISTER_CYCLES: u128 = 1_000_000_000_000; // 1T — enough to install a wasm
const DEMOS_BALANCE: u128 = 50_000_000_000_000; // 50T — demos needs cycles to create sub-canisters
const TRIAL_DURATION_NS: u64 = 300_000_000_000; // 5 minutes

// ---------------------------------------------------------------------------
// Test environment
// ---------------------------------------------------------------------------

struct TestEnv {
    pic: PocketIc,
    demos_id: Principal,
    #[allow(dead_code)]
    registry_id: Principal,
    demos_wasm: Vec<u8>,
}

fn setup() -> TestEnv {
    let pic = PocketIcBuilder::new().with_application_subnet().build();

    let ctrl = controller();

    // 1. Deploy wasm-registry
    let registry_id = pic.create_canister_with_settings(Some(ctrl), None);
    pic.add_cycles(registry_id, MIN_BALANCE);
    let registry_wasm = fs::read("wasm/wasm-registry.wasm.gz")
        .expect("wasm/wasm-registry.wasm.gz not found — run build-all-wasm.sh first");
    pic.install_canister(registry_id, registry_wasm, vec![], Some(ctrl));

    // 2. Upload my-hello-world to the registry
    let hw_wasm =
        fs::read("wasm/my-hello-world.wasm.gz").expect("wasm/my-hello-world.wasm.gz not found");
    let (upload_result,) = update_candid_as::<_, (UploadWasmResult,)>(
        &pic,
        registry_id,
        ctrl,
        "upload_wasm",
        (UploadWasmArg {
            name: "my-hello-world".to_string(),
            description: "Test wasm".to_string(),
            version: "1.0.0".to_string(),
            wasm_bytes: hw_wasm,
        },),
    )
    .expect("upload_wasm call failed");
    assert!(
        matches!(upload_result, UploadWasmResult::Ok(_)),
        "upload_wasm failed: {upload_result:?}"
    );

    // 3. Deploy demos canister
    let demos_wasm = fs::read("wasm/demos.wasm.gz")
        .expect("wasm/demos.wasm.gz not found — run build-all-wasm.sh first");
    let demos_id = pic.create_canister_with_settings(Some(ctrl), None);
    pic.add_cycles(demos_id, DEMOS_BALANCE);
    pic.install_canister(demos_id, demos_wasm.clone(), vec![], Some(ctrl));

    // 4. Configure demos
    let config = DemosConfig {
        wasm_registry_id: registry_id,
        trial_duration_ns: TRIAL_DURATION_NS,
        pool_target_size: 2,
        cycles_per_demo_canister: DEMO_CANISTER_CYCLES,
        installer_origin: "http://test.localhost:8080".to_string(),
    };
    let (result,) =
        update_candid_as::<_, (GenericResult,)>(&pic, demos_id, ctrl, "configure", (config,))
            .expect("configure call failed");
    assert!(
        matches!(result, GenericResult::Ok),
        "configure failed: {result:?}"
    );

    println!("  registry: {registry_id}");
    println!("  demos:    {demos_id}");

    TestEnv {
        pic,
        demos_id,
        registry_id,
        demos_wasm,
    }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/// Generate `count` access codes and return them.
fn generate_codes(env: &TestEnv, count: u32) -> Vec<String> {
    let (result,) = update_candid_as::<_, (GenerateCodesResult,)>(
        &env.pic,
        env.demos_id,
        controller(),
        "generate_access_codes",
        (count,),
    )
    .expect("generate_access_codes call failed");

    match result {
        GenerateCodesResult::Ok(codes) => codes,
        GenerateCodesResult::Err(e) => panic!("generate_access_codes returned Err: {e}"),
    }
}

/// Replenish the pool and return the pool status.
fn replenish_pool(env: &TestEnv) -> PoolStatus {
    let (result,) = update_candid_as::<_, (GenericResult,)>(
        &env.pic,
        env.demos_id,
        controller(),
        "replenish_pool",
        (),
    )
    .expect("replenish_pool call failed");
    assert!(
        matches!(result, GenericResult::Ok),
        "replenish_pool failed: {result:?}"
    );
    get_pool_status(env)
}

fn get_pool_status(env: &TestEnv) -> PoolStatus {
    // Guarded query — use update_candid_as to provide caller identity
    let (status,) = update_candid_as::<_, (PoolStatus,)>(
        &env.pic,
        env.demos_id,
        controller(),
        "get_pool_status",
        (),
    )
    .expect("get_pool_status failed");
    status
}

fn list_access_codes(env: &TestEnv) -> Vec<AccessCode> {
    let (codes,) = update_candid_as::<_, (Vec<AccessCode>,)>(
        &env.pic,
        env.demos_id,
        controller(),
        "list_access_codes",
        (),
    )
    .expect("list_access_codes failed");
    codes
}

fn list_active_demos(env: &TestEnv) -> Vec<ActiveDemo> {
    let (demos,) = update_candid_as::<_, (Vec<ActiveDemo>,)>(
        &env.pic,
        env.demos_id,
        controller(),
        "list_active_demos",
        (),
    )
    .expect("list_active_demos failed");
    demos
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

fn test_admin_guards(env: &TestEnv) {
    let s = stranger();

    // generate_access_codes should reject stranger
    let result = update_candid_as::<_, (GenerateCodesResult,)>(
        &env.pic,
        env.demos_id,
        s,
        "generate_access_codes",
        (1u32,),
    );
    assert!(
        result.is_err(),
        "generate_access_codes should reject stranger"
    );

    // list_access_codes should reject stranger
    let result = update_candid_as::<_, (Vec<AccessCode>,)>(
        &env.pic,
        env.demos_id,
        s,
        "list_access_codes",
        (),
    );
    assert!(result.is_err(), "list_access_codes should reject stranger");

    // list_active_demos should reject stranger
    let result = update_candid_as::<_, (Vec<ActiveDemo>,)>(
        &env.pic,
        env.demos_id,
        s,
        "list_active_demos",
        (),
    );
    assert!(result.is_err(), "list_active_demos should reject stranger");

    // get_pool_status should reject stranger
    let result =
        update_candid_as::<_, (PoolStatus,)>(&env.pic, env.demos_id, s, "get_pool_status", ());
    assert!(result.is_err(), "get_pool_status should reject stranger");

    // replenish_pool should reject stranger
    let result =
        update_candid_as::<_, (GenericResult,)>(&env.pic, env.demos_id, s, "replenish_pool", ());
    assert!(result.is_err(), "replenish_pool should reject stranger");

    // reclaim_expired should reject stranger
    let result =
        update_candid_as::<_, (GenericResult,)>(&env.pic, env.demos_id, s, "reclaim_expired", ());
    assert!(result.is_err(), "reclaim_expired should reject stranger");
}

fn test_generate_codes(env: &TestEnv) {
    let codes = generate_codes(env, 3);
    assert_eq!(codes.len(), 3, "Expected 3 codes, got {}", codes.len());

    // Verify format: XXXX-XXXX-XXXX (alphanumeric, no ambiguous chars)
    for code in &codes {
        assert_eq!(
            code.len(),
            14,
            "Code '{code}' should be 14 chars (XXXX-XXXX-XXXX)"
        );
        let parts: Vec<&str> = code.split('-').collect();
        assert_eq!(
            parts.len(),
            3,
            "Code '{code}' should have 3 dash-separated parts"
        );
        for part in &parts {
            assert_eq!(part.len(), 4, "Each part should be 4 chars in '{code}'");
            assert!(
                part.chars()
                    .all(|c| c.is_ascii_uppercase() || ('2'..='9').contains(&c)),
                "Code '{code}' contains invalid characters"
            );
        }
    }

    // All codes should be unique
    let mut unique = codes.clone();
    unique.sort();
    unique.dedup();
    assert_eq!(unique.len(), codes.len(), "Codes are not all unique");

    // Verify codes appear in list_access_codes and are Available
    let all_codes = list_access_codes(env);
    assert!(
        all_codes.len() >= 3,
        "Expected at least 3 codes in list, got {}",
        all_codes.len()
    );
    for code_str in &codes {
        let found = all_codes.iter().find(|ac| ac.code == *code_str);
        assert!(found.is_some(), "Code '{code_str}' not found in list");
        assert!(
            matches!(found.unwrap().status, AccessCodeStatus::Available),
            "Code '{code_str}' should be Available"
        );
    }
}

fn test_validate_code(env: &TestEnv) {
    // Non-existent code → false
    let (valid,) = query_candid::<_, (bool,)>(
        &env.pic,
        env.demos_id,
        "validate_code",
        ("ZZZZ-ZZZZ-ZZZZ".to_string(),),
    )
    .expect("validate_code query failed");
    assert!(!valid, "Non-existent code should be invalid");

    // Generate a code and validate it
    let codes = generate_codes(env, 1);
    let code = &codes[0];
    let (valid,) =
        query_candid::<_, (bool,)>(&env.pic, env.demos_id, "validate_code", (code.clone(),))
            .expect("validate_code query failed");
    assert!(valid, "Available code should be valid");
}

fn test_pool_management(env: &TestEnv) {
    // Pool starts empty
    let status = get_pool_status(env);
    assert_eq!(status.available, 0, "Pool should start empty");
    assert_eq!(status.active, 0, "No active demos initially");

    // Replenish pool to target size (2)
    let status = replenish_pool(env);
    assert_eq!(
        status.available, 2,
        "Pool should have 2 canisters after replenish"
    );

    // Replenish again — idempotent when at target
    let status = replenish_pool(env);
    assert_eq!(
        status.available, 2,
        "Pool should still have 2 canisters (idempotent)"
    );
}

fn test_full_redemption_flow(env: &TestEnv) {
    // Ensure pool has canisters
    let status = get_pool_status(env);
    if status.available < 1 {
        replenish_pool(env);
    }
    let pool_before = get_pool_status(env).available;

    // Generate a code
    let codes = generate_codes(env, 1);
    let code = codes[0].clone();

    // Redeem the code as `user`
    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (code.clone(), "my-hello-world".to_string()),
    )
    .expect("redeem_code call failed");

    let canister_id = match result {
        RedeemResult::Ok { canister_id } => canister_id,
        RedeemResult::Err(e) => panic!("redeem_code failed: {e}"),
    };
    println!("    Redeemed canister: {canister_id}");

    // Pool available count decreased
    let pool_after = get_pool_status(env).available;
    assert_eq!(
        pool_after,
        pool_before - 1,
        "Pool should have one fewer canister"
    );

    // Code should now be Redeemed (without dapp_principal yet)
    let all_codes = list_access_codes(env);
    let found = all_codes.iter().find(|ac| ac.code == code).unwrap();
    match &found.status {
        AccessCodeStatus::Redeemed {
            canister_id: cid,
            service_principal,
            dapp_principal: dp,
            wasm_name,
        } => {
            assert_eq!(*cid, canister_id);
            assert_eq!(*service_principal, user());
            assert!(
                dp.is_none(),
                "dapp_principal should be None before finalize"
            );
            assert_eq!(wasm_name, "my-hello-world");
        }
        other => panic!("Expected Redeemed, got: {other:?}"),
    }

    // validate_code should return false (no longer Available)
    let (valid,) =
        query_candid::<_, (bool,)>(&env.pic, env.demos_id, "validate_code", (code.clone(),))
            .expect("validate_code query failed");
    assert!(!valid, "Redeemed code should not be valid");

    // Finalize the demo
    let (result,) = update_candid_as::<_, (GenericResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "finalize_demo",
        (code.clone(), dapp_principal()),
    )
    .expect("finalize_demo call failed");
    assert!(
        matches!(result, GenericResult::Ok),
        "finalize_demo failed: {result:?}"
    );

    // Active demos should contain the demo
    let demos = list_active_demos(env);
    let demo = demos.iter().find(|d| d.canister_id == canister_id);
    assert!(demo.is_some(), "Demo not found in active demos");
    let demo = demo.unwrap();
    assert_eq!(demo.service_principal, user());
    assert_eq!(demo.dapp_principal, dapp_principal());
    assert_eq!(demo.wasm_name, "my-hello-world");
    assert_eq!(demo.access_code, code);

    // get_my_demos as user should return the demo (uses msg_caller)
    let (my_demos,) = update_candid_as::<_, (Vec<ActiveDemo>,)>(
        &env.pic,
        env.demos_id,
        user(),
        "get_my_demos",
        (),
    )
    .expect("get_my_demos failed");
    assert_eq!(my_demos.len(), 1, "User should have 1 demo");
    assert_eq!(my_demos[0].canister_id, canister_id);

    // get_my_demos as stranger should return empty
    let (stranger_demos,) = update_candid_as::<_, (Vec<ActiveDemo>,)>(
        &env.pic,
        env.demos_id,
        stranger(),
        "get_my_demos",
        (),
    )
    .expect("get_my_demos failed");
    assert!(stranger_demos.is_empty(), "Stranger should have no demos");

    // Code should now have dapp_principal set
    let all_codes = list_access_codes(env);
    let found = all_codes.iter().find(|ac| ac.code == code).unwrap();
    match &found.status {
        AccessCodeStatus::Redeemed {
            dapp_principal: dp, ..
        } => {
            assert_eq!(
                *dp,
                Some(dapp_principal()),
                "dapp_principal should be set after finalize"
            );
        }
        other => panic!("Expected Redeemed with dapp_principal, got: {other:?}"),
    }

    // Verify demo canister controllers are [demos_id, dapp_principal]
    let status = env
        .pic
        .canister_status(canister_id, Some(env.demos_id))
        .expect("canister_status failed");
    let mut controllers = status.settings.controllers.clone();
    controllers.sort();
    let mut expected = vec![env.demos_id, dapp_principal()];
    expected.sort();
    assert_eq!(
        controllers, expected,
        "Demo canister controllers should be [demos_id, dapp_principal]"
    );
}

fn test_redemption_errors(env: &TestEnv) {
    // Invalid code
    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (
            "INVALID-CODE-HERE".to_string(),
            "my-hello-world".to_string(),
        ),
    )
    .expect("redeem_code call failed");
    assert!(
        matches!(result, RedeemResult::Err(_)),
        "Invalid code should be rejected"
    );

    // Non-existent wasm name (need a valid code first)
    let codes = generate_codes(env, 1);
    // Ensure pool has canisters
    replenish_pool(env);
    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (codes[0].clone(), "nonexistent-wasm".to_string()),
    )
    .expect("redeem_code call failed");
    assert!(
        matches!(result, RedeemResult::Err(ref e) if e.contains("not found")),
        "Non-existent wasm should fail: {result:?}"
    );

    // Already-redeemed code: generate, redeem, try to redeem again
    let codes = generate_codes(env, 1);
    replenish_pool(env);
    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (codes[0].clone(), "my-hello-world".to_string()),
    )
    .expect("redeem_code call failed");
    assert!(
        matches!(result, RedeemResult::Ok { .. }),
        "First redeem should succeed"
    );
    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (codes[0].clone(), "my-hello-world".to_string()),
    )
    .expect("redeem_code call failed");
    assert!(
        matches!(result, RedeemResult::Err(_)),
        "Already-redeemed code should be rejected"
    );
}

fn test_finalize_errors(env: &TestEnv) {
    // Finalize with invalid code
    let (result,) = update_candid_as::<_, (GenericResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "finalize_demo",
        ("INVALID-CODE".to_string(), dapp_principal()),
    )
    .expect("finalize_demo call failed");
    assert!(
        matches!(result, GenericResult::Err(_)),
        "Invalid code should be rejected"
    );

    // Finalize with wrong caller
    let codes = generate_codes(env, 1);
    replenish_pool(env);
    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (codes[0].clone(), "my-hello-world".to_string()),
    )
    .expect("redeem_code call failed");
    assert!(matches!(result, RedeemResult::Ok { .. }));

    // Try to finalize as stranger (not the original redeemer)
    let (result,) = update_candid_as::<_, (GenericResult,)>(
        &env.pic,
        env.demos_id,
        stranger(),
        "finalize_demo",
        (codes[0].clone(), dapp_principal()),
    )
    .expect("finalize_demo call failed");
    assert!(
        matches!(result, GenericResult::Err(ref e) if e.contains("mismatch")),
        "Wrong caller should be rejected: {result:?}"
    );
}

fn test_expiration_and_reclamation(env: &TestEnv) {
    // Set up a complete demo
    let codes = generate_codes(env, 1);
    replenish_pool(env);

    let (result,) = update_candid_as::<_, (RedeemResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "redeem_code",
        (codes[0].clone(), "my-hello-world".to_string()),
    )
    .expect("redeem_code call failed");
    let canister_id = match result {
        RedeemResult::Ok { canister_id } => canister_id,
        RedeemResult::Err(e) => panic!("redeem_code failed: {e}"),
    };

    let (result,) = update_candid_as::<_, (GenericResult,)>(
        &env.pic,
        env.demos_id,
        user(),
        "finalize_demo",
        (codes[0].clone(), dapp_principal()),
    )
    .expect("finalize_demo call failed");
    assert!(matches!(result, GenericResult::Ok));

    // Verify demo is active
    let demos_before = list_active_demos(env);
    let demo_count_before = demos_before
        .iter()
        .filter(|d| d.canister_id == canister_id)
        .count();
    assert_eq!(demo_count_before, 1, "Demo should be active");

    let pool_before = get_pool_status(env).available;

    // Advance time past trial_duration (300s → advance 301s)
    env.pic.advance_time(Duration::from_secs(301));
    // Tick to update the time
    for _ in 0..5 {
        env.pic.tick();
    }

    // Call reclaim_expired
    let (result,) = update_candid_as::<_, (GenericResult,)>(
        &env.pic,
        env.demos_id,
        controller(),
        "reclaim_expired",
        (),
    )
    .expect("reclaim_expired call failed");
    assert!(
        matches!(result, GenericResult::Ok),
        "reclaim_expired failed: {result:?}"
    );

    // Demo should be gone from active demos
    let demos_after = list_active_demos(env);
    let demo_count_after = demos_after
        .iter()
        .filter(|d| d.canister_id == canister_id)
        .count();
    assert_eq!(demo_count_after, 0, "Demo should be reclaimed");

    // Pool should have one more canister (returned)
    let pool_after = get_pool_status(env).available;
    assert!(
        pool_after > pool_before,
        "Pool should have more canisters after reclamation (before: {pool_before}, after: {pool_after})"
    );

    // Access code should be Expired
    let all_codes = list_access_codes(env);
    let found = all_codes.iter().find(|ac| ac.code == codes[0]).unwrap();
    assert!(
        matches!(found.status, AccessCodeStatus::Expired),
        "Code should be Expired after reclamation, got: {:?}",
        found.status
    );

    // Reclaimed canister controllers should be [demos_id] only
    let status = env
        .pic
        .canister_status(canister_id, Some(env.demos_id))
        .expect("canister_status failed");
    assert_eq!(
        status.settings.controllers,
        vec![env.demos_id],
        "Reclaimed canister should only have demos_id as controller"
    );
}

fn test_upgrade_persistence(env: &TestEnv) {
    // Record current state
    let codes_before = list_access_codes(env);
    let pool_before = get_pool_status(env);
    let demos_before = list_active_demos(env);

    // Upgrade the canister with the same wasm
    env.pic
        .upgrade_canister(
            env.demos_id,
            env.demos_wasm.clone(),
            vec![],
            Some(controller()),
        )
        .expect("upgrade_canister failed");

    // Verify state is preserved
    let codes_after = list_access_codes(env);
    assert_eq!(
        codes_before.len(),
        codes_after.len(),
        "Access code count should be preserved after upgrade"
    );

    let pool_after = get_pool_status(env);
    assert_eq!(
        pool_before.available, pool_after.available,
        "Pool available count should be preserved after upgrade"
    );
    assert_eq!(
        pool_before.active, pool_after.active,
        "Pool active count should be preserved after upgrade"
    );

    let demos_after = list_active_demos(env);
    assert_eq!(
        demos_before.len(),
        demos_after.len(),
        "Active demo count should be preserved after upgrade"
    );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

fn main() {
    println!("\n=== Demos canister acceptance suite ===\n");
    println!("  controller:     {}", controller());
    println!("  user:           {}", user());
    println!("  stranger:       {}", stranger());
    println!("  dapp_principal: {}\n", dapp_principal());

    let env = setup();

    test_admin_guards(&env);
    println!("  PASS: admin guards");

    test_generate_codes(&env);
    println!("  PASS: access code generation");

    test_validate_code(&env);
    println!("  PASS: code validation");

    test_pool_management(&env);
    println!("  PASS: pool management");

    test_full_redemption_flow(&env);
    println!("  PASS: full redemption flow");

    test_redemption_errors(&env);
    println!("  PASS: redemption error cases");

    test_finalize_errors(&env);
    println!("  PASS: finalize error cases");

    test_expiration_and_reclamation(&env);
    println!("  PASS: expiration & reclamation");

    test_upgrade_persistence(&env);
    println!("  PASS: upgrade persistence");

    println!("\n=== ALL DEMOS TESTS PASSED ===\n");
}
