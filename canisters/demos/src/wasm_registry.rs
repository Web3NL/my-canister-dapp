use candid::Principal;
use ic_cdk::call::Call;

/// Fetch wasm bytes from the wasm-registry canister by name.
pub async fn fetch_wasm_bytes(registry_id: Principal, wasm_name: &str) -> Result<Vec<u8>, String> {
    let res = Call::unbounded_wait(registry_id, "get_wasm_bytes")
        .with_arg(wasm_name.to_string())
        .await
        .map_err(|e| format!("get_wasm_bytes call failed: {e}"))?;

    let bytes: Option<Vec<u8>> = res
        .candid()
        .map_err(|e| format!("get_wasm_bytes decode failed: {e}"))?;

    bytes.ok_or_else(|| format!("WASM '{}' not found in registry", wasm_name))
}
