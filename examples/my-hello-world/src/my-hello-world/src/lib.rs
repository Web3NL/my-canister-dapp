//! My Hello World - Reference Implementation
//!
//! This canister demonstrates the User-Owned Dapp pattern using:
//! - `my_canister_frontend` for certified asset serving
//! - `my_canister_dashboard` for management UI and endpoints
//!
//! See the SPEC.md Section 8 for detailed documentation.

use ic_cdk::{init, query, update};
use ic_http_certification::{HttpRequest, HttpResponse};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::{
    guards::{only_canister_controllers_guard, only_ii_principal_guard},
    setup::setup_dashboard_assets,
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, ManageIIPrincipalArg,
    ManageIIPrincipalResult, ManageTopUpRuleArg, ManageTopUpRuleResult, WasmStatus,
};
use my_canister_frontend::{asset_router::with_asset_router_mut, setup_frontend};

/// Embedded frontend assets from the build output.
static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../my-hello-world-frontend/dist");

/// Alternative origins allowed for Internet Identity derivation.
/// These domains can authenticate users with principals derived at this canister's domain.
const ALTERNATIVE_ORIGINS: &[&str] = &[
    "https://mycanister.app",
    "http://localhost:5174",
    "http://c7lwu-3qaaa-aaaam-qbgia-cai.localhost:8080",
];

// ============================================================================
// Initialization
// ============================================================================

#[init]
fn init() {
    // Setup frontend assets with certification
    setup_frontend(&FRONTEND_DIR).expect("Failed to setup frontend");

    // Add dashboard UI and configure alternative origins
    with_asset_router_mut(|router| {
        let origins: Vec<String> = ALTERNATIVE_ORIGINS.iter().map(|s| s.to_string()).collect();
        setup_dashboard_assets(router, Some(origins)).expect("Failed to setup dashboard assets");
    });
}

// ============================================================================
// HTTP Asset Serving
// ============================================================================

/// Serve certified frontend and dashboard assets.
#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    my_canister_frontend::http_request(request)
}

// ============================================================================
// WASM Metadata
// ============================================================================

/// Return WASM metadata for the installer and dashboard.
#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Hello World".to_string(),
        version: 6,
        memo: Some("Reference implementation for User-Owned Dapps".to_string()),
    }
}

// ============================================================================
// Dashboard Management Endpoints
// ============================================================================

/// Get or set the Internet Identity principal for this canister.
/// Only callable by canister controllers.
#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

/// Add or remove alternative origins for II principal derivation.
/// Only callable by canister controllers.
#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    with_asset_router_mut(|router| my_canister_dashboard::manage_alternative_origins(router, arg))
}

/// Get, add, or clear automatic cycle top-up rules.
/// Only callable by canister controllers.
#[update(guard = "only_canister_controllers_guard")]
fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    my_canister_dashboard::manage_top_up_rule(arg)
}

// ============================================================================
// Application Endpoint
// ============================================================================

/// Greet the user by name.
/// Only callable by the configured II principal (the canister owner).
#[query(guard = "only_ii_principal_guard")]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
