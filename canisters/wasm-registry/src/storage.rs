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

#[cfg(test)]
mod tests {
    use super::*;

    fn clear_registry() {
        REGISTRY.with(|r| r.borrow_mut().clear());
    }

    fn make_entry(name: &str, version: &str) -> WasmEntry {
        WasmEntry {
            name: name.to_string(),
            description: format!("{name} v{version}"),
            version: version.to_string(),
            wasm_hash: format!("hash-{name}-{version}"),
            wasm_size: 100,
            created_at: 0,
        }
    }

    #[test]
    fn insert_and_get_latest() {
        clear_registry();
        let entry = make_entry("my-wasm", "1.0.0");
        insert(entry.clone(), vec![0x00, 0x61]);

        let latest = get_latest("my-wasm");
        assert!(latest.is_some());
        let latest = latest.unwrap();
        assert_eq!(latest.name, "my-wasm");
        assert_eq!(latest.version, "1.0.0");
    }

    #[test]
    fn get_latest_returns_last_inserted_version() {
        clear_registry();
        insert(make_entry("my-wasm", "1.0.0"), vec![0x01]);
        insert(make_entry("my-wasm", "2.0.0"), vec![0x02]);

        let latest = get_latest("my-wasm").unwrap();
        assert_eq!(latest.version, "2.0.0");
    }

    #[test]
    fn get_latest_returns_none_for_missing() {
        clear_registry();
        assert!(get_latest("nonexistent").is_none());
    }

    #[test]
    fn latest_bytes_returns_correct_data() {
        clear_registry();
        let bytes = vec![0x00, 0x61, 0x73, 0x6d];
        insert(make_entry("my-wasm", "1.0.0"), bytes.clone());

        let result = super::get_latest_bytes("my-wasm");
        assert_eq!(result, Some(bytes));
    }

    #[test]
    fn latest_bytes_returns_none_for_missing() {
        clear_registry();
        assert!(super::get_latest_bytes("nonexistent").is_none());
    }

    #[test]
    fn get_version_entry_specific_version() {
        clear_registry();
        insert(make_entry("my-wasm", "1.0.0"), vec![0x01]);
        insert(make_entry("my-wasm", "2.0.0"), vec![0x02]);

        let v1 = get_version_entry("my-wasm", "1.0.0");
        assert!(v1.is_some());
        assert_eq!(v1.unwrap().version, "1.0.0");

        let v2 = get_version_entry("my-wasm", "2.0.0");
        assert!(v2.is_some());
        assert_eq!(v2.unwrap().version, "2.0.0");
    }

    #[test]
    fn get_version_entry_returns_none_for_missing_version() {
        clear_registry();
        insert(make_entry("my-wasm", "1.0.0"), vec![0x01]);

        assert!(get_version_entry("my-wasm", "9.9.9").is_none());
    }

    #[test]
    fn list_versions_returns_all() {
        clear_registry();
        insert(make_entry("my-wasm", "1.0.0"), vec![0x01]);
        insert(make_entry("my-wasm", "1.1.0"), vec![0x02]);
        insert(make_entry("my-wasm", "2.0.0"), vec![0x03]);

        let versions = list_versions("my-wasm");
        assert_eq!(versions.len(), 3);
        assert_eq!(versions[0].version, "1.0.0");
        assert_eq!(versions[1].version, "1.1.0");
        assert_eq!(versions[2].version, "2.0.0");
    }

    #[test]
    fn list_versions_returns_empty_for_missing() {
        clear_registry();
        assert!(list_versions("nonexistent").is_empty());
    }

    #[test]
    fn list_latest_returns_one_per_name() {
        clear_registry();
        insert(make_entry("wasm-a", "1.0.0"), vec![0x01]);
        insert(make_entry("wasm-a", "2.0.0"), vec![0x02]);
        insert(make_entry("wasm-b", "1.0.0"), vec![0x03]);

        let latest_all = list_latest();
        assert_eq!(latest_all.len(), 2);

        let names: Vec<&str> = latest_all.iter().map(|e| e.name.as_str()).collect();
        assert!(names.contains(&"wasm-a"));
        assert!(names.contains(&"wasm-b"));

        let wasm_a = latest_all.iter().find(|e| e.name == "wasm-a").unwrap();
        assert_eq!(wasm_a.version, "2.0.0");
    }

    #[test]
    fn list_latest_returns_empty_when_registry_empty() {
        clear_registry();
        assert!(list_latest().is_empty());
    }

    #[test]
    fn remove_existing_returns_true() {
        clear_registry();
        insert(make_entry("my-wasm", "1.0.0"), vec![0x01]);

        assert!(remove("my-wasm"));
        assert!(get_latest("my-wasm").is_none());
        assert!(list_versions("my-wasm").is_empty());
    }

    #[test]
    fn remove_nonexistent_returns_false() {
        clear_registry();
        assert!(!remove("nonexistent"));
    }

    #[test]
    fn remove_clears_all_versions_and_bytes() {
        clear_registry();
        insert(make_entry("my-wasm", "1.0.0"), vec![0x01]);
        insert(make_entry("my-wasm", "2.0.0"), vec![0x02]);

        assert!(remove("my-wasm"));
        assert!(get_latest("my-wasm").is_none());
        assert!(super::get_latest_bytes("my-wasm").is_none());
        assert!(get_version_entry("my-wasm", "1.0.0").is_none());
    }
}
