use ic_cdk::{init, query, update};
use sha2::{Digest, Sha256};

mod storage;
mod validation;

use storage::{RemoveWasmResult, UploadWasmArg, UploadWasmResult, WasmEntry};

fn only_controllers() -> Result<(), String> {
    if ic_cdk::api::is_controller(&ic_cdk::api::msg_caller()) {
        Ok(())
    } else {
        Err("Caller is not a controller".to_string())
    }
}

#[init]
fn init() {}

#[query]
fn list_wasms() -> Vec<WasmEntry> {
    storage::list_latest()
}

#[query]
fn get_wasm_entry(name: String) -> Option<WasmEntry> {
    storage::get_latest(&name)
}

#[query]
fn get_wasm_bytes(name: String) -> Option<Vec<u8>> {
    storage::get_latest_bytes(&name)
}

#[query]
fn get_wasm_version(name: String, version: String) -> Option<WasmEntry> {
    storage::get_version_entry(&name, &version)
}

#[query]
fn list_versions(name: String) -> Vec<WasmEntry> {
    storage::list_versions(&name)
}

#[update(guard = "only_controllers")]
fn upload_wasm(arg: UploadWasmArg) -> UploadWasmResult {
    if let Err(e) = validation::validate_name(&arg.name) {
        return UploadWasmResult::Err(e);
    }
    if let Err(e) = validation::validate_version(&arg.version) {
        return UploadWasmResult::Err(e);
    }
    if let Err(e) = validation::validate_wasm_bytes(&arg.wasm_bytes) {
        return UploadWasmResult::Err(e);
    }

    if storage::get_version_entry(&arg.name, &arg.version).is_some() {
        return UploadWasmResult::Err(format!(
            "Version {} already exists for '{}'",
            arg.version, arg.name
        ));
    }

    let hash = hex::encode(Sha256::digest(&arg.wasm_bytes));
    let size = arg.wasm_bytes.len() as u64;

    let entry = WasmEntry {
        name: arg.name,
        description: arg.description,
        version: arg.version,
        wasm_hash: hash,
        wasm_size: size,
        created_at: ic_cdk::api::time(),
    };

    storage::insert(entry.clone(), arg.wasm_bytes);
    UploadWasmResult::Ok(entry)
}

#[update(guard = "only_controllers")]
fn remove_wasm(name: String) -> RemoveWasmResult {
    if storage::remove(&name) {
        RemoveWasmResult::Ok
    } else {
        RemoveWasmResult::Err(format!("WASM '{name}' not found"))
    }
}
