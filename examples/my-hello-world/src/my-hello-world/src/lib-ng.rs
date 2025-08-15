use ic_cdk::{init, query, update};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::{
    guards::{only_canister_controllers_guard, only_ii_principal_guard},
    setup::setup_dashboard_assets,
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, ManageIIPrincipalArg,
    ManageIIPrincipalResult, ManageTopUpRuleArg, ManageTopUpRuleResult, WasmStatus,
};
use my_canister_frontend::setup_frontend;

static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../my-hello-world-frontend/dist");

#[init]
fn init() {
    setup_frontend(&FRONTEND_DIR);
    my_canister_frontend::asset_router::with_asset_router_mut(|router| {
        setup_dashboard_assets(
            router,
            Some(vec![
                "https://mycanister.app".to_string(),
                "http://localhost:5174".to_string(),
                "http://c7lwu-3qaaa-aaaam-qbgia-cai.localhost:8080".to_string(),
            ]),
        );
    });
}

#[query]
fn http_request(
    request: ic_http_certification::HttpRequest,
) -> ic_http_certification::HttpResponse {
    my_canister_frontend::http_request(request)
}

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Hello World".to_string(),
        version: 5u16,
        memo: Some("The Internet Computer Hello World Dapp".to_string()),
    }
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    my_canister_frontend::asset_router::with_asset_router_mut(|router| {
        my_canister_dashboard::manage_alternative_origins(router, arg)
    })
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_top_up_rule(arg: ManageTopUpRuleArg) -> ManageTopUpRuleResult {
    my_canister_dashboard::manage_top_up_rule(arg)
}

#[query(guard = "only_ii_principal_guard")]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
