#![doc = include_str!("../README.md")]

pub mod asset_router;

pub use asset_router::FrontendConfig;

use ic_cdk::api::certified_data_set;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use include_dir::Dir;
use std::borrow::Cow;

/// Initialize and certify your user-owned dapp frontend assets.
///
/// Embeds files from an [`include_dir`](https://docs.rs/include_dir/latest/include_dir/) `Dir` into the internal
/// [`AssetRouter`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html)
/// and certifies them.
///
/// Uses the default [`FrontendConfig`] (see [`setup_frontend_with_config`] for custom settings).
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
///     setup_frontend(&ASSETS).expect("Failed to setup frontend");
/// }
/// ```
pub fn setup_frontend(assets_dir: &Dir<'static>) -> Result<(), String> {
    setup_frontend_with_config(assets_dir, &FrontendConfig::default())
}

/// Initialize and certify your user-owned dapp frontend assets with custom configuration.
///
/// Like [`setup_frontend`], but allows specifying additional allowed file
/// extensions and other options via [`FrontendConfig`].
///
/// # Example
/// ```rust,ignore
/// use my_canister_frontend::{setup_frontend_with_config, FrontendConfig};
///
/// let config = FrontendConfig {
///     extra_allowed_extensions: vec!["webmanifest".to_string()],
///     ..Default::default()
/// };
/// setup_frontend_with_config(&ASSETS, &config).expect("Failed to setup frontend");
/// ```
pub fn setup_frontend_with_config(
    assets_dir: &Dir<'static>,
    config: &FrontendConfig,
) -> Result<(), String> {
    let (assets, configs) = asset_router::asset_router_configs_with_config(assets_dir, config)?;
    asset_router::with_asset_router_mut(|router| {
        router
            .certify_assets(assets, configs)
            .map_err(|e| format!("Failed to certify frontend assets: {e}"))?;
        certified_data_set(router.root_hash());
        Ok(())
    })
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
) -> Result<
    (
        Vec<ic_asset_certification::Asset<'static, 'static>>,
        Vec<ic_asset_certification::AssetConfig>,
    ),
    String,
> {
    asset_router::asset_router_configs(assets_dir)
}
