#![doc = include_str!("../README.md")]

use ic_asset_certification::{Asset, AssetConfig, AssetEncoding, AssetFallbackConfig};
use ic_http_certification::StatusCode;
use include_dir::Dir;

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

    // Process all files recursively, including subdirectories
    process_dir_recursive(assets_dir, "", &mut assets, &mut asset_configs);

    (assets, asset_configs)
}

/// Recursively process a directory and all its subdirectories
fn process_dir_recursive(
    dir: &Dir<'static>,
    base_path: &str,
    assets: &mut Vec<Asset<'static, 'static>>,
    asset_configs: &mut Vec<AssetConfig>,
) {
    // Process files in current directory
    for file in dir.files() {
        let file_name = file.path().file_name().unwrap().to_string_lossy();
        let full_path = if base_path.is_empty() {
            format!("/{file_name}")
        } else {
            format!("{base_path}/{file_name}")
        };

        let contents = file.contents();

        // Create Asset
        assets.push(Asset::new(full_path.clone(), contents.to_vec()));

        // Create AssetConfig
        let config = create_asset_config(&full_path);
        asset_configs.push(config);
    }

    // Process subdirectories recursively
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

/// Create an AssetConfig for a given file path
fn create_asset_config(path: &str) -> AssetConfig {
    let content_type = infer_content_type(path);
    let headers = create_default_headers(&content_type);

    // Configure index.html as fallback asset for SPA routing
    let (fallback_for, aliased_by) = if path == "/index.html" {
        (
            vec![AssetFallbackConfig {
                scope: "/".to_string(),
                status_code: Some(StatusCode::OK),
            }],
            vec!["/".to_string()], // Alias root path to index.html
        )
    } else {
        (vec![], vec![])
    };

    let is_fallback = !fallback_for.is_empty();

    let config = AssetConfig::File {
        path: path.to_string(),
        content_type: Some(content_type.clone()),
        headers,
        fallback_for,
        aliased_by,
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    };

    ic_cdk::println!(
        "AssetConfig created for path: {}, content_type: {:?}, is_fallback: {}",
        path,
        content_type,
        is_fallback
    );

    config
}

/// Infer the MIME content type from a file path
fn infer_content_type(path: &str) -> String {
    mime_guess::from_path(path)
        .first()
        .map(|mime| mime.to_string())
        .unwrap_or_else(|| "application/octet-stream".to_string())
}

/// Create default headers based on content type
fn create_default_headers(_content_type: &str) -> Vec<(String, String)> {
    Vec::new()
}
