#![doc = include_str!("../README.md")]

use candid::Principal;
use serde::{Deserialize, Serialize};
// use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

const TARGET_WASM_DIR: &str = "../../wasm";
// const VERSION_HASHES_FILE: &str = "../../assets/version-hashes.json";

const II_PRINCIPAL_AT_INSTALLER_APP_BYTE: u8 = 255;
const II_PRINCIPAL_AT_USER_CONTROLLED_DAPP_BYTE: u8 = 254;

pub const MIN_CANISTER_CREATION_BALANCE: u128 = 500_000_000_000;

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

// pub fn verify_frontend_assets(
//     index_html: &[u8],
//     index_js: &[u8],
//     style_css: &[u8],
// ) -> Result<String, String> {
//     let html_hash = hex::encode(Sha256::digest(index_html));
//     let js_hash = hex::encode(Sha256::digest(index_js));
//     let css_hash = hex::encode(Sha256::digest(style_css));

//     let version_hashes_json = std::fs::read_to_string(VERSION_HASHES_FILE)
//         .map_err(|e| format!("Failed to read version-hashes.json: {e}"))?;

//     let version_hashes: VersionHashes = serde_json::from_str(&version_hashes_json)
//         .map_err(|e| format!("Failed to parse version-hashes.json: {e}"))?;

//     for (version, data) in version_hashes.versions {
//         let frontend = &data.assets.frontend;

//         if let (Some(expected_html), Some(expected_js), Some(expected_css)) = (
//             frontend.get("index.html"),
//             frontend.get("index.js"),
//             frontend.get("style.css"),
//         ) {
//             if html_hash == *expected_html && js_hash == *expected_js && css_hash == *expected_css {
//                 return Ok(version);
//             }
//         }
//     }

//     Err("No matching version found".to_string())
// }
