use ic_asset_certification::AssetRouter;
use ic_cdk::api::certified_data_set;
use ic_cdk::api::data_certificate;
use ic_cdk::{init, query, update};
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use include_dir::{include_dir, Dir};
use my_canister_dashboard::{
    guards::{only_canister_controllers_guard, only_ii_principal_guard},
    ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, ManageIIPrincipalArg,
    ManageIIPrincipalResult, WasmStatus,
};
use my_canister_frontend::asset_router_configs;
use std::borrow::Cow;
use std::cell::RefCell;

static FRONTEND_DIR: Dir = include_dir!("$CARGO_MANIFEST_DIR/../my-hello-world-frontend/dist");

thread_local! {
    static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(
        AssetRouter::new()
    );
}

#[init]
fn init() {
    ASSET_ROUTER.with(|router| {
        let mut router = router.borrow_mut();

        my_canister_dashboard::setup::setup_dashboard_assets(
            &mut router,
            Some(vec![
                "https://mycanister.app".to_string(),
                "http://localhost:5174".to_string(),
            ]),
        );

        let (assets, asset_configs) = asset_router_configs(&FRONTEND_DIR);
        router
            .certify_assets(assets, asset_configs)
            .expect("Failed to certify frontend assets");

        certified_data_set(router.root_hash());
    });
}

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    let data_certificate = data_certificate().unwrap_or_default();

    ASSET_ROUTER.with(|router| {
        let router = router.borrow();
        match router.serve_asset(&data_certificate, &request) {
            Ok(response) => response,
            Err(_) => HttpResponse::builder()
                .with_status_code(StatusCode::NOT_FOUND)
                .with_headers(vec![("Content-Type".to_string(), "text/plain".to_string())])
                .with_body(Cow::Owned("404 Not Found".as_bytes().to_vec()))
                .build(),
        }
    })
}

#[query]
fn wasm_status() -> WasmStatus {
    WasmStatus {
        name: "My Hello World".to_string(),
        version: 1,
        memo: None,
    }
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_ii_principal(arg: ManageIIPrincipalArg) -> ManageIIPrincipalResult {
    my_canister_dashboard::manage_ii_principal(arg)
}

#[update(guard = "only_canister_controllers_guard")]
fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
    ASSET_ROUTER.with(|router| {
        let mut router = router.borrow_mut();
        my_canister_dashboard::manage_alternative_origins(&mut router, arg)
    })
}

#[query(guard = "only_ii_principal_guard")]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}
