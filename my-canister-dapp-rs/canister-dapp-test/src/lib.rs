#![doc = include_str!("../README.md")]

use candid::Principal;
use sha2::{Digest, Sha256};
use std::path::Path;

/// Relative path from the test binary's working directory to the WASM output directory.
const TARGET_WASM_DIR: &str = "../../wasm";

// Synthetic principal bytes used to create deterministic test principals.
const II_PRINCIPAL_AT_INSTALLER_APP_BYTE: u8 = 255;
const II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE: u8 = 254;
const STRANGER_PRINCIPAL_BYTE: u8 = 253;

/// Minimum cycles required to create a canister on PocketIC.
pub const MIN_CANISTER_CREATION_BALANCE: u128 = 500_000_000_000;

// System canister IDs deployed by PocketIC's IcpFeatures (same as mainnet).
/// ICP Ledger canister ID.
pub const ICP_LEDGER_CANISTER_ID_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
/// ICP Index canister ID.
pub const ICP_INDEX_CANISTER_ID_TEXT: &str = "qhbym-qaaaa-aaaaa-aaafq-cai";
/// Cycles Minting Canister (CMC) ID.
pub const CMC_CANISTER_ID_TEXT: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";
/// Internet Identity canister ID.
pub const II_CANISTER_ID_TEXT: &str = "rdmx6-jaaaa-aaaaa-aaadq-cai";

/// ICP ledger transfer fee in e8s (0.0001 ICP).
pub const LEDGER_INIT_TRANSFER_FEE_E8S: u64 = 10_000;
/// Amount of ICP (in e8s) pre-funded to the canister for top-up tests (200 ICP).
pub const LEDGER_PREFUND_E8S: u64 = 20_000_000_000;

/// Returns the filesystem path for a named WASM file in the build output directory.
///
/// Looks for `{name}.wasm.gz` inside [`TARGET_WASM_DIR`].
pub fn get_wasm_file_path(name: &str) -> Result<String, String> {
    let path = Path::new(TARGET_WASM_DIR).join(format!("{name}.wasm.gz"));
    if path.exists() {
        Ok(path.to_string_lossy().to_string())
    } else {
        Err(format!("{} not found", path.display()))
    }
}

/// Principal simulating the installer app (the initial controller that installs the dapp WASM).
pub fn ii_principal_at_installer_app() -> Principal {
    Principal::from_slice(&[II_PRINCIPAL_AT_INSTALLER_APP_BYTE; 29])
}

/// Principal simulating the dapp owner (the II-authenticated end user).
pub fn ii_principal_at_user_controlled_dapp() -> Principal {
    Principal::from_slice(&[II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE; 29])
}

/// Principal simulating an unauthorized caller (should be rejected by all guards).
pub fn stranger_principal() -> Principal {
    Principal::from_slice(&[STRANGER_PRINCIPAL_BYTE; 29])
}

/// SHA-256 hash of `data`, returned as a lowercase hex string.
pub fn compute_asset_hash(data: &[u8]) -> String {
    hex::encode(Sha256::digest(data))
}

/// Hashes of the three dashboard frontend assets, for verification and debugging.
#[derive(Debug, Clone)]
pub struct AssetHashes {
    pub html_hash: String,
    pub js_hash: String,
    pub css_hash: String,
}

/// Computes SHA-256 hashes for the three main dashboard assets.
pub fn compute_frontend_asset_hashes(
    index_html: &[u8],
    index_js: &[u8],
    style_css: &[u8],
) -> AssetHashes {
    AssetHashes {
        html_hash: compute_asset_hash(index_html),
        js_hash: compute_asset_hash(index_js),
        css_hash: compute_asset_hash(style_css),
    }
}

/// Validates that HTML content has the expected structure for a canister dashboard page.
pub fn validate_html_structure(html: &[u8]) -> Result<(), String> {
    let content = String::from_utf8_lossy(html);

    if !content.contains("<!DOCTYPE html>") && !content.contains("<!doctype html>") {
        return Err("HTML missing DOCTYPE declaration".to_string());
    }
    if !content.contains("<html") {
        return Err("HTML missing <html> tag".to_string());
    }
    if !content.contains("</html>") {
        return Err("HTML missing closing </html> tag".to_string());
    }
    if !content.contains("<head") || !content.contains("</head>") {
        return Err("HTML missing <head> section".to_string());
    }
    if !content.contains("<body") || !content.contains("</body>") {
        return Err("HTML missing <body> section".to_string());
    }

    Ok(())
}

/// Validates that JavaScript content is non-empty, reasonably sized, and valid UTF-8.
pub fn validate_js_structure(js: &[u8]) -> Result<(), String> {
    if js.is_empty() {
        return Err("JavaScript file is empty".to_string());
    }
    if js.len() < 100 {
        return Err(format!(
            "JavaScript file is suspiciously small: {} bytes",
            js.len()
        ));
    }
    if String::from_utf8(js.to_vec()).is_err() {
        return Err("JavaScript file contains invalid UTF-8".to_string());
    }

    Ok(())
}

/// Validates that CSS content is non-empty, valid UTF-8, and contains at least one style rule.
pub fn validate_css_structure(css: &[u8]) -> Result<(), String> {
    if css.is_empty() {
        return Err("CSS file is empty".to_string());
    }

    let content = String::from_utf8(css.to_vec())
        .map_err(|_| "CSS file contains invalid UTF-8".to_string())?;

    if !content.contains('{') || !content.contains('}') {
        return Err("CSS file doesn't appear to contain any style rules".to_string());
    }

    Ok(())
}

/// Validates all three main dashboard assets and returns their SHA-256 hashes.
pub fn validate_frontend_assets(
    index_html: &[u8],
    index_js: &[u8],
    style_css: &[u8],
) -> Result<AssetHashes, String> {
    validate_html_structure(index_html)?;
    validate_js_structure(index_js)?;
    validate_css_structure(style_css)?;

    Ok(compute_frontend_asset_hashes(
        index_html, index_js, style_css,
    ))
}
