use ic_asset_certification::{Asset, AssetConfig, AssetEncoding, AssetFallbackConfig, AssetRouter};
use ic_http_certification::StatusCode;
use include_dir::Dir;
use mime_guess;
use std::cell::RefCell;

thread_local! {
    static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(AssetRouter::new());
}

/// Run a closure with a read‑only reference to the internal `AssetRouter`.
pub fn with_asset_router<F, R>(f: F) -> R
where
    F: FnOnce(&AssetRouter<'static>) -> R,
{
    ASSET_ROUTER.with(|cell| {
        let router_ref = cell.borrow();
        f(&router_ref)
    })
}

/// Run a closure with a mutable reference to the internal `AssetRouter`.
pub fn with_asset_router_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut AssetRouter<'static>) -> R,
{
    ASSET_ROUTER.with(|cell| {
        let mut router_ref = cell.borrow_mut();
        f(&mut router_ref)
    })
}

/// Process a [`Dir`](https://docs.rs/include_dir/latest/include_dir/struct.Dir.html) of frontend assets and create [`Asset`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.Asset.html) and [`AssetConfig`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/enum.AssetConfig.html) vectors
/// suitable for use with [`AssetRouter.certify_assets()`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html).
///
/// All assets are configured as `AssetConfig::File` with automatic MIME type detection using [`mime_guess`](https://docs.rs/mime_guess/latest/mime_guess/).
/// The `index.html` file, if present, is configured as a fallback for `/` route.
///
/// # Arguments
///
/// * `assets_dir` - A static directory containing the assets to process
///
/// # Returns
///
/// A tuple containing:
/// * `Vec<`[`Asset`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.Asset.html)`>` - Vector of assets with their content
/// * `Vec<`[`AssetConfig`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/enum.AssetConfig.html)`>` - Vector of asset configurations for routing
///
/// # Example
///
/// ```rust,ignore
/// use include_dir::{include_dir, Dir};
/// use my_canister_frontend::asset_router_configs;
///
/// static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/assets");
///
/// let (assets, configs) = asset_router_configs(&ASSETS);
/// // Use with AssetRouter.certify_assets(assets, configs)
/// ```
pub fn asset_router_configs(
    assets_dir: &Dir<'static>,
) -> (Vec<Asset<'static, 'static>>, Vec<AssetConfig>) {
    let mut assets = Vec::new();
    let mut asset_configs = Vec::new();
    process_dir_recursive(assets_dir, "", &mut assets, &mut asset_configs);
    (assets, asset_configs)
}

fn process_dir_recursive(
    dir: &Dir<'static>,
    base_path: &str,
    assets: &mut Vec<Asset<'static, 'static>>,
    asset_configs: &mut Vec<AssetConfig>,
) {
    for file in dir.files() {
        let file_name = file.path().file_name().unwrap().to_string_lossy();
        let full_path = if base_path.is_empty() {
            format!("/{file_name}")
        } else {
            format!("{base_path}/{file_name}")
        };
        let contents = file.contents();
        assets.push(Asset::new(full_path.clone(), contents.to_vec()));
        let config = create_asset_config(&full_path);
        asset_configs.push(config);
    }
    for subdir in dir.dirs() {
        let subdir_name = subdir.path().file_name().unwrap().to_string_lossy();
        let new_base_path = if base_path.is_empty() {
            format!("/{subdir_name}")
        } else {
            format!("{base_path}/{subdir_name}")
        };
        process_dir_recursive(subdir, &new_base_path, assets, asset_configs);
    }
}

fn create_asset_config(path: &str) -> AssetConfig {
    let content_type = infer_content_type(path);
    let headers = create_default_headers(&content_type);
    let (fallback_for, aliased_by) = if path == "/index.html" {
        (
            vec![AssetFallbackConfig {
                scope: "/".to_string(),
                status_code: Some(StatusCode::OK),
            }],
            vec!["/".to_string()],
        )
    } else {
        (vec![], vec![])
    };
    let config = AssetConfig::File {
        path: path.to_string(),
        content_type: Some(content_type.clone()),
        headers,
        fallback_for,
        aliased_by,
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    };
    config
}

fn infer_content_type(path: &str) -> String {
    mime_guess::from_path(path)
        .first()
        .map(|mime| mime.to_string())
        .unwrap_or_else(|| "application/octet-stream".to_string())
}

fn create_default_headers(_content_type: &str) -> Vec<(String, String)> {
    Vec::new()
}
