use ic_asset_certification::AssetRouter;
use ic_cdk::api::certified_data_set;
use ic_http_certification::{HttpRequest, HttpResponse, StatusCode};
use include_dir::Dir;
use std::{borrow::Cow, cell::RefCell};

thread_local! {
    static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(AssetRouter::new());
}

/// Initialize and certify your Canister Dapp frontend assets.
///
/// Embeds files from an `include_dir` `Dir` into the internal
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
    ASSET_ROUTER.with(|router_cell| {
        let mut router = router_cell.borrow_mut();

        let (assets, configs) = crate::asset_router_configs(assets_dir);
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

/// Expose an escape hatch: allow direct access (query) to root hash.
pub fn root_hash() -> Vec<u8> {
    ASSET_ROUTER.with(|r| r.borrow().root_hash().to_vec())
}

/// Run a closure with a read‑only reference to the shared internal `AssetRouter`.
pub fn with_asset_router<F, R>(f: F) -> R
where
    F: FnOnce(&AssetRouter<'static>) -> R,
{
    ASSET_ROUTER.with(|cell| {
        let router_ref = cell.borrow();
        f(&router_ref)
    })
}

/// Run a closure with a mutable reference to the shared internal `AssetRouter`.
pub fn with_asset_router_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut AssetRouter<'static>) -> R,
{
    ASSET_ROUTER.with(|cell| {
        let mut router_ref = cell.borrow_mut();
        f(&mut router_ref)
    })
}
