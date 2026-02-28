use crate::storage::{self, AccessCode, AccessCodeStatus, GenerateCodesResult};
use ic_cdk::call::Call;
use sha2::{Digest, Sha256};

/// Maximum number of codes that can be generated in a single call.
const MAX_CODES_PER_CALL: u32 = 100;

/// Characters used for access code generation (alphanumeric, uppercase).
const CODE_CHARS: &[u8] = b"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion

/// Generate `count` access codes and store them.
pub async fn generate_access_codes(count: u32) -> GenerateCodesResult {
    if count == 0 {
        return GenerateCodesResult::Err("Count must be greater than 0".to_string());
    }
    if count > MAX_CODES_PER_CALL {
        return GenerateCodesResult::Err(format!(
            "Cannot generate more than {MAX_CODES_PER_CALL} codes at once"
        ));
    }

    // Fetch random bytes from IC management canister
    let random_bytes = match fetch_random_bytes().await {
        Ok(bytes) => bytes,
        Err(e) => return GenerateCodesResult::Err(format!("Failed to get random bytes: {e}")),
    };

    let now = ic_cdk::api::time();
    let mut codes = Vec::with_capacity(count as usize);

    for i in 0..count {
        let code = derive_code(&random_bytes, i, now);

        // Ensure uniqueness (extremely unlikely to collide, but check anyway)
        let is_unique = storage::with_state(|s| !s.access_codes.contains_key(&code));
        if !is_unique {
            return GenerateCodesResult::Err("Code collision detected, try again".to_string());
        }

        storage::with_state_mut(|s| {
            s.access_codes.insert(
                code.clone(),
                AccessCode {
                    code: code.clone(),
                    status: AccessCodeStatus::Available,
                    created_at: now,
                    redeemed_at: None,
                },
            );
        });

        codes.push(code);
    }

    GenerateCodesResult::Ok(codes)
}

/// Check if an access code exists and is available.
pub fn is_code_available(code: &str) -> bool {
    storage::with_state(|s| {
        s.access_codes
            .get(code)
            .is_some_and(|ac| matches!(ac.status, AccessCodeStatus::Available))
    })
}

/// Derive a single access code from random seed bytes, index, and timestamp.
fn derive_code(random_bytes: &[u8], index: u32, timestamp: u64) -> String {
    let mut hasher = Sha256::new();
    hasher.update(random_bytes);
    hasher.update(index.to_le_bytes());
    hasher.update(timestamp.to_le_bytes());
    let hash = hasher.finalize();

    // Take 12 characters from the hash
    let chars: String = hash
        .iter()
        .take(12)
        .map(|&b| CODE_CHARS[(b as usize) % CODE_CHARS.len()] as char)
        .collect();

    // Format as XXXX-XXXX-XXXX
    format!("{}-{}-{}", &chars[0..4], &chars[4..8], &chars[8..12])
}

/// Fetch 32 random bytes from the IC management canister.
async fn fetch_random_bytes() -> Result<Vec<u8>, String> {
    let res = Call::unbounded_wait(candid::Principal::management_canister(), "raw_rand")
        .with_arg(())
        .await
        .map_err(|e| format!("raw_rand call failed: {e}"))?;

    let bytes: Vec<u8> = res
        .candid()
        .map_err(|e| format!("raw_rand decode failed: {e}"))?;

    Ok(bytes)
}
