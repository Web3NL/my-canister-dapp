#![doc = include_str!("../README.md")]

use candid::Principal;
use ic_cdk::management_canister::CanisterSettings;
use ic_http_certification::{HttpRequest, HttpResponse};
use ic_ledger_types::{AccountIdentifier, Memo, Subaccount, Tokens, TransferArgs};
use my_canister_dashboard::{
    ALTERNATIVE_ORIGINS_PATH, CANISTER_DASHBOARD_CSS_PATH, CANISTER_DASHBOARD_HTML_PATH,
    CANISTER_DASHBOARD_JS_PATH, CyclesAmount, ManageAlternativeOriginsArg,
    ManageAlternativeOriginsResult, ManageIIPrincipalArg, ManageIIPrincipalResult,
    ManageTopUpRuleArg, ManageTopUpRuleResult, TopUpInterval, TopUpRule, WasmStatus,
};
use pocket_ic::common::rest::{IcpFeatures, IcpFeaturesConfig};
use pocket_ic::{query_candid, update_candid_as};
use sha2::{Digest, Sha256};
use std::time::Duration;

// Synthetic principal bytes used to create deterministic test principals.
const II_PRINCIPAL_AT_INSTALLER_APP_BYTE: u8 = 255;
const II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE: u8 = 254;
const STRANGER_PRINCIPAL_BYTE: u8 = 253;

/// Minimum cycles required to create a canister on PocketIC.
pub const MIN_CANISTER_CREATION_BALANCE: u128 = 500_000_000_000;

// System canister IDs deployed by PocketIC's IcpFeatures (same as mainnet).
/// ICP Ledger canister ID.
pub const ICP_LEDGER_CANISTER_ID_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
/// ICP Index canister ID.
pub const ICP_INDEX_CANISTER_ID_TEXT: &str = "qhbym-qaaaa-aaaaa-aaafq-cai";
/// Cycles Minting Canister (CMC) ID.
pub const CMC_CANISTER_ID_TEXT: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";
/// Internet Identity canister ID.
pub const II_CANISTER_ID_TEXT: &str = "rdmx6-jaaaa-aaaaa-aaadq-cai";

/// ICP ledger transfer fee in e8s (0.0001 ICP).
pub const LEDGER_INIT_TRANSFER_FEE_E8S: u64 = 10_000;
/// Amount of ICP (in e8s) pre-funded to the canister for top-up tests (200 ICP).
pub const LEDGER_PREFUND_E8S: u64 = 20_000_000_000;

/// Principal simulating the installer app (the initial controller that installs the dapp WASM).
pub fn ii_principal_at_installer_app() -> Principal {
    Principal::from_slice(&[II_PRINCIPAL_AT_INSTALLER_APP_BYTE; 29])
}

/// Principal simulating the dapp owner (the II-authenticated end user).
pub fn ii_principal_at_user_controlled_dapp() -> Principal {
    Principal::from_slice(&[II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE; 29])
}

/// Principal simulating an unauthorized caller (should be rejected by all guards).
pub fn stranger_principal() -> Principal {
    Principal::from_slice(&[STRANGER_PRINCIPAL_BYTE; 29])
}

/// SHA-256 hash of `data`, returned as a lowercase hex string.
pub fn compute_asset_hash(data: &[u8]) -> String {
    hex::encode(Sha256::digest(data))
}

/// Hashes of the three dashboard frontend assets, for verification and debugging.
#[derive(Debug, Clone)]
pub struct AssetHashes {
    pub html_hash: String,
    pub js_hash: String,
    pub css_hash: String,
}

/// Computes SHA-256 hashes for the three main dashboard assets.
pub fn compute_frontend_asset_hashes(
    index_html: &[u8],
    index_js: &[u8],
    style_css: &[u8],
) -> AssetHashes {
    AssetHashes {
        html_hash: compute_asset_hash(index_html),
        js_hash: compute_asset_hash(index_js),
        css_hash: compute_asset_hash(style_css),
    }
}

/// Validates that HTML content has the expected structure for a canister dashboard page.
pub fn validate_html_structure(html: &[u8]) -> Result<(), String> {
    let content = String::from_utf8_lossy(html);

    if !content.contains("<!DOCTYPE html>") && !content.contains("<!doctype html>") {
        return Err("HTML missing DOCTYPE declaration".to_string());
    }
    if !content.contains("<html") {
        return Err("HTML missing <html> tag".to_string());
    }
    if !content.contains("</html>") {
        return Err("HTML missing closing </html> tag".to_string());
    }
    if !content.contains("<head") || !content.contains("</head>") {
        return Err("HTML missing <head> section".to_string());
    }
    if !content.contains("<body") || !content.contains("</body>") {
        return Err("HTML missing <body> section".to_string());
    }

    Ok(())
}

/// Validates that JavaScript content is non-empty, reasonably sized, and valid UTF-8.
pub fn validate_js_structure(js: &[u8]) -> Result<(), String> {
    if js.is_empty() {
        return Err("JavaScript file is empty".to_string());
    }
    if js.len() < 100 {
        return Err(format!(
            "JavaScript file is suspiciously small: {} bytes",
            js.len()
        ));
    }
    if String::from_utf8(js.to_vec()).is_err() {
        return Err("JavaScript file contains invalid UTF-8".to_string());
    }

    Ok(())
}

/// Validates that CSS content is non-empty, valid UTF-8, and contains at least one style rule.
pub fn validate_css_structure(css: &[u8]) -> Result<(), String> {
    if css.is_empty() {
        return Err("CSS file is empty".to_string());
    }

    let content = String::from_utf8(css.to_vec())
        .map_err(|_| "CSS file contains invalid UTF-8".to_string())?;

    if !content.contains('{') || !content.contains('}') {
        return Err("CSS file doesn't appear to contain any style rules".to_string());
    }

    Ok(())
}

/// Validates all three main dashboard assets and returns their SHA-256 hashes.
pub fn validate_frontend_assets(
    index_html: &[u8],
    index_js: &[u8],
    style_css: &[u8],
) -> Result<AssetHashes, String> {
    validate_html_structure(index_html)?;
    validate_js_structure(index_js)?;
    validate_css_structure(style_css)?;

    Ok(compute_frontend_asset_hashes(
        index_html, index_js, style_css,
    ))
}

// ─── Asset hash verification ─────────────────────────────────────────────────

use my_canister_dashboard::ASSET_HASHES_JSON;

/// Verifies that the given asset hashes match at least one entry in `asset-hashes.json`.
///
/// Returns the matching dashboard version string on success, or an error with a
/// detailed mismatch message listing all known versions and the served hashes.
pub fn verify_asset_hashes_match_known_version(hashes: &AssetHashes) -> Result<String, String> {
    let entries: serde_json::Value = serde_json::from_str(ASSET_HASHES_JSON)
        .expect("Failed to parse embedded asset-hashes.json");

    let entries = entries
        .as_array()
        .expect("asset-hashes.json must be a JSON array");

    for entry in entries {
        let version = entry["version"].as_str().unwrap_or("unknown");
        let html = entry["html"].as_str().unwrap_or("");
        let js = entry["js"].as_str().unwrap_or("");
        let css = entry["css"].as_str().unwrap_or("");

        if hashes.html_hash == html && hashes.js_hash == js && hashes.css_hash == css {
            return Ok(version.to_string());
        }
    }

    let mut msg = String::from(
        "Dashboard asset hash mismatch: served assets do not match any known dashboard version.\n\n",
    );
    msg.push_str("  Served hashes:\n");
    msg.push_str(&format!("    html: {}\n", hashes.html_hash));
    msg.push_str(&format!("    js:   {}\n", hashes.js_hash));
    msg.push_str(&format!("    css:  {}\n\n", hashes.css_hash));

    if entries.is_empty() {
        msg.push_str("  No known versions in asset-hashes.json (empty).\n");
    } else {
        msg.push_str("  Known versions:\n");
        for entry in entries {
            let v = entry["version"].as_str().unwrap_or("?");
            let h = &entry["html"].as_str().unwrap_or("?");
            let j = &entry["js"].as_str().unwrap_or("?");
            let c = &entry["css"].as_str().unwrap_or("?");
            msg.push_str(&format!(
                "    {v}: html={}... js={}... css={}...\n",
                &h[..h.len().min(16)],
                &j[..j.len().min(16)],
                &c[..c.len().min(16)],
            ));
        }
    }

    msg.push_str(
        "\nRebuild with a released dashboard version or record hashes via:\n  ./scripts/pre-release-mcd.sh\n",
    );
    Err(msg)
}

// ─── Acceptance suite ────────────────────────────────────────────────────────

/// Runs the full acceptance suite against a single dapp WASM.
///
/// Installs the WASM into a fresh PocketIC canister and exercises every
/// endpoint in the `my-canister-dashboard.did` interface:
///
/// - `wasm_status` — dapp metadata query
/// - `manage_ii_principal` — Internet Identity principal CRUD
/// - `http_request` — certified asset serving (dashboard + frontend)
/// - `manage_alternative_origins` — II alternative origins CRUD
/// - `manage_top_up_rule` — auto top-up rule CRUD + timer-driven cycle minting
///
/// Panics on any assertion failure.
pub fn run_acceptance_suite(wasm_bytes: &[u8], wasm_label: &str) {
    // ─── PocketIC setup ──────────────────────────────────────────────────
    // Configure a PocketIC instance with ICP Ledger + CMC system canisters.
    // The anonymous principal is pre-funded with 1B ICP for test transfers.
    let pic = pocket_ic::PocketIcBuilder::new()
        .with_icp_features(IcpFeatures {
            cycles_minting: Some(IcpFeaturesConfig::DefaultConfig),
            icp_token: Some(IcpFeaturesConfig::DefaultConfig),
            ..Default::default()
        })
        .build();

    let ledger_id = Principal::from_text(ICP_LEDGER_CANISTER_ID_TEXT).unwrap();

    // Three test principals with distinct roles:
    let user = ii_principal_at_installer_app(); // initial controller (installer)
    let owner = ii_principal_at_user_controlled_dapp(); // dapp owner (II user)
    let stranger = stranger_principal(); // unauthorized caller

    println!("\n=== Acceptance suite: {wasm_label} ===");
    println!("  installer: {user}");
    println!("  owner:     {owner}");

    // ─── Canister creation & WASM installation ───────────────────────────
    let canister_id = pic.create_canister_with_settings(Some(user), None);
    pic.add_cycles(canister_id, MIN_CANISTER_CREATION_BALANCE);
    println!("  canister:  {canister_id}\n");

    // Verify the installer is the sole controller.
    let status = pic
        .canister_status(canister_id, Some(user))
        .expect("Failed to get canister status");
    assert_eq!(status.settings.controllers, vec![user]);

    pic.install_canister(canister_id, wasm_bytes.to_vec(), vec![], Some(user));

    // Pre-fund the canister's ICP account so the top-up flow can transfer ICP.
    let canister_ai = AccountIdentifier::new(&canister_id, &Subaccount([0; 32]));
    let transfer_args = TransferArgs {
        memo: Memo(0),
        amount: Tokens::from_e8s(LEDGER_PREFUND_E8S),
        fee: Tokens::from_e8s(LEDGER_INIT_TRANSFER_FEE_E8S),
        from_subaccount: None,
        to: canister_ai,
        created_at_time: None,
    };
    let block_height = update_candid_as::<_, (Result<u64, ic_ledger_types::TransferError>,)>(
        &pic,
        ledger_id,
        Principal::anonymous(),
        "transfer",
        (transfer_args,),
    )
    .expect("Transfer call failed")
    .0
    .expect("Transfer failed");
    println!("Pre-funded canister with {LEDGER_PREFUND_E8S} e8s (block {block_height})");

    // ─── wasm_status ─────────────────────────────────────────────────────
    // Every conforming dapp must return a valid WasmStatus with a non-empty
    // name and a positive version number.
    let (wasm_status,) = query_candid::<(), (WasmStatus,)>(&pic, canister_id, "wasm_status", ())
        .expect("wasm_status query failed");

    assert!(
        !wasm_status.name.is_empty(),
        "wasm_status.name must not be empty"
    );
    assert!(
        wasm_status.version > 0,
        "wasm_status.version must be > 0, got {}",
        wasm_status.version
    );
    println!(
        "wasm_status: name={}, version={}, memo={:?}",
        wasm_status.name, wasm_status.version, wasm_status.memo
    );

    // ─── manage_ii_principal ─────────────────────────────────────────────
    // Get before Set → Err (no principal configured yet).
    let (get_before_set,) = update_candid_as::<_, (ManageIIPrincipalResult,)>(
        &pic,
        canister_id,
        user,
        "manage_ii_principal",
        (ManageIIPrincipalArg::Get,),
    )
    .expect("manage_ii_principal Get failed");
    assert!(matches!(get_before_set, ManageIIPrincipalResult::Err(_)));

    // Set → Ok(principal).
    let (set_result,) = update_candid_as::<_, (ManageIIPrincipalResult,)>(
        &pic,
        canister_id,
        user,
        "manage_ii_principal",
        (ManageIIPrincipalArg::Set(owner),),
    )
    .expect("manage_ii_principal Set failed");
    assert!(matches!(set_result, ManageIIPrincipalResult::Ok(p) if p == owner));

    // Get after Set → Ok(principal).
    let (get_after_set,) = update_candid_as::<_, (ManageIIPrincipalResult,)>(
        &pic,
        canister_id,
        user,
        "manage_ii_principal",
        (ManageIIPrincipalArg::Get,),
    )
    .expect("manage_ii_principal Get after Set failed");
    assert!(matches!(get_after_set, ManageIIPrincipalResult::Ok(p) if p == owner));

    // Transfer controller role to the owner (simulates post-install handoff).
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

    let updated_status = pic
        .canister_status(canister_id, Some(owner))
        .expect("Failed to get updated canister status");
    assert_eq!(updated_status.settings.controllers.len(), 2);
    assert!(updated_status.settings.controllers.contains(&canister_id));
    assert!(updated_status.settings.controllers.contains(&owner));

    // ─── http_request: dashboard asset serving ───────────────────────────

    // Fetch the three dashboard assets and validate status codes.
    let (html_resp,) = query_candid::<_, (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(CANISTER_DASHBOARD_HTML_PATH).build(),),
    )
    .expect("http_request for dashboard HTML failed");

    let (js_resp,) = query_candid::<_, (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(CANISTER_DASHBOARD_JS_PATH).build(),),
    )
    .expect("http_request for dashboard JS failed");

    let (css_resp,) = query_candid::<_, (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get(CANISTER_DASHBOARD_CSS_PATH).build(),),
    )
    .expect("http_request for dashboard CSS failed");

    assert_eq!(
        html_resp.status_code(),
        200,
        "Dashboard HTML should return 200"
    );
    assert_eq!(js_resp.status_code(), 200, "Dashboard JS should return 200");
    assert_eq!(
        css_resp.status_code(),
        200,
        "Dashboard CSS should return 200"
    );

    // Validate response headers.
    assert_header_contains(&html_resp, "content-type", "text/html");
    assert_header_contains(&js_resp, "content-type", "javascript");
    assert_header_contains(&css_resp, "content-type", "css");
    assert_header_contains(&html_resp, "content-security-policy", "default-src");

    // Validate asset structure (HTML tags, JS size, CSS rules).
    let asset_hashes = validate_frontend_assets(html_resp.body(), js_resp.body(), css_resp.body())
        .expect("Dashboard asset validation failed");
    println!(
        "Dashboard assets OK: html={}, js={}, css={}",
        &asset_hashes.html_hash[..12],
        &asset_hashes.js_hash[..12],
        &asset_hashes.css_hash[..12],
    );

    let matched_version = verify_asset_hashes_match_known_version(&asset_hashes)
        .expect("Asset hash verification failed");
    println!("Dashboard assets match version: {matched_version}");

    // SPA fallback: unknown paths under "/" serve index.html with 200 (client-side routing).
    let (fallback_resp,) = query_candid::<_, (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get("/this-path-does-not-exist").build(),),
    )
    .expect("http_request for unknown path failed");
    assert_eq!(
        fallback_resp.status_code(),
        200,
        "Unknown path should fall back to index.html (SPA routing)"
    );
    assert_header_contains(&fallback_resp, "content-type", "text/html");

    // ─── Security/privacy headers on frontend responses ─────────────────
    // The frontend crate adds 6 security headers to every asset response.
    // (X-XSS-Protection and Strict-Transport-Security are intentionally omitted:
    //  X-XSS-Protection is a legacy IE/old-Chrome header ignored by modern browsers;
    //  HSTS is redundant on ICP since the gateway enforces HTTPS.)
    assert_header_contains(&fallback_resp, "x-content-type-options", "nosniff");
    assert_header_contains(&fallback_resp, "x-frame-options", "deny");
    assert_header_contains(&fallback_resp, "referrer-policy", "no-referrer");
    assert_header_contains(&fallback_resp, "permissions-policy", "accelerometer=()");
    assert_header_contains(
        &fallback_resp,
        "cross-origin-opener-policy",
        "same-origin-allow-popups",
    );
    assert_header_contains(
        &fallback_resp,
        "cross-origin-resource-policy",
        "same-origin",
    );
    println!("Frontend security headers OK (6/6 verified on fallback response)");

    // ─── Gzip compression ───────────────────────────────────────────────
    // Request with Accept-Encoding: gzip should return compressed content.
    let (gzip_resp,) = query_candid::<_, (HttpResponse,)>(
        &pic,
        canister_id,
        "http_request",
        (HttpRequest::get("/this-path-does-not-exist")
            .with_headers(vec![("Accept-Encoding".into(), "gzip".into())])
            .build(),),
    )
    .expect("http_request with gzip encoding failed");
    assert_eq!(
        gzip_resp.status_code(),
        200,
        "Gzip fallback should return 200"
    );
    let body = gzip_resp.body();
    assert!(
        body.len() >= 2 && body[0] == 0x1f && body[1] == 0x8b,
        "Response body should be gzip-compressed (expected magic bytes 0x1f 0x8b, got 0x{:02x} 0x{:02x})",
        body.first().unwrap_or(&0),
        body.get(1).unwrap_or(&0),
    );
    assert_header_contains(&gzip_resp, "content-encoding", "gzip");
    println!("Gzip compression OK (verified on fallback response)");

    // ─── manage_alternative_origins ──────────────────────────────────────

    // Verify the initial origins JSON is valid and doesn't contain our test origins.
    let initial_origins = fetch_alternative_origins(&pic, canister_id);
    let test_origins = vec![
        format!("https://{canister_id}.icp0.io"),
        "http://localhost:8080".to_string(),
        "http://22ajg-aqaaa-aaaap-adukq-cai.localhost:8080".to_string(),
    ];
    for origin in &test_origins {
        assert!(
            !initial_origins.contains(origin),
            "Test origin {origin} should not be present initially"
        );
    }

    // Add each test origin, verify it appears, then remove it and verify it's gone.
    for origin in &test_origins {
        assert_add_origin(&pic, canister_id, owner, origin);
        let after_add = fetch_alternative_origins(&pic, canister_id);
        assert!(
            after_add.contains(origin),
            "Origin {origin} should be present after Add"
        );

        assert_remove_origin(&pic, canister_id, owner, origin);
        let after_remove = fetch_alternative_origins(&pic, canister_id);
        assert!(
            !after_remove.contains(origin),
            "Origin {origin} should be gone after Remove"
        );
    }

    // Invalid origin (ftp://) should be rejected.
    let invalid_origin = "ftp://invalid-protocol.com".to_string();
    let (invalid_result,) = update_candid_as::<_, (ManageAlternativeOriginsResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_alternative_origins",
        (ManageAlternativeOriginsArg::Add(invalid_origin),),
    )
    .expect("manage_alternative_origins Add (invalid) call failed");
    assert!(
        matches!(invalid_result, ManageAlternativeOriginsResult::Err(_)),
        "Invalid origin should be rejected"
    );

    // ─── Guard tests: stranger rejection ─────────────────────────────────
    // A non-controller caller must be rejected by every guarded endpoint.

    assert!(
        update_candid_as::<_, (ManageIIPrincipalResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_ii_principal",
            (ManageIIPrincipalArg::Get,),
        )
        .is_err(),
        "Stranger should be rejected by manage_ii_principal guard"
    );

    assert!(
        update_candid_as::<_, (ManageIIPrincipalResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_ii_principal",
            (ManageIIPrincipalArg::Set(owner),),
        )
        .is_err(),
        "Stranger should be rejected by manage_ii_principal guard (Set)"
    );

    assert!(
        update_candid_as::<_, (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Add(
                "http://localhost:9999".to_string()
            ),),
        )
        .is_err(),
        "Stranger should be rejected by manage_alternative_origins guard (Add)"
    );

    assert!(
        update_candid_as::<_, (ManageAlternativeOriginsResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_alternative_origins",
            (ManageAlternativeOriginsArg::Remove(
                "http://localhost:9999".to_string()
            ),),
        )
        .is_err(),
        "Stranger should be rejected by manage_alternative_origins guard (Remove)"
    );

    assert!(
        update_candid_as::<_, (ManageTopUpRuleResult,)>(
            &pic,
            canister_id,
            stranger,
            "manage_top_up_rule",
            (ManageTopUpRuleArg::Get,),
        )
        .is_err(),
        "Stranger should be rejected by manage_top_up_rule guard"
    );

    // ─── manage_top_up_rule: CRUD ────────────────────────────────────────

    // Get when empty → Ok(None).
    let (get_empty,) = update_candid_as::<_, (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Get,),
    )
    .expect("manage_top_up_rule Get failed");
    assert!(matches!(get_empty, ManageTopUpRuleResult::Ok(None)));

    // Add rule → Ok(Some(rule)).
    let rule = TopUpRule {
        interval: TopUpInterval::Hourly,
        cycles_threshold: CyclesAmount::_0_5T,
        cycles_amount: CyclesAmount::_1T,
    };
    let (add_result,) = update_candid_as::<_, (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Add(rule.clone()),),
    )
    .expect("manage_top_up_rule Add failed");
    match add_result {
        ManageTopUpRuleResult::Ok(Some(r)) => {
            assert!(matches!(r.interval, TopUpInterval::Hourly));
            assert_eq!(r.cycles_threshold, rule.cycles_threshold);
            assert_eq!(r.cycles_amount, rule.cycles_amount);
        }
        other => panic!("Expected Ok(Some(rule)), got {other:?}"),
    }

    // Get after Add → same rule.
    let (get_after_add,) = update_candid_as::<_, (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Get,),
    )
    .expect("manage_top_up_rule Get after Add failed");
    match get_after_add {
        ManageTopUpRuleResult::Ok(Some(r)) => {
            assert!(matches!(r.interval, TopUpInterval::Hourly));
            assert_eq!(r.cycles_threshold, rule.cycles_threshold);
            assert_eq!(r.cycles_amount, rule.cycles_amount);
        }
        other => panic!("Expected Ok(Some(rule)), got {other:?}"),
    }

    // Clear → Ok(None).
    let (clear_result,) = update_candid_as::<_, (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Clear,),
    )
    .expect("manage_top_up_rule Clear failed");
    assert!(matches!(clear_result, ManageTopUpRuleResult::Ok(None)));

    // Get after Clear → Ok(None).
    let (get_after_clear,) = update_candid_as::<_, (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Get,),
    )
    .expect("manage_top_up_rule Get after Clear failed");
    assert!(matches!(get_after_clear, ManageTopUpRuleResult::Ok(None)));

    // ─── manage_top_up_rule: timer-driven cycle minting ──────────────────
    // Set a rule with a threshold above the current balance to trigger an
    // immediate top-up via ICP Ledger → CMC → deposit_cycles.

    let cycles_before = pic.cycle_balance(canister_id);

    let trigger_rule = TopUpRule {
        interval: TopUpInterval::Hourly,
        cycles_threshold: CyclesAmount::_2T,
        cycles_amount: CyclesAmount::_1T,
    };
    let (add_trigger,) = update_candid_as::<_, (ManageTopUpRuleResult,)>(
        &pic,
        canister_id,
        owner,
        "manage_top_up_rule",
        (ManageTopUpRuleArg::Add(trigger_rule),),
    )
    .expect("manage_top_up_rule Add (trigger) failed");
    assert!(matches!(add_trigger, ManageTopUpRuleResult::Ok(Some(_))));

    // The Add spawns an immediate tick. Process it.
    pic.tick();
    let logs_immediate = collect_canister_logs(&pic, canister_id, owner);
    assert!(
        logs_immediate.contains("top-up: tick"),
        "Missing immediate tick log; logs: {logs_immediate}",
    );

    // Advance time past the hourly interval and tick so the timer fires again.
    pic.advance_time(Duration::from_secs(3601));
    pic.tick();
    pic.tick();
    pic.tick();

    let logs = collect_canister_logs(&pic, canister_id, owner);
    assert!(
        logs.contains("top-up: timer set every 3600s"),
        "Missing timer set log; logs: {logs}",
    );
    assert!(
        logs.contains("top-up: active rule") || logs.contains("top-up: below threshold"),
        "Missing rule evaluation log; logs: {logs}",
    );
    assert!(
        logs.contains("top-up: transfer ok") && logs.contains("top-up: notify succeeded")
            || logs.contains("top-up: flow completed"),
        "Missing top-up success log; logs: {logs}",
    );

    // Verify cycles actually increased.
    let cycles_after = pic.cycle_balance(canister_id);
    assert!(
        cycles_after > cycles_before,
        "Cycles should increase after top-up; before={cycles_before}, after={cycles_after}",
    );

    println!("=== PASS: {wasm_label} ===\n");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/// Asserts that an HTTP response contains a header whose value includes `substring`.
fn assert_header_contains(response: &HttpResponse, header_name: &str, substring: &str) {
    let found = response
        .headers()
        .iter()
        .any(|(k, v)| k.eq_ignore_ascii_case(header_name) && v.to_lowercase().contains(substring));
    assert!(
        found,
        "Expected header '{header_name}' containing '{substring}' in response (status {})",
        response.status_code(),
    );
}

/// Fetches the II alternative origins JSON and returns the list of origin strings.
fn fetch_alternative_origins(pic: &pocket_ic::PocketIc, canister_id: Principal) -> Vec<String> {
    let (resp,) = query_candid::<_, (HttpResponse,)>(
        pic,
        canister_id,
        "http_request",
        (HttpRequest::get(ALTERNATIVE_ORIGINS_PATH).build(),),
    )
    .expect("Failed to fetch alternative origins");

    let json: serde_json::Value =
        serde_json::from_slice(resp.body()).expect("Failed to parse alternative origins JSON");

    json["alternativeOrigins"]
        .as_array()
        .expect("alternativeOrigins should be an array")
        .iter()
        .filter_map(|v| v.as_str().map(String::from))
        .collect()
}

/// Adds an alternative origin and asserts success.
fn assert_add_origin(
    pic: &pocket_ic::PocketIc,
    canister_id: Principal,
    caller: Principal,
    origin: &str,
) {
    let (result,) = update_candid_as::<_, (ManageAlternativeOriginsResult,)>(
        pic,
        canister_id,
        caller,
        "manage_alternative_origins",
        (ManageAlternativeOriginsArg::Add(origin.to_string()),),
    )
    .unwrap_or_else(|e| panic!("Add origin '{origin}' call failed: {e:?}"));
    assert!(
        matches!(result, ManageAlternativeOriginsResult::Ok),
        "Add origin '{origin}' should succeed",
    );
}

/// Removes an alternative origin and asserts success.
fn assert_remove_origin(
    pic: &pocket_ic::PocketIc,
    canister_id: Principal,
    caller: Principal,
    origin: &str,
) {
    let (result,) = update_candid_as::<_, (ManageAlternativeOriginsResult,)>(
        pic,
        canister_id,
        caller,
        "manage_alternative_origins",
        (ManageAlternativeOriginsArg::Remove(origin.to_string()),),
    )
    .unwrap_or_else(|e| panic!("Remove origin '{origin}' call failed: {e:?}"));
    assert!(
        matches!(result, ManageAlternativeOriginsResult::Ok),
        "Remove origin '{origin}' should succeed",
    );
}

/// Fetches canister logs and returns them as a single concatenated string.
fn collect_canister_logs(
    pic: &pocket_ic::PocketIc,
    canister_id: Principal,
    caller: Principal,
) -> String {
    let logs = pic
        .fetch_canister_logs(canister_id, caller)
        .expect("Failed to fetch canister logs");
    let mut body = String::new();
    for rec in logs {
        if let Ok(s) = String::from_utf8(rec.content) {
            body.push_str(&s);
            body.push('\n');
        }
    }
    body
}
