#![doc = include_str!("../README.md")]

use candid::Principal;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

const TARGET_WASM_DIR: &str = "../../wasm";

const II_PRINCIPAL_AT_INSTALLER_APP_BYTE: u8 = 255;
const II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE: u8 = 254;
const STRANGER_PRINCIPAL_BYTE: u8 = 253;

pub const MIN_CANISTER_CREATION_BALANCE: u128 = 500_000_000_000;

// Common constants for PocketIC system canisters and artifacts used by tests
pub const ICP_LEDGER_CANISTER_ID_TEXT: &str = "ryjl3-tyaaa-aaaaa-aaaba-cai";
pub const FAKE_CMC_CANISTER_ID_TEXT: &str = "rkp4c-7iaaa-aaaaa-aaaca-cai";

// Relative paths (from CARGO_MANIFEST_DIR of the test crate) to Wasm artifacts
pub const LEDGER_WASM_GZ_RELATIVE: &str = "../../dfx-env/icp-ledger/icp-ledger.wasm.gz";
pub const FAKE_CMC_WASM_RELATIVE: &str =
    "../../dfx-env/.dfx/local/canisters/fake-cmc/fake-cmc.wasm";

// Ledger init configuration used in tests
pub const LEDGER_INIT_TRANSFER_FEE_E8S: u64 = 10_000; // 0.0001 ICP
pub const LEDGER_PREFUND_E8S: u64 = 20_000_000_000; // 200 ICP

// Cycles to seed system canisters (ledger, cmc) in PocketIC
pub const SYSTEM_CANISTER_BOOT_CYCLES: u128 = 10_000_000_000_000; // 10T cycles

pub fn get_wasm_file_name() -> Result<String, String> {
    if !Path::new(TARGET_WASM_DIR).exists() {
        return Err("target-wasm directory not found".to_string());
    }

    let entries = fs::read_dir(TARGET_WASM_DIR)
        .map_err(|e| format!("Failed to read target-wasm directory: {e}"))?;

    let wasm_files: Vec<String> = entries
        .filter_map(|entry| {
            let entry = entry.ok()?;
            let path = entry.path();
            if path.is_file() && path.to_string_lossy().ends_with(".wasm.gz") {
                Some(path.to_string_lossy().to_string())
            } else {
                None
            }
        })
        .collect();

    match wasm_files.len() {
        0 => Err("No .wasm.gz files found in target-wasm directory".to_string()),
        1 => Ok(wasm_files[0].clone()),
        _ => Err(format!(
            "Multiple .wasm.gz files found: expected exactly one, found {}",
            wasm_files.len()
        )),
    }
}

pub fn ii_principal_at_installer_app() -> Principal {
    Principal::from_slice(&[II_PRINCIPAL_AT_INSTALLER_APP_BYTE; 29])
}

pub fn ii_principal_at_user_controlled_dapp() -> Principal {
    Principal::from_slice(&[II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE; 29])
}

pub fn stranger_principal() -> Principal {
    Principal::from_slice(&[STRANGER_PRINCIPAL_BYTE; 29])
}

#[derive(Serialize, Deserialize, Debug)]
struct VersionHashes {
    versions: HashMap<String, VersionData>,
}

#[derive(Serialize, Deserialize, Debug)]
struct VersionData {
    assets: Assets,
}

#[derive(Serialize, Deserialize, Debug)]
struct Assets {
    frontend: HashMap<String, String>,
    wasm: HashMap<String, String>,
}

/// Computes SHA256 hash of the given data and returns it as a hex string.
pub fn compute_asset_hash(data: &[u8]) -> String {
    hex::encode(Sha256::digest(data))
}

/// Asset hashes for verification and debugging.
#[derive(Debug, Clone)]
pub struct AssetHashes {
    pub html_hash: String,
    pub js_hash: String,
    pub css_hash: String,
}

/// Computes hashes for the three main dashboard assets.
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

/// Validates that HTML content has expected structure for the canister dashboard.
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

/// Validates that JavaScript content is non-empty and doesn't contain obvious errors.
pub fn validate_js_structure(js: &[u8]) -> Result<(), String> {
    if js.is_empty() {
        return Err("JavaScript file is empty".to_string());
    }

    // Check for minimum size (bundled JS should be reasonably sized)
    if js.len() < 100 {
        return Err(format!(
            "JavaScript file is suspiciously small: {} bytes",
            js.len()
        ));
    }

    // Check it's valid UTF-8
    if String::from_utf8(js.to_vec()).is_err() {
        return Err("JavaScript file contains invalid UTF-8".to_string());
    }

    Ok(())
}

/// Validates that CSS content has expected structure.
pub fn validate_css_structure(css: &[u8]) -> Result<(), String> {
    if css.is_empty() {
        return Err("CSS file is empty".to_string());
    }

    let content = String::from_utf8(css.to_vec())
        .map_err(|_| "CSS file contains invalid UTF-8".to_string())?;

    // CSS should contain at least one rule (selector { ... })
    if !content.contains('{') || !content.contains('}') {
        return Err("CSS file doesn't appear to contain any style rules".to_string());
    }

    Ok(())
}

/// Validates all three main dashboard assets.
pub fn validate_frontend_assets(
    index_html: &[u8],
    index_js: &[u8],
    style_css: &[u8],
) -> Result<AssetHashes, String> {
    validate_html_structure(index_html)?;
    validate_js_structure(index_js)?;
    validate_css_structure(style_css)?;

    Ok(compute_frontend_asset_hashes(index_html, index_js, style_css))
}
