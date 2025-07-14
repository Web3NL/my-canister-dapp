use ic_cdk::management_canister::CanisterSettings;
use ic_http_certification::{HttpRequest, HttpResponse};
use my_canister_dashboard::{
    ALTERNATIVE_ORIGINS_PATH, CANISTER_DASHBOARD_CSS_PATH, CANISTER_DASHBOARD_HTML_PATH,
    CANISTER_DASHBOARD_JS_PATH, ManageAlternativeOriginsArg, ManageAlternativeOriginsResult,
    ManageIIPrincipalArg, ManageIIPrincipalResult, WasmStatus,
};
use my_wasm_test::*;
use pocket_ic::{PocketIc, query_candid, update_candid_as};
use std::fs;

#[test]
fn my_wasm_test() {
    let pic = PocketIc::new();

    // Setup principals
    let user = ii_principal_at_installer_app();
    let user_option = Some(user);
    let owner = ii_principal_at_user_controlled_dapp();
    let _owner_option = Some(owner);

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

    // // Verify frontend assets match a known version
    // let version = verify_frontend_assets(
    //     html_response.0.body(),
    //     js_response.0.body(),
    //     css_response.0.body(),
    // )
    // .expect("Failed to verify frontend assets");

    // println!("Frontend assets verified for version: {version:?} \n");

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
    let invalid_origin = "http://sub.localhost:8080".to_string();

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
}
