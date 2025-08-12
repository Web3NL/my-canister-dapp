pub mod alternative_origins;
pub mod ii_principal;
pub mod top_up_rule;
pub mod wasm_status;

use ic_asset_certification::{Asset, AssetConfig, AssetEncoding, AssetRouter};
use include_dir::{Dir, include_dir};

/// Path to the canister dashboard HTML endpoint
pub const CANISTER_DASHBOARD_HTML_PATH: &str = "/canister-dashboard";

/// Path to the canister dashboard JavaScript file
pub const CANISTER_DASHBOARD_JS_PATH: &str = "/canister-dashboard/index.js";

/// Path to the canister dashboard CSS file
pub const CANISTER_DASHBOARD_CSS_PATH: &str = "/canister-dashboard/style.css";

/// Path to the Internet Identity alternative origins file
pub const ALTERNATIVE_ORIGINS_PATH: &str = "/.well-known/ii-alternative-origins";

static ASSETS_DIR: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/assets");

// Functions from assets.rs
pub fn add_dashboard_assets_to_router(asset_router: &mut AssetRouter) -> Result<(), String> {
    let mut assets = Vec::new();
    let mut asset_configs = Vec::new();

    for file in ASSETS_DIR.files() {
        let path = file.path().to_string_lossy().to_string();
        let contents = file.contents();

        assets.push(Asset::new(path.clone(), contents.to_vec()));

        let config = create_asset_config(&path);
        asset_configs.push(config);
    }

    asset_router
        .certify_assets(assets, asset_configs)
        .map_err(|e| format!("Failed to certify dashboard assets: {e:?}"))
}

// Functions from dashboard_asset_configs.rs
/// Create appropriate asset config based on file path
pub fn create_asset_config(path: &str) -> AssetConfig {
    match path {
        "index.html" => canister_dashboard_html_config(),
        "index.js" => dashboard_js_config(),
        "style.css" => dashboard_css_config(),
        _ => panic!("Unsupported asset type: {path}"),
    }
}

/// Create asset config for index.html
fn canister_dashboard_html_config() -> AssetConfig {
    AssetConfig::File {
        path: "index.html".to_string(),
        content_type: Some("text/html".to_string()),
        headers: vec![],
        fallback_for: vec![],
        aliased_by: vec![CANISTER_DASHBOARD_HTML_PATH.to_string()],
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    }
}

/// Create asset config for JS files
fn dashboard_js_config() -> AssetConfig {
    AssetConfig::File {
        path: "index.js".to_string(),
        content_type: Some("application/javascript".to_string()),
        headers: vec![],
        fallback_for: vec![],
        aliased_by: vec![CANISTER_DASHBOARD_JS_PATH.to_string()],
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    }
}

/// Create asset config for CSS files
fn dashboard_css_config() -> AssetConfig {
    AssetConfig::File {
        path: "style.css".to_string(),
        content_type: Some("text/css".to_string()),
        headers: vec![],
        fallback_for: vec![],
        aliased_by: vec![CANISTER_DASHBOARD_CSS_PATH.to_string()],
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    }
}

/// Create asset config for alternative origins file
pub fn alternative_origins_asset_config() -> AssetConfig {
    AssetConfig::File {
        path: ALTERNATIVE_ORIGINS_PATH.to_string(),
        content_type: Some("application/json".to_string()),
        headers: vec![],
        fallback_for: vec![],
        aliased_by: vec![],
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    }
}
