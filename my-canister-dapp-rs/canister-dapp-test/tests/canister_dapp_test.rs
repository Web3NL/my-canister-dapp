use candid::Principal;
use canister_dapp_test::{AssetHashes, validate_frontend_assets, *};
use ic_cdk::management_canister::CanisterSettings;
use ic_http_certification::{HttpRequest, HttpResponse};
use ic_ledger_types::{AccountIdentifier, Subaccount};
use my_canister_dashboard::CyclesAmount;
use my_canister_dashboard::{
    ALTERNATIVE_ORIGINS_PATH, CANISTER_DASHBOARD_CSS_PATH, CANISTER_DASHBOARD_HTML_PATH,
    CANISTER_DASHBOARD_JS_PATH, ManageAlternativeOriginsArg, ManageAlternativeOriginsResult,
    ManageIIPrincipalArg, ManageIIPrincipalResult, WasmStatus,
};
use my_canister_dashboard::{ManageTopUpRuleArg, ManageTopUpRuleResult, TopUpInterval, TopUpRule};
use pocket_ic::{query_candid, update_candid_as};
use std::fs;

#[test]
fn canister_dapp_test() {
    // Use a PocketIC instance with an NNS subnet to allow installing canisters with
    // mainnet-reserved IDs (ledger/CMC) used by the code under test.
    let pic = pocket_ic::PocketIcBuilder::new().with_nns_subnet().build();

    // Prepare helper and constants to install Ledger/CMC later (after we know our canister ID)
    let ledger_id = Principal::from_text(ICP_LEDGER_CANISTER_ID_TEXT).unwrap();
    let cmc_id = Principal::from_text(FAKE_CMC_CANISTER_ID_TEXT).unwrap();
    // For this experiment, we'll pass the gzipped bytes directly to install_canister
    fn read_bytes(path: &str) -> Vec<u8> {
        fs::read(path).unwrap_or_else(|e| panic!("Failed to read {path}: {e}"))
    }

    // Setup principals
    let user = ii_principal_at_installer_app();
    let user_option = Some(user);
    let owner = ii_principal_at_user_controlled_dapp();
    let _owner_option = Some(owner);
    let stranger = stranger_principal();

    println!("\nUser principal: \n {user} \n");
    println!("Owner principal: \n {owner} \n");

    // Create canister
    let canister_id = pic.create_canister_with_settings(Some(user), None);
    println!("Canister created: \n {canister_id} \n");

    // Add cycles
    pic.add_cycles(canister_id, MIN_CANISTER_CREATION_BALANCE);

    // Canister has ii_principal_at_installer_app as the only controller after install
    let status = pic
        .canister_status(canister_id, user_option)
        .expect("Failed to get canister status");
    let controllers_len = status.settings.controllers.len();
    assert_eq!(controllers_len, 1);
    assert_eq!(status.settings.controllers[0], user);

    // Fetch target wasm
    let wasm_path = get_wasm_file_name().expect("Failed to get WASM file name");
    let wasm_bytes =
        fs::read(&wasm_path).unwrap_or_else(|_| panic!("Failed to read WASM file {wasm_path}"));

    // Install wasm
    pic.install_canister(canister_id, wasm_bytes, vec![], Some(user));
    println!("Wasm installed: \n {wasm_path} \n");

    // Now install ICP Ledger and Fake CMC so top-up can actually mint cycles.
    // Compute the canister's default ledger account identifier to pre-fund it.
    let canister_ai = AccountIdentifier::new(&canister_id, &Subaccount([0; 32]));
    let canister_ai_text = format!("{canister_ai}");

    // Ledger wasm and init payload (similar to dfx-env/deploy-all.sh)
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let ledger_wasm_path = std::path::Path::new(manifest_dir).join(LEDGER_WASM_GZ_RELATIVE);
    let ledger_wasm = read_bytes(ledger_wasm_path.to_str().unwrap());

    // Fabricated principals for minter and an initial funded account (not strictly needed)
    let minter = Principal::from_slice(&[201; 29]);
    let minter_ai = AccountIdentifier::new(&minter, &Subaccount([0; 32]));
    let minter_text = format!("{minter_ai}");

    #[derive(candid::CandidType, serde::Deserialize)]
    struct TokensArg {
        e8s: u64,
    }
    #[derive(candid::CandidType, serde::Deserialize)]
    struct DurationArg {
        secs: u64,
        nanos: u32,
    }
    #[derive(candid::CandidType, serde::Deserialize)]
    struct ArchiveOptionsArg {
        trigger_threshold: u64,
        num_blocks_to_archive: u64,
        node_max_memory_size_bytes: Option<u64>,
        max_message_size_bytes: Option<u64>,
        controller_id: Principal,
        more_controller_ids: Option<Vec<Principal>>,
        cycles_for_archive_creation: Option<u64>,
        max_transactions_per_response: Option<u64>,
    }
    #[derive(candid::CandidType, serde::Deserialize)]
    struct IcrcAccount {
        owner: Principal,
        subaccount: Option<Vec<u8>>,
    }
    #[derive(candid::CandidType, serde::Deserialize)]
    struct InitArgs {
        minting_account: String,
        icrc1_minting_account: Option<IcrcAccount>,
        initial_values: Vec<(String, TokensArg)>,
        max_message_size_bytes: Option<u64>,
        transaction_window: Option<DurationArg>,
        archive_options: Option<ArchiveOptionsArg>,
        send_whitelist: Vec<Principal>,
        transfer_fee: Option<TokensArg>,
        token_symbol: Option<String>,
        token_name: Option<String>,
        feature_flags: Option<candid::Empty>,
        maximum_number_of_accounts: Option<u64>,
        accounts_overflow_trim_quantity: Option<u64>,
    }
    #[derive(candid::CandidType, serde::Deserialize)]
    enum LedgerCanisterPayload {
        Init(Box<InitArgs>),
        Upgrade(Option<candid::Empty>),
    }

    let init_args = InitArgs {
        minting_account: minter_text.clone(),
        icrc1_minting_account: None,
        // Pre-fund the dashboard canister's default account so it can pay transfer+fee.
        initial_values: vec![(
            canister_ai_text.clone(),
            TokensArg {
                e8s: LEDGER_PREFUND_E8S,
            }, // pre-fund for headroom
        )],
        max_message_size_bytes: None,
        transaction_window: None,
        archive_options: None,
        send_whitelist: vec![],
        transfer_fee: Some(TokensArg {
            e8s: LEDGER_INIT_TRANSFER_FEE_E8S,
        }),
        token_symbol: Some("LICP".to_string()),
        token_name: Some("Local ICP".to_string()),
        feature_flags: None,
        maximum_number_of_accounts: None,
        accounts_overflow_trim_quantity: None,
    };
    let payload = LedgerCanisterPayload::Init(Box::new(init_args));

    // Create and install with fixed IDs and a known controller
    pic.create_canister_with_id(Some(user), None, ledger_id)
        .unwrap();
    pic.add_cycles(ledger_id, SYSTEM_CANISTER_BOOT_CYCLES);
    pic.install_canister(
        ledger_id,
        ledger_wasm,
        candid::encode_one(payload).unwrap(),
        Some(user),
    );

    // Fake CMC wasm
    let cmc_wasm_path = std::path::Path::new(manifest_dir).join(FAKE_CMC_WASM_RELATIVE);
    let cmc_wasm = fs::read(&cmc_wasm_path)
        .unwrap_or_else(|e| panic!("Missing fake-cmc.wasm at {}: {e}", cmc_wasm_path.display()));
    pic.create_canister_with_id(Some(user), None, cmc_id)
        .unwrap();
    pic.add_cycles(cmc_id, SYSTEM_CANISTER_BOOT_CYCLES);
    pic.install_canister(cmc_id, cmc_wasm, vec![], Some(user));

    // Assert ManageIIPrincipalResult::Err when Get II Principal before Set
    let get_result = update_candid_as::<(ManageIIPrincipalArg,), (ManageIIPrincipalResult,)>(
        &pic,
        canister_id,
        user,
        "manage_ii_principal",
        (ManageIIPrincipalArg::Get,),
    )
    .expect("Failed to get II Principal");
    assert!(matches!(get_result.0, ManageIIPrincipalResult::Err(_)));

    // Assert Set II Principal
    let manage_ii_principal_arg = ManageIIPrincipalArg::Set(owner);
    let manage_ii_principal_result =
        update_candid_as::<(ManageIIPrincipalArg,), (ManageIIPrincipalResult,)>(
            &pic,
            canister_id,
            user,
            "manage_ii_principal",
            (manage_ii_principal_arg,),
        )
        .expect("Failed to set II Principal");
    assert!(matches!(manage_ii_principal_result.0, ManageIIPrincipalResult::Ok(p) if p == owner));

    // Confirm Get II Principal after Set
    let get_result_after_set =
        update_candid_as::<(ManageIIPrincipalArg,), (ManageIIPrincipalResult,)>(
            &pic,
            canister_id,
            user,
            "manage_ii_principal",
            (ManageIIPrincipalArg::Get,),
        )
        .expect("Failed to get II Principal after set");
    assert!(matches!(get_result_after_set.0, ManageIIPrincipalResult::Ok(p) if p == owner));

    // Update canister settings to have only canister_id and owner as controllers
    let new_settings = CanisterSettings {
        controllers: Some(vec![canister_id, owner]),
        compute_allocation: None,
        memory_allocation: None,
        freezing_threshold: None,
        reserved_cycles_limit: None,
        log_visibility: None,
        wasm_memory_limit: None,
        wasm_memory_threshold: None,
        environment_variables: None,
    };

    pic.update_canister_settings(canister_id, Some(user), new_settings)
        .expect("Failed to update canister settings");

    // Verify the controllers were updated as owner
    let updated_status = pic
        .canister_status(canister_id, Some(owner))
        .expect("Failed to get updated canister status");
    assert_eq!(updated_status.settings.controllers.len(), 2);
    assert!(updated_status.settings.controllers.contains(&canister_id));
    assert!(updated_status.settings.controllers.contains(&owner));

    // Test http_request to get frontend assets
    let html_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(CANISTER_DASHBOARD_HTML_PATH).build(),),
    )
    .expect("Failed to get index.html");

    let js_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(CANISTER_DASHBOARD_JS_PATH).build(),),
    )
    .expect("Failed to get index.js");

    let css_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(CANISTER_DASHBOARD_CSS_PATH).build(),),
    )
    .expect("Failed to get style.css");

    if html_response.0.status_code() != 200
        || js_response.0.status_code() != 200
        || css_response.0.status_code() != 200
    {
        panic!(
            "Failed to fetch frontend assets: HTML status {}, JS status {}, CSS status {}",
            html_response.0.status_code(),
            js_response.0.status_code(),
            css_response.0.status_code()
        );
    }

    // Validate asset structure and compute hashes
    let html_body = html_response.0.body();
    let js_body = js_response.0.body();
    let css_body = css_response.0.body();

    let asset_hashes: AssetHashes = validate_frontend_assets(html_body, js_body, css_body)
        .expect("Frontend asset validation failed");

    println!(
        "Frontend assets validated successfully:\n  HTML hash: {}\n  JS hash: {}\n  CSS hash: {}\n",
        asset_hashes.html_hash, asset_hashes.js_hash, asset_hashes.css_hash
    );

    // Test wasm_status query - verify structure and type
    let wasm_status = query_candid::<(), (WasmStatus,)>(&pic, canister_id, "wasm_status", ())
        .expect("Failed to call wasm_status");

    // Verify the WasmStatus structure is properly returned
    let WasmStatus {
        name,
        version,
        memo,
    } = wasm_status.0;
    println!("WASM status retrieved: name={name}, version={version}, memo={memo:?} \n");

    // Test alternative origins management
    let test_origin_canister = format!("https://{canister_id}.icp0.io");
    let test_origin_localhost = "http://localhost:8080".to_string();
    let valid_canister_origin = "http://22ajg-aqaaa-aaaap-adukq-cai.localhost:8080".to_string();
    let invalid_origin = "ftp://invalid-protocol.com".to_string();

    // Get initial alternative origins
    let initial_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(ALTERNATIVE_ORIGINS_PATH).build(),),
    )
    .expect("Failed to get initial alternative origins");

    let initial_json = String::from_utf8(initial_response.0.body().to_vec())
        .expect("Failed to parse initial response as UTF-8");
    let initial_origins: serde_json::Value =
        serde_json::from_str(&initial_json).expect("Failed to parse initial JSON");

    // Ensure test origins are not already present
    let initial_list = initial_origins["alternativeOrigins"]
        .as_array()
        .expect("alternativeOrigins should be an array");
    assert!(
        !initial_list
            .iter()
            .any(|o| o.as_str() == Some(&test_origin_canister))
    );
    assert!(
        !initial_list
            .iter()
            .any(|o| o.as_str() == Some(&test_origin_localhost))
    );
    assert!(
        !initial_list
            .iter()
            .any(|o| o.as_str() == Some(&valid_canister_origin))
    );

    // Test canister origin: Add, verify, remove, verify
    let add_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Add(
                test_origin_canister.clone(),
            ),),
        )
        .expect("Failed to add canister alternative origin");
    assert!(matches!(add_result.0, ManageAlternativeOriginsResult::Ok));

    let after_add_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(ALTERNATIVE_ORIGINS_PATH).build(),),
    )
    .expect("Failed to get alternative origins after adding canister origin");

    let after_add_json = String::from_utf8(after_add_response.0.body().to_vec())
        .expect("Failed to parse response as UTF-8");
    let after_add_origins: serde_json::Value =
        serde_json::from_str(&after_add_json).expect("Failed to parse JSON");

    let after_add_list = after_add_origins["alternativeOrigins"]
        .as_array()
        .expect("alternativeOrigins should be an array");
    assert!(
        after_add_list
            .iter()
            .any(|o| o.as_str() == Some(&test_origin_canister))
    );
    println!("Alternative origin added \n {test_origin_canister} \n");

    let remove_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Remove(
                test_origin_canister.clone(),
            ),),
        )
        .expect("Failed to remove canister alternative origin");
    assert!(matches!(
        remove_result.0,
        ManageAlternativeOriginsResult::Ok
    ));

    let after_remove_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(ALTERNATIVE_ORIGINS_PATH).build(),),
    )
    .expect("Failed to get alternative origins after removing canister origin");

    let after_remove_json = String::from_utf8(after_remove_response.0.body().to_vec())
        .expect("Failed to parse response as UTF-8");
    let after_remove_origins: serde_json::Value =
        serde_json::from_str(&after_remove_json).expect("Failed to parse JSON");

    let after_remove_list = after_remove_origins["alternativeOrigins"]
        .as_array()
        .expect("alternativeOrigins should be an array");
    assert!(
        !after_remove_list
            .iter()
            .any(|o| o.as_str() == Some(&test_origin_canister))
    );
    println!("Alternative origin removed \n {test_origin_canister} \n");

    // Test localhost origin: Add, verify, remove, verify
    let add_localhost_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Add(
                test_origin_localhost.clone(),
            ),),
        )
        .expect("Failed to add localhost alternative origin");
    assert!(matches!(
        add_localhost_result.0,
        ManageAlternativeOriginsResult::Ok
    ));

    let after_add_localhost_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(ALTERNATIVE_ORIGINS_PATH).build(),),
    )
    .expect("Failed to get alternative origins after adding localhost origin");

    let after_add_localhost_json =
        String::from_utf8(after_add_localhost_response.0.body().to_vec())
            .expect("Failed to parse response as UTF-8");
    let after_add_localhost_origins: serde_json::Value =
        serde_json::from_str(&after_add_localhost_json).expect("Failed to parse JSON");

    let after_add_localhost_list = after_add_localhost_origins["alternativeOrigins"]
        .as_array()
        .expect("alternativeOrigins should be an array");
    assert!(
        after_add_localhost_list
            .iter()
            .any(|o| o.as_str() == Some(&test_origin_localhost))
    );
    println!("Alternative origin added \n {test_origin_localhost} \n");

    let remove_localhost_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Remove(
                test_origin_localhost.clone(),
            ),),
        )
        .expect("Failed to remove localhost alternative origin");
    assert!(matches!(
        remove_localhost_result.0,
        ManageAlternativeOriginsResult::Ok
    ));

    let after_remove_localhost_response = query_candid::<(HttpRequest,), (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(ALTERNATIVE_ORIGINS_PATH).build(),),
    )
    .expect("Failed to get alternative origins after removing localhost origin");

    let after_remove_localhost_json =
        String::from_utf8(after_remove_localhost_response.0.body().to_vec())
            .expect("Failed to parse response as UTF-8");
    let after_remove_localhost_origins: serde_json::Value =
        serde_json::from_str(&after_remove_localhost_json).expect("Failed to parse JSON");

    let after_remove_localhost_list = after_remove_localhost_origins["alternativeOrigins"]
        .as_array()
        .expect("alternativeOrigins should be an array");
    assert!(
        !after_remove_localhost_list
            .iter()
            .any(|o| o.as_str() == Some(&test_origin_localhost))
    );
    println!("Alternative origin removed \n {test_origin_localhost} \n");

    // Test that canister localhost origin is now valid (new validation logic)
    let add_valid_canister_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Add(
                valid_canister_origin.clone(),
            ),),
        )
        .expect("Failed to test canister localhost validation");
    assert!(matches!(
        add_valid_canister_result.0,
        ManageAlternativeOriginsResult::Ok
    ));
    println!("Canister localhost origin validation successful \n {valid_canister_origin} \n");

    // Clean up - remove the test origin
    let remove_valid_canister_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Remove(
                valid_canister_origin.clone(),
            ),),
        )
        .expect("Failed to remove test canister localhost origin");
    assert!(matches!(
        remove_valid_canister_result.0,
        ManageAlternativeOriginsResult::Ok
    ));

    // Test invalid origin: Should fail validation
    let add_invalid_result =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            owner,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Add(invalid_origin.clone()),),
        )
        .expect("Failed to call manage_alternative_origins with invalid origin");

    // Should return an error for invalid origin
    assert!(matches!(
        add_invalid_result.0,
        ManageAlternativeOriginsResult::Err(_)
    ));
    println!("Invalid origin rejected \n {invalid_origin} \n");

    // As stranger: Attempting to Get II principal -> expect guard error
    let manage_as_stranger = update_candid_as::<(ManageIIPrincipalArg,), (ManageIIPrincipalResult,)>(
        &pic,
        canister_id,
        stranger,
        "manage_ii_principal",
        (ManageIIPrincipalArg::Get,),
    );
    assert!(
        manage_as_stranger.is_err(),
        "Non-controller should be rejected by guard"
    );

    // As stranger: attempt to Set II principal -> expect guard error
    let manage_set_as_stranger =
        update_candid_as::<(ManageIIPrincipalArg,), (ManageIIPrincipalResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_ii_principal",
            (ManageIIPrincipalArg::Set(owner),),
        );
    assert!(
        manage_set_as_stranger.is_err(),
        "Non-controller should be rejected by guard when setting II principal"
    );

    // As stranger: attempt to Add alternative origin -> expect guard error
    let add_origin_as_stranger =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Add(
                test_origin_localhost.clone(),
            ),),
        );
    assert!(
        add_origin_as_stranger.is_err(),
        "Non-controller should be rejected by guard when adding alternative origin"
    );

    // As stranger: attempt to Remove alternative origin -> expect guard error
    let remove_origin_as_stranger =
        update_candid_as::<(ManageAlternativeOriginsArg,), (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Remove(
                test_origin_localhost.clone(),
            ),),
        );
    assert!(
        remove_origin_as_stranger.is_err(),
        "Non-controller should be rejected by guard when removing alternative origin"
    );

    // ---- Top-up rule CRUD ----
    // 1) Get when empty -> Ok(None)
    let get_empty = update_candid_as::<(ManageTopUpRuleArg,), (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Get,),
    )
    .expect("manage_top_up_rule Get failed");
    assert!(matches!(get_empty.0, ManageTopUpRuleResult::Ok(None)));

    // 2) Add rule -> Ok(Some(rule)) and Get -> Ok(Some(rule))
    let rule = TopUpRule {
        interval: TopUpInterval::Hourly,
        cycles_threshold: CyclesAmount::_0_5T,
        cycles_amount: CyclesAmount::_1T,
    };
    let add_res = update_candid_as::<(ManageTopUpRuleArg,), (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Add(rule.clone()),),
    )
    .expect("manage_top_up_rule Add failed");
    match add_res.0 {
        ManageTopUpRuleResult::Ok(Some(r)) => {
            assert!(matches!(r.interval, TopUpInterval::Hourly));
            assert_eq!(r.cycles_threshold, rule.cycles_threshold);
            assert_eq!(r.cycles_amount, rule.cycles_amount);
        }
        other => panic!("unexpected add result: {other:?}"),
    }

    let get_after_add = update_candid_as::<(ManageTopUpRuleArg,), (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Get,),
    )
    .expect("manage_top_up_rule Get after Add failed");
    match get_after_add.0 {
        ManageTopUpRuleResult::Ok(Some(r)) => {
            assert!(matches!(r.interval, TopUpInterval::Hourly));
            assert_eq!(r.cycles_threshold, rule.cycles_threshold);
            assert_eq!(r.cycles_amount, rule.cycles_amount);
        }
        other => panic!("unexpected get-after-add result: {other:?}"),
    }

    // 3) Clear -> Ok(None) and Get -> Ok(None)
    let clear_res = update_candid_as::<(ManageTopUpRuleArg,), (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Clear,),
    )
    .expect("manage_top_up_rule Clear failed");
    assert!(matches!(clear_res.0, ManageTopUpRuleResult::Ok(None)));

    let get_after_clear = update_candid_as::<(ManageTopUpRuleArg,), (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Get,),
    )
    .expect("manage_top_up_rule Get after Clear failed");
    assert!(matches!(get_after_clear.0, ManageTopUpRuleResult::Ok(None)));

    // ---- Top-up timer trigger (advance time) ----
    // Now that ledger and fake-cmc are installed, verify a successful mint actually happens.
    // Record cycles before adding the rule so we can detect an increase.
    let cycles_before = pic.cycle_balance(canister_id);

    // Set a rule with threshold above current cycles so it will trigger on the immediate tick.
    let trigger_rule = TopUpRule {
        interval: TopUpInterval::Hourly,     // 3600s
        cycles_threshold: CyclesAmount::_2T, // threshold 2T to ensure trigger
        cycles_amount: CyclesAmount::_1T,    // desired amount (value not important here)
    };
    let add_trigger_rule = update_candid_as::<(ManageTopUpRuleArg,), (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Add(trigger_rule.clone()),),
    )
    .expect("manage_top_up_rule Add (trigger) failed");
    assert!(matches!(
        add_trigger_rule.0,
        ManageTopUpRuleResult::Ok(Some(_))
    ));

    // An immediate tick is triggered right after setting the rule.
    // Tick once to allow the spawned task to run and emit logs, then assert we see it.
    pic.tick();
    let logs_immediate = pic
        .fetch_canister_logs(canister_id, owner)
        .expect("failed to fetch canister logs (immediate)");
    let mut body_immediate = String::new();
    for rec in logs_immediate {
        if let Ok(s) = String::from_utf8(rec.content) {
            body_immediate.push_str(&s);
            body_immediate.push('\n');
        }
    }
    assert!(
        body_immediate.contains("top-up: tick"),
        "missing immediate tick log after Add; logs were: {body_immediate}",
    );

    // For reference, print threshold vs. initial cycles
    let threshold_cycles = trigger_rule.cycles_threshold.as_cycles() as u128;
    println!("cycles before top-up: current={cycles_before}, threshold={threshold_cycles}");

    // Fast-forward time beyond the interval and tick the IC so the timer fires.
    use std::time::Duration;
    pic.advance_time(Duration::from_secs(60 * 60 + 5));
    // One or two ticks may be needed to process timers and spawned tasks.
    pic.tick();
    pic.tick();
    pic.tick();

    // Fetch canister logs and look for evidence of timer firing and rule evaluation.
    let logs = pic
        .fetch_canister_logs(canister_id, owner)
        .expect("failed to fetch canister logs");
    let mut body = String::new();
    for rec in logs {
        if let Ok(s) = String::from_utf8(rec.content) {
            body.push_str(&s);
            body.push('\n');
        }
    }

    // Must contain timer set log (from Add), a tick, and below-threshold evaluation.
    assert!(
        body.contains("top-up: timer set every 3600s"),
        "missing timer set log; logs were: {body}",
    );
    assert!(
        body.contains("top-up: tick"),
        "missing tick log after advancing time; logs were: {body}",
    );
    assert!(
        body.contains("top-up: active rule") || body.contains("top-up: below threshold"),
        "missing rule evaluation logs; logs were: {body}",
    );

    // With fake-cmc + ledger available, the flow should complete successfully at least once.
    // Look for success markers and verify cycles increased.
    assert!(
        body.contains("top-up: transfer ok") && body.contains("top-up: notify succeeded")
            || body.contains("top-up: flow completed"),
        "missing success logs; logs were: {body}",
    );

    // Cycles should have increased due to deposit_cycles in fake-cmc notify_top_up
    let cycles_after = pic.cycle_balance(canister_id);
    assert!(
        cycles_after > cycles_before,
        "expected cycles to increase after successful top-up; before={cycles_before} after={cycles_after}"
    );
}
