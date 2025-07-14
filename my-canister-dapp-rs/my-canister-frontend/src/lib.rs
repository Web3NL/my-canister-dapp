use ic_asset_certification::{Asset, AssetConfig, AssetEncoding, AssetFallbackConfig};
use ic_http_certification::StatusCode;
use include_dir::Dir;

/// Process a directory of assets and create Asset and AssetConfig vectors
/// suitable for use with AssetRouter.certify_assets()
pub fn process_assets_dir(
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
