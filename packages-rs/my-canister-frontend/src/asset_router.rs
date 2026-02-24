use ic_asset_certification::{Asset, AssetConfig, AssetEncoding, AssetFallbackConfig, AssetRouter};
use ic_http_certification::StatusCode;
use include_dir::Dir;
use mime_guess;
use std::cell::RefCell;

thread_local! {
    static ASSET_ROUTER: RefCell<AssetRouter<'static>> = RefCell::new(AssetRouter::new());
}

/// Run a closure with a read‑only reference to the internal `AssetRouter`.
pub fn with_asset_router<F, R>(f: F) -> R
where
    F: FnOnce(&AssetRouter<'static>) -> R,
{
    ASSET_ROUTER.with(|cell| {
        let router_ref = cell.borrow();
        f(&router_ref)
    })
}

/// Run a closure with a mutable reference to the internal `AssetRouter`.
pub fn with_asset_router_mut<F, R>(f: F) -> R
where
    F: FnOnce(&mut AssetRouter<'static>) -> R,
{
    ASSET_ROUTER.with(|cell| {
        let mut router_ref = cell.borrow_mut();
        f(&mut router_ref)
    })
}

/// Process a [`Dir`](https://docs.rs/include_dir/latest/include_dir/struct.Dir.html) of frontend assets and create [`Asset`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.Asset.html) and [`AssetConfig`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/enum.AssetConfig.html) vectors
/// suitable for use with [`AssetRouter.certify_assets()`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html).
///
/// All assets are configured as `AssetConfig::File` with automatic MIME type detection using [`mime_guess`](https://docs.rs/mime_guess/latest/mime_guess/).
/// The `index.html` file, if present, is configured as a fallback for `/` route.
///
/// # Arguments
///
/// * `assets_dir` - A static directory containing the assets to process
///
/// # Returns
///
/// A tuple containing:
/// * `Vec<`[`Asset`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.Asset.html)`>` - Vector of assets with their content
/// * `Vec<`[`AssetConfig`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/enum.AssetConfig.html)`>` - Vector of asset configurations for routing
///
/// # Example
///
/// ```rust,ignore
/// use include_dir::{include_dir, Dir};
/// use my_canister_frontend::asset_router_configs;
///
/// static ASSETS: Dir = include_dir!("$CARGO_MANIFEST_DIR/assets");
///
/// let (assets, configs) = asset_router_configs(&ASSETS);
/// // Use with AssetRouter.certify_assets(assets, configs)
/// ```
pub fn asset_router_configs(
    assets_dir: &Dir<'static>,
) -> (Vec<Asset<'static, 'static>>, Vec<AssetConfig>) {
    let mut assets = Vec::new();
    let mut asset_configs = Vec::new();
    process_dir_recursive(assets_dir, "", &mut assets, &mut asset_configs);
    (assets, asset_configs)
}

fn process_dir_recursive(
    dir: &Dir<'static>,
    base_path: &str,
    assets: &mut Vec<Asset<'static, 'static>>,
    asset_configs: &mut Vec<AssetConfig>,
) {
    for file in dir.files() {
        let Some(file_name) = file.path().file_name() else {
            continue; // Skip files without valid names
        };
        let file_name = file_name.to_string_lossy();
        let full_path = if base_path.is_empty() {
            format!("/{file_name}")
        } else {
            format!("{base_path}/{file_name}")
        };
        let contents = file.contents();
        assets.push(Asset::new(full_path.clone(), contents.to_vec()));
        let config = create_asset_config(&full_path);
        asset_configs.push(config);
    }
    for subdir in dir.dirs() {
        let Some(subdir_name) = subdir.path().file_name() else {
            continue; // Skip directories without valid names
        };
        let subdir_name = subdir_name.to_string_lossy();
        let new_base_path = if base_path.is_empty() {
            format!("/{subdir_name}")
        } else {
            format!("{base_path}/{subdir_name}")
        };
        process_dir_recursive(subdir, &new_base_path, assets, asset_configs);
    }
}

fn create_asset_config(path: &str) -> AssetConfig {
    let content_type = infer_content_type(path);
    let headers = create_default_headers(&content_type);
    let (fallback_for, aliased_by) = if path == "/index.html" {
        (
            vec![AssetFallbackConfig {
                scope: "/".to_string(),
                status_code: Some(StatusCode::OK),
            }],
            vec!["/".to_string()],
        )
    } else {
        (vec![], vec![])
    };

    AssetConfig::File {
        path: path.to_string(),
        content_type: Some(content_type.clone()),
        headers,
        fallback_for,
        aliased_by,
        encodings: vec![(AssetEncoding::Identity, "".to_string())],
    }
}

fn infer_content_type(path: &str) -> String {
    mime_guess::from_path(path)
        .first()
        .map(|mime| mime.to_string())
        .unwrap_or_else(|| "application/octet-stream".to_string())
}

fn create_default_headers(_content_type: &str) -> Vec<(String, String)> {
    Vec::new()
}

#[cfg(test)]
mod tests {
    use super::*;

    mod infer_content_type {
        use super::*;

        #[test]
        fn html_file() {
            assert_eq!(infer_content_type("/index.html"), "text/html");
            assert_eq!(infer_content_type("/page.html"), "text/html");
            assert_eq!(infer_content_type("/nested/deep/page.html"), "text/html");
        }

        #[test]
        fn javascript_files() {
            // mime_guess may return "text/javascript" or "application/javascript" for .js files
            let js_type = infer_content_type("/index.js");
            assert!(
                js_type == "text/javascript" || js_type == "application/javascript",
                "Expected JavaScript MIME type, got: {js_type}"
            );
            let mjs_type = infer_content_type("/app.mjs");
            assert!(
                mjs_type == "text/javascript" || mjs_type == "application/javascript",
                "Expected JavaScript MIME type, got: {mjs_type}"
            );
            let bundle_type = infer_content_type("/assets/bundle.js");
            assert!(
                bundle_type == "text/javascript" || bundle_type == "application/javascript",
                "Expected JavaScript MIME type, got: {bundle_type}"
            );
        }

        #[test]
        fn css_files() {
            assert_eq!(infer_content_type("/style.css"), "text/css");
            assert_eq!(infer_content_type("/assets/main.css"), "text/css");
        }

        #[test]
        fn json_files() {
            assert_eq!(infer_content_type("/data.json"), "application/json");
            assert_eq!(
                infer_content_type("/.well-known/ii-alternative-origins"),
                "application/octet-stream"
            ); // No extension
        }

        #[test]
        fn image_files() {
            assert_eq!(infer_content_type("/logo.png"), "image/png");
            assert_eq!(infer_content_type("/icon.svg"), "image/svg+xml");
            assert_eq!(infer_content_type("/photo.jpg"), "image/jpeg");
            assert_eq!(infer_content_type("/photo.jpeg"), "image/jpeg");
            assert_eq!(infer_content_type("/animation.gif"), "image/gif");
            assert_eq!(infer_content_type("/image.webp"), "image/webp");
            assert_eq!(infer_content_type("/favicon.ico"), "image/x-icon");
        }

        #[test]
        fn font_files() {
            // Font MIME types can vary between mime_guess versions
            let woff = infer_content_type("/font.woff");
            assert!(
                woff == "font/woff" || woff == "application/font-woff",
                "Expected WOFF MIME type, got: {woff}"
            );
            assert_eq!(infer_content_type("/font.woff2"), "font/woff2");
            let ttf = infer_content_type("/font.ttf");
            assert!(
                ttf == "font/ttf" || ttf == "application/x-font-ttf",
                "Expected TTF MIME type, got: {ttf}"
            );
            let otf = infer_content_type("/font.otf");
            assert!(
                otf == "font/otf" || otf == "application/font-sfnt",
                "Expected OTF MIME type, got: {otf}"
            );
        }

        #[test]
        fn wasm_files() {
            assert_eq!(infer_content_type("/module.wasm"), "application/wasm");
        }

        #[test]
        fn unknown_extension_returns_octet_stream() {
            assert_eq!(
                infer_content_type("/file.unknown"),
                "application/octet-stream"
            );
            assert_eq!(
                infer_content_type("/no-extension"),
                "application/octet-stream"
            );
            assert_eq!(infer_content_type("/"), "application/octet-stream");
        }

        #[test]
        fn case_insensitive_extension() {
            assert_eq!(infer_content_type("/FILE.HTML"), "text/html");
            let js_type = infer_content_type("/SCRIPT.JS");
            assert!(
                js_type == "text/javascript" || js_type == "application/javascript",
                "Expected JavaScript MIME type, got: {js_type}"
            );
            assert_eq!(infer_content_type("/Style.CSS"), "text/css");
        }
    }

    mod create_asset_config {
        use super::*;

        #[test]
        fn index_html_has_fallback_and_alias() {
            let config = create_asset_config("/index.html");

            match config {
                AssetConfig::File {
                    path,
                    content_type,
                    fallback_for,
                    aliased_by,
                    ..
                } => {
                    assert_eq!(path, "/index.html");
                    assert_eq!(content_type, Some("text/html".to_string()));
                    assert_eq!(fallback_for.len(), 1);
                    assert_eq!(fallback_for[0].scope, "/");
                    assert_eq!(fallback_for[0].status_code, Some(StatusCode::OK));
                    assert_eq!(aliased_by, vec!["/".to_string()]);
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }

        #[test]
        fn non_index_html_has_no_fallback() {
            let config = create_asset_config("/other.html");

            match config {
                AssetConfig::File {
                    path,
                    content_type,
                    fallback_for,
                    aliased_by,
                    ..
                } => {
                    assert_eq!(path, "/other.html");
                    assert_eq!(content_type, Some("text/html".to_string()));
                    assert!(fallback_for.is_empty());
                    assert!(aliased_by.is_empty());
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }

        #[test]
        fn js_file_config() {
            let config = create_asset_config("/app.js");

            match config {
                AssetConfig::File {
                    path,
                    content_type,
                    fallback_for,
                    aliased_by,
                    encodings,
                    ..
                } => {
                    assert_eq!(path, "/app.js");
                    // JavaScript MIME type can vary
                    let ct = content_type.unwrap();
                    assert!(
                        ct == "text/javascript" || ct == "application/javascript",
                        "Expected JavaScript MIME type, got: {ct}"
                    );
                    assert!(fallback_for.is_empty());
                    assert!(aliased_by.is_empty());
                    assert_eq!(encodings.len(), 1);
                    assert!(matches!(encodings[0].0, AssetEncoding::Identity));
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }

        #[test]
        fn nested_path_config() {
            let config = create_asset_config("/assets/images/logo.png");

            match config {
                AssetConfig::File {
                    path, content_type, ..
                } => {
                    assert_eq!(path, "/assets/images/logo.png");
                    assert_eq!(content_type, Some("image/png".to_string()));
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }

        #[test]
        fn config_uses_identity_encoding() {
            let config = create_asset_config("/style.css");

            match config {
                AssetConfig::File { encodings, .. } => {
                    assert_eq!(encodings.len(), 1);
                    let (encoding, _) = &encodings[0];
                    assert!(matches!(encoding, AssetEncoding::Identity));
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }
    }

    mod create_default_headers {
        use super::*;

        #[test]
        fn returns_empty_headers() {
            let headers = create_default_headers("text/html");
            assert!(headers.is_empty());
        }

        #[test]
        fn ignores_content_type_parameter() {
            let headers_html = create_default_headers("text/html");
            let headers_js = create_default_headers("application/javascript");
            let headers_empty = create_default_headers("");

            assert_eq!(headers_html, headers_js);
            assert_eq!(headers_js, headers_empty);
        }
    }
}
