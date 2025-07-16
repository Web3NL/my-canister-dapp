use candid::CandidType;
use ic_cdk::api::certified_data_set;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

use crate::dashboard::{ALTERNATIVE_ORIGINS_PATH, alternative_origins_asset_config};
use ic_asset_certification::{Asset, AssetRouter};

thread_local! {
    static ALTERNATIVE_ORIGINS: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) };
}

/// Arguments for managing alternative origins.
#[derive(CandidType, Deserialize)]
pub enum ManageAlternativeOriginsArg {
    /// Add a new alternative origin URL.
    Add(String),
    /// Remove an existing alternative origin URL.
    Remove(String),
}

/// Result of managing alternative origins.
#[derive(CandidType, Deserialize)]
pub enum ManageAlternativeOriginsResult {
    /// Operation succeeded.
    Ok,
    /// Operation failed with an error message.
    Err(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct AlternativeOrigins {
    #[serde(rename = "alternativeOrigins")]
    pub alternative_origins: Vec<String>,
}

impl AlternativeOrigins {
    pub fn current() -> Self {
        let origins = ALTERNATIVE_ORIGINS.with(|cell| cell.borrow().clone());
        Self {
            alternative_origins: origins,
        }
    }

    pub fn to_json_bytes(&self) -> Result<Vec<u8>, serde_json::Error> {
        serde_json::to_vec_pretty(self)
    }

    pub fn add_origin(&mut self, origin: String) -> Result<(), String> {
        validate_alternative_origin(&origin)?;

        if !self.alternative_origins.contains(&origin) {
            self.alternative_origins.push(origin);
        }

        Ok(())
    }

    pub fn remove_origin(&mut self, origin: &str) {
        if let Some(pos) = self.alternative_origins.iter().position(|x| x == origin) {
            self.alternative_origins.remove(pos);
        }
    }
}

/// Manages alternative origins for Internet Identity.
///
/// Adds or removes alternative origin URLs and updates the asset router with the changes.
/// URLs must start with 'http://localhost:' or 'https://'.
///
/// See [Alternative Frontend Origins](https://internetcomputer.org/docs/references/ii-spec#alternative-frontend-origins) for more information.
///
/// # Arguments
///
/// * `asset_router` - Mutable reference to the [`AssetRouter`]
/// * `arg` - The operation to perform (Add or Remove)
///
/// # Returns
///
/// The result of the operation.
///
/// # Example
///
/// ```rust,ignore
/// use my_canister_dashboard::{ManageAlternativeOriginsArg, ManageAlternativeOriginsResult, guards::only_canister_controllers_guard};
/// use ic_cdk::update;
/// use std::cell::RefCell;
/// use ic_asset_certification::AssetRouter;
///
/// thread_local! {
///     static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(AssetRouter::new());
/// }
///
/// #[update(guard = "only_canister_controllers_guard")]
/// fn manage_alternative_origins(arg: ManageAlternativeOriginsArg) -> ManageAlternativeOriginsResult {
///     ASSET_ROUTER.with(|router| {
///         let mut router = router.borrow_mut();
///         my_canister_dashboard::manage_alternative_origins(&mut router, arg)
///     })
/// }
/// ```
pub fn manage_alternative_origins(
    asset_router: &mut AssetRouter,
    arg: ManageAlternativeOriginsArg,
) -> ManageAlternativeOriginsResult {
    let mut alternative_origins = AlternativeOrigins::current();

    let result = match &arg {
        ManageAlternativeOriginsArg::Add(origin) => alternative_origins.add_origin(origin.clone()),
        ManageAlternativeOriginsArg::Remove(origin) => {
            alternative_origins.remove_origin(origin);
            Ok(())
        }
    };

    match result {
        Ok(()) => {
            ALTERNATIVE_ORIGINS.with(|cell| {
                *cell.borrow_mut() = alternative_origins.alternative_origins;
            });

            add_alternative_origins_to_router(asset_router)
                .expect("Failed to add alternative origins to router");

            certified_data_set(asset_router.root_hash());

            ManageAlternativeOriginsResult::Ok
        }
        Err(e) => ManageAlternativeOriginsResult::Err(e),
    }
}

fn validate_alternative_origin(origin: &str) -> Result<(), String> {
    if origin.starts_with("http://localhost:") || origin.starts_with("https://") {
        Ok(())
    } else {
        Err("URL must start with 'http://localhost:' or 'https://'".to_string())
    }
}

pub fn add_alternative_origins_to_router(asset_router: &mut AssetRouter) -> Result<(), String> {
    let origins = AlternativeOrigins::current();
    let json_body = origins.to_json_bytes().unwrap_or_else(|_| b"[]".to_vec());
    let asset = Asset::new(ALTERNATIVE_ORIGINS_PATH.to_string(), json_body);
    let asset_config = alternative_origins_asset_config();

    asset_router
        .certify_assets(vec![asset], vec![asset_config])
        .map_err(|e| format!("Failed to certify alternative origins asset: {e:?}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_alternative_origins_serialization() {
        let origins = AlternativeOrigins {
            alternative_origins: vec![
                "https://example.com".to_string(),
                "http://localhost:3000".to_string(),
            ],
        };

        let json = origins.to_json_bytes().unwrap();
        let json_str = String::from_utf8(json).unwrap();

        assert!(json_str.contains("alternativeOrigins"));
        assert!(json_str.contains("https://example.com"));
        assert!(json_str.contains("http://localhost:3000"));
    }

    #[test]
    fn test_alternative_origins_add_origin() {
        let mut origins = AlternativeOrigins {
            alternative_origins: vec![],
        };

        // Test adding valid HTTPS origin
        assert!(
            origins
                .add_origin("https://example.com".to_string())
                .is_ok()
        );
        assert_eq!(origins.alternative_origins.len(), 1);

        // Test adding valid localhost origin
        assert!(
            origins
                .add_origin("http://localhost:3000".to_string())
                .is_ok()
        );
        assert_eq!(origins.alternative_origins.len(), 2);

        // Test adding duplicate (should not add)
        assert!(
            origins
                .add_origin("https://example.com".to_string())
                .is_ok()
        );
        assert_eq!(origins.alternative_origins.len(), 2);

        // Test adding invalid origin
        assert!(
            origins
                .add_origin("http://invalid.com".to_string())
                .is_err()
        );
        assert_eq!(origins.alternative_origins.len(), 2);
    }

    #[test]
    fn test_alternative_origins_remove_origin() {
        let mut origins = AlternativeOrigins {
            alternative_origins: vec![
                "https://example.com".to_string(),
                "http://localhost:3000".to_string(),
            ],
        };

        origins.remove_origin("https://example.com");
        assert_eq!(origins.alternative_origins.len(), 1);
        assert_eq!(origins.alternative_origins[0], "http://localhost:3000");

        // Test removing non-existent origin
        origins.remove_origin("https://nonexistent.com");
        assert_eq!(origins.alternative_origins.len(), 1);
    }
}
