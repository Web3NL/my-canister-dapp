use ic_asset_certification::AssetRouter;

use crate::{
    ManageAlternativeOriginsArg, dashboard, dashboard::alternative_origins,
    manage_alternative_origins,
};

/// Sets up dashboard assets in a given [`AssetRouter`]. Typically used in the [`#[init]`](https://docs.rs/ic-cdk/latest/ic_cdk/attr.init.html) function of a canister.
///
/// # Arguments
///
/// * `asset_router` - Mutable reference to the [`AssetRouter`]
/// * `alternative_origins` - When provided, the [/.well-known/ii-alternative-origins](https://internetcomputer.org/docs/references/ii-spec#alternative-frontend-origins) file will be initialized with these origins.
///
/// # Example
///
/// ```rust,no_run
/// use ic_asset_certification::AssetRouter;
/// use std::cell::RefCell;
/// use ic_cdk::{api::certified_data_set, init};
///
/// thread_local! {
///     static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(
///         AssetRouter::new()
///     );
/// }
///
/// #[init]
/// fn init() {
///     ASSET_ROUTER.with(|router| {
///         let mut router = router.borrow_mut();
///         my_canister_dashboard::setup::setup_dashboard_assets(
///             &mut router,
///             Some(vec![
///                 "https://mycanister.app".to_string(),
///                 "http://localhost:5173".to_string(),
///             ]),
///         ).expect("Failed to setup dashboard assets");
///         certified_data_set(router.root_hash());
///     });
/// }
/// ```
pub fn setup_dashboard_assets(
    asset_router: &mut AssetRouter,
    alternative_origins: Option<Vec<String>>,
) -> Result<(), String> {
    dashboard::add_dashboard_assets_to_router(asset_router)?;

    if let Some(origins) = alternative_origins {
        for origin in origins {
            let arg = ManageAlternativeOriginsArg::Add(origin);
            manage_alternative_origins(asset_router, arg);
        }
    }

    alternative_origins::add_alternative_origins_to_router(asset_router)?;

    Ok(())
}
