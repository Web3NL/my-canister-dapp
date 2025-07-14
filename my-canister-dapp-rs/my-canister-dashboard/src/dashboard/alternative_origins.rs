use candid::CandidType;
use ic_cdk::api::certified_data_set;
use serde::{Deserialize, Serialize};
use std::cell::RefCell;

use crate::dashboard::{ALTERNATIVE_ORIGINS_PATH, alternative_origins_asset_config};
use ic_asset_certification::{Asset, AssetRouter};

thread_local! {
    static ALTERNATIVE_ORIGINS: RefCell<Vec<String>> = const { RefCell::new(Vec::new()) };
}

#[derive(CandidType, Deserialize)]
pub enum ManageAlternativeOriginsArg {
    Add(String),
    Remove(String),
}

#[derive(CandidType, Deserialize)]
pub enum ManageAlternativeOriginsResult {
    Ok,
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
