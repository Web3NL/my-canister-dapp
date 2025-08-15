#![doc = include_str!("../README.md")]

pub mod asset_router;

use ic_cdk::api::certified_data_set;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use include_dir::Dir;
use std::borrow::Cow;

/// Initialize and certify your Canister Dapp frontend assets.
///
/// Embeds files from an [`include_dir`](https://docs.rs/include_dir/latest/include_dir/) `Dir` into the internal
/// [`AssetRouter`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html)
/// and certifies them.
///
/// Arguments:
/// * `assets_dir` - Static [`include_dir`](https://docs.rs/include_dir/latest/include_dir/) `Dir` for your built frontend (e.g. `dist`).
///
/// # Example
/// ```rust,ignore
/// use ic_cdk::init;
/// use include_dir::{include_dir, Dir};
/// use my_canister_frontend::setup_frontend;
///
/// // Embed the built frontend (e.g. from `dist/`)
/// static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/../dapp-frontend/dist");
///
/// #[init]
/// fn init() {
///     setup_frontend(&ASSETS);
/// }
/// ```
pub fn setup_frontend(assets_dir: &Dir<'static>) {
    let (assets, configs) = asset_router::asset_router_configs(assets_dir);
    asset_router::with_asset_router_mut(|router| {
        router
            .certify_assets(assets, configs)
            .expect("Failed to certify frontend assets");
        certified_data_set(router.root_hash());
    });
}

/// Serve certified frontend assets.
/// Any other additional assets you may have added to the asset router,
/// like for example dashboard assets, will also be served.
///
/// # Example
/// ```rust,no_run
/// use ic_cdk::query;
/// use ic_http_certification::{HttpRequest, HttpResponse};
///
/// #[query]
/// fn http_request(req: HttpRequest) -> HttpResponse {
///     my_canister_frontend::http_request(req)
/// }
/// ```
pub fn http_request(request: HttpRequest) -> HttpResponse {
    let data_certificate = ic_cdk::api::data_certificate().unwrap_or_default();
    asset_router::with_asset_router(|router| {
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

/// Deprecated: use `my_canister_frontend::asset_router::asset_router_configs` instead.
#[deprecated(note = "Use my_canister_frontend::asset_router::asset_router_configs")]
pub fn asset_router_configs(
    assets_dir: &Dir<'static>,
) -> (
    Vec<ic_asset_certification::Asset<'static, 'static>>,
    Vec<ic_asset_certification::AssetConfig>,
) {
    asset_router::asset_router_configs(assets_dir)
}
