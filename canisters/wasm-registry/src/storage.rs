use candid::{CandidType, Deserialize};
use serde::Serialize;
use std::cell::RefCell;
use std::collections::HashMap;

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub struct WasmEntry {
    pub name: String,
    pub description: String,
    pub version: String,
    pub wasm_hash: String,
    pub wasm_size: u64,
    pub created_at: u64,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct UploadWasmArg {
    pub name: String,
    pub description: String,
    pub version: String,
    pub wasm_bytes: Vec<u8>,
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum UploadWasmResult {
    Ok(WasmEntry),
    Err(String),
}

#[derive(Clone, Debug, CandidType, Serialize, Deserialize)]
pub enum RemoveWasmResult {
    Ok,
    Err(String),
}

#[derive(Clone, Debug, Default)]
pub struct WasmRecord {
    pub versions: Vec<WasmEntry>,
    pub wasm_bytes: HashMap<String, Vec<u8>>,
}

thread_local! {
    static REGISTRY: RefCell<HashMap<String, WasmRecord>> =
        RefCell::new(HashMap::new());
}

pub fn get_latest(name: &str) -> Option<WasmEntry> {
    REGISTRY.with(|r| {
        r.borrow()
            .get(name)
            .and_then(|record| record.versions.last().cloned())
    })
}

pub fn get_latest_bytes(name: &str) -> Option<Vec<u8>> {
    REGISTRY.with(|r| {
        let registry = r.borrow();
        let record = registry.get(name)?;
        let latest = record.versions.last()?;
        record.wasm_bytes.get(&latest.version).cloned()
    })
}

pub fn get_version_entry(name: &str, version: &str) -> Option<WasmEntry> {
    REGISTRY.with(|r| {
        r.borrow().get(name).and_then(|record| {
            record
                .versions
                .iter()
                .find(|e| e.version == version)
                .cloned()
        })
    })
}

pub fn list_versions(name: &str) -> Vec<WasmEntry> {
    REGISTRY.with(|r| {
        r.borrow()
            .get(name)
            .map(|record| record.versions.clone())
            .unwrap_or_default()
    })
}

pub fn list_latest() -> Vec<WasmEntry> {
    REGISTRY.with(|r| {
        r.borrow()
            .values()
            .filter_map(|record| record.versions.last().cloned())
            .collect()
    })
}

pub fn insert(entry: WasmEntry, wasm_bytes: Vec<u8>) {
    REGISTRY.with(|r| {
        let mut registry = r.borrow_mut();
        let record = registry.entry(entry.name.clone()).or_default();
        record.wasm_bytes.insert(entry.version.clone(), wasm_bytes);
        record.versions.push(entry);
    });
}

pub fn remove(name: &str) -> bool {
    REGISTRY.with(|r| r.borrow_mut().remove(name).is_some())
}
