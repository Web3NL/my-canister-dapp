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

#[cfg(test)]
mod tests {
    use super::*;

    mod validate_name_tests {
        use super::*;

        #[test]
        fn accepts_valid_lowercase_name() {
            assert!(validate_name("my-wasm").is_ok());
        }

        #[test]
        fn accepts_digits_and_hyphens() {
            assert!(validate_name("wasm-v2-beta").is_ok());
            assert!(validate_name("123").is_ok());
            assert!(validate_name("a-b-c").is_ok());
        }

        #[test]
        fn accepts_single_character() {
            assert!(validate_name("a").is_ok());
        }

        #[test]
        fn accepts_max_length_64() {
            let name = "a".repeat(64);
            assert!(validate_name(&name).is_ok());
        }

        #[test]
        fn rejects_empty_name() {
            let result = validate_name("");
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("empty"));
        }

        #[test]
        fn rejects_over_64_characters() {
            let name = "a".repeat(65);
            let result = validate_name(&name);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("64"));
        }

        #[test]
        fn rejects_uppercase() {
            assert!(validate_name("MyWasm").is_err());
            assert!(validate_name("WASM").is_err());
        }

        #[test]
        fn rejects_special_characters() {
            assert!(validate_name("my_wasm").is_err());
            assert!(validate_name("my wasm").is_err());
            assert!(validate_name("my.wasm").is_err());
            assert!(validate_name("my/wasm").is_err());
            assert!(validate_name("my@wasm").is_err());
        }
    }

    mod validate_version_tests {
        use super::*;

        #[test]
        fn accepts_valid_semver() {
            assert!(validate_version("1.0.0").is_ok());
            assert!(validate_version("0.1.0").is_ok());
            assert!(validate_version("10.20.30").is_ok());
        }

        #[test]
        fn accepts_zero_version() {
            assert!(validate_version("0.0.0").is_ok());
        }

        #[test]
        fn accepts_large_numbers() {
            assert!(validate_version("999.999.999").is_ok());
        }

        #[test]
        fn rejects_missing_patch() {
            let result = validate_version("1.0");
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("semver"));
        }

        #[test]
        fn rejects_extra_component() {
            assert!(validate_version("1.0.0.0").is_err());
        }

        #[test]
        fn rejects_non_numeric() {
            let result = validate_version("1.0.beta");
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("not a valid number"));
        }

        #[test]
        fn rejects_empty_string() {
            assert!(validate_version("").is_err());
        }

        #[test]
        fn rejects_single_number() {
            assert!(validate_version("1").is_err());
        }

        #[test]
        fn rejects_negative_numbers() {
            assert!(validate_version("-1.0.0").is_err());
        }
    }

    mod validate_wasm_bytes_tests {
        use super::*;

        #[test]
        fn accepts_valid_bytes() {
            assert!(validate_wasm_bytes(&[0x00, 0x61, 0x73, 0x6d]).is_ok());
        }

        #[test]
        fn accepts_exactly_max_size() {
            let bytes = vec![0u8; MAX_WASM_SIZE];
            assert!(validate_wasm_bytes(&bytes).is_ok());
        }

        #[test]
        fn rejects_empty_bytes() {
            let result = validate_wasm_bytes(&[]);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("empty"));
        }

        #[test]
        fn rejects_over_max_size() {
            let bytes = vec![0u8; MAX_WASM_SIZE + 1];
            let result = validate_wasm_bytes(&bytes);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("exceeds maximum"));
        }

        #[test]
        fn accepts_single_byte() {
            assert!(validate_wasm_bytes(&[0x00]).is_ok());
        }
    }

    #[test]
    fn max_wasm_size_is_2mb() {
        assert_eq!(MAX_WASM_SIZE, 2 * 1024 * 1024);
    }
}
