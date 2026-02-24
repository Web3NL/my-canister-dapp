pub const MAX_WASM_SIZE: usize = 2 * 1024 * 1024;

pub fn validate_name(name: &str) -> Result<(), String> {
    if name.is_empty() {
        return Err("Name cannot be empty".to_string());
    }
    if name.len() > 64 {
        return Err("Name cannot exceed 64 characters".to_string());
    }
    if !name
        .chars()
        .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    {
        return Err("Name must contain only lowercase letters, digits, and hyphens".to_string());
    }
    Ok(())
}

pub fn validate_version(version: &str) -> Result<(), String> {
    let parts: Vec<&str> = version.split('.').collect();
    if parts.len() != 3 {
        return Err("Version must be in semver format: MAJOR.MINOR.PATCH".to_string());
    }
    for part in &parts {
        if part.parse::<u64>().is_err() {
            return Err(format!("Version component '{part}' is not a valid number"));
        }
    }
    Ok(())
}

pub fn validate_wasm_bytes(bytes: &[u8]) -> Result<(), String> {
    if bytes.is_empty() {
        return Err("WASM bytes cannot be empty".to_string());
    }
    if bytes.len() > MAX_WASM_SIZE {
        return Err(format!(
            "WASM size {} exceeds maximum {}",
            bytes.len(),
            MAX_WASM_SIZE
        ));
    }
    Ok(())
}
