use ic_asset_certification::AssetRouter;

use crate::{
    ManageAlternativeOriginsArg, dashboard, dashboard::alternative_origins,
    manage_alternative_origins,
};

pub fn setup_dashboard_assets(
    asset_router: &mut AssetRouter,
    alternative_origins: Option<Vec<String>>,
) {
    dashboard::add_dashboard_assets_to_router(asset_router)
        .expect("Failed to add dashboard assets to router");

    if let Some(origins) = alternative_origins {
        for origin in origins {
            let arg = ManageAlternativeOriginsArg::Add(origin);
            manage_alternative_origins(asset_router, arg);
        }
    }

    alternative_origins::add_alternative_origins_to_router(asset_router)
        .expect("Failed to add alternative origins to router");
}
