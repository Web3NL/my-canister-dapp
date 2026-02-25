use flate2::Compression;
use flate2::write::GzEncoder;
use ic_asset_certification::{Asset, AssetConfig, AssetEncoding, AssetFallbackConfig, AssetRouter};
use ic_http_certification::StatusCode;
use include_dir::Dir;
use mime_guess;
use std::cell::RefCell;
use std::collections::HashSet;
use std::io::Write;

/// Default file extensions allowed for web frontend assets.
/// Files with extensions not in this list will be rejected unless
/// explicitly allowed via [`FrontendConfig::extra_allowed_extensions`].
pub const DEFAULT_ALLOWED_EXTENSIONS: &[&str] = &[
    "html", "js", "mjs", "css", "png", "jpg", "jpeg", "gif", "webp", "svg", "ico", "avif", "woff",
    "woff2", "ttf", "otf", "eot", "json", "xml", "txt", "wasm", "map",
];

/// Maximum file size in bytes (2 MB).
pub const DEFAULT_MAX_FILE_SIZE: usize = 2 * 1024 * 1024;

/// File extensions that benefit from gzip compression.
/// Binary formats (images, fonts, wasm) are already compressed.
const COMPRESSIBLE_EXTENSIONS: &[&str] = &[
    "html", "js", "mjs", "css", "json", "svg", "xml", "txt", "map",
];

/// Configuration for frontend asset processing.
///
/// Use with [`asset_router_configs_with_config`] or
/// [`setup_frontend_with_config`](crate::setup_frontend_with_config) to
/// customise validation beyond the defaults.
#[derive(Debug, Clone)]
pub struct FrontendConfig {
    /// Additional file extensions to allow beyond [`DEFAULT_ALLOWED_EXTENSIONS`].
    /// Extensions should be specified without the leading dot (e.g. `"webmanifest"`).
    pub extra_allowed_extensions: Vec<String>,
    /// Maximum file size in bytes. Defaults to [`DEFAULT_MAX_FILE_SIZE`] (2 MB).
    pub max_file_size: usize,
}

impl Default for FrontendConfig {
    fn default() -> Self {
        Self {
            extra_allowed_extensions: Vec::new(),
            max_file_size: DEFAULT_MAX_FILE_SIZE,
        }
    }
}

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

/// Process a [`Dir`] of frontend assets with the default [`FrontendConfig`].
///
/// See [`asset_router_configs_with_config`] for details.
pub fn asset_router_configs(
    assets_dir: &Dir<'static>,
) -> Result<(Vec<Asset<'static, 'static>>, Vec<AssetConfig>), String> {
    asset_router_configs_with_config(assets_dir, &FrontendConfig::default())
}

/// Process a [`Dir`](https://docs.rs/include_dir/latest/include_dir/struct.Dir.html) of frontend assets and create [`Asset`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.Asset.html) and [`AssetConfig`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/enum.AssetConfig.html) vectors
/// suitable for use with [`AssetRouter.certify_assets()`](https://docs.rs/ic-asset-certification/latest/ic_asset_certification/struct.AssetRouter.html).
///
/// All assets are validated against the [`FrontendConfig`] rules:
/// - File extension must be in [`DEFAULT_ALLOWED_EXTENSIONS`] or `config.extra_allowed_extensions`
/// - File size must not exceed `config.max_file_size`
/// - Paths must not contain `..`, `//`, or invalid URL characters
/// - Duplicate paths are rejected
///
/// Assets are configured as `AssetConfig::File` with automatic MIME type
/// detection using [`mime_guess`](https://docs.rs/mime_guess/latest/mime_guess/).
/// The `index.html` file, if present, is configured as a fallback for `/` route.
pub fn asset_router_configs_with_config(
    assets_dir: &Dir<'static>,
    config: &FrontendConfig,
) -> Result<(Vec<Asset<'static, 'static>>, Vec<AssetConfig>), String> {
    let mut assets = Vec::new();
    let mut asset_configs = Vec::new();
    let mut seen_paths = HashSet::new();
    process_dir_recursive(
        assets_dir,
        "",
        &mut assets,
        &mut asset_configs,
        &mut seen_paths,
        config,
    )?;
    Ok((assets, asset_configs))
}

fn process_dir_recursive(
    dir: &Dir<'static>,
    base_path: &str,
    assets: &mut Vec<Asset<'static, 'static>>,
    asset_configs: &mut Vec<AssetConfig>,
    seen_paths: &mut HashSet<String>,
    config: &FrontendConfig,
) -> Result<(), String> {
    for file in dir.files() {
        let Some(file_name) = file.path().file_name() else {
            continue;
        };
        let file_name = file_name.to_string_lossy();
        let full_path = if base_path.is_empty() {
            format!("/{file_name}")
        } else {
            format!("{base_path}/{file_name}")
        };
        let contents = file.contents();

        validate_asset(&full_path, contents.len(), config)?;

        if !seen_paths.insert(full_path.clone()) {
            return Err(format!("Duplicate asset path: {full_path}"));
        }

        let compressible = is_compressible(&full_path);
        assets.push(Asset::new(full_path.clone(), contents.to_vec()));
        if compressible {
            let gzipped = gzip_compress(contents)?;
            assets.push(Asset::new(format!("{full_path}.gz"), gzipped));
        }
        let cfg = create_asset_config(&full_path, compressible);
        asset_configs.push(cfg);
    }
    for subdir in dir.dirs() {
        let Some(subdir_name) = subdir.path().file_name() else {
            continue;
        };
        let subdir_name = subdir_name.to_string_lossy();
        let new_base_path = if base_path.is_empty() {
            format!("/{subdir_name}")
        } else {
            format!("{base_path}/{subdir_name}")
        };
        process_dir_recursive(
            subdir,
            &new_base_path,
            assets,
            asset_configs,
            seen_paths,
            config,
        )?;
    }
    Ok(())
}

fn validate_asset(path: &str, size: usize, config: &FrontendConfig) -> Result<(), String> {
    // Path traversal
    if path.contains("..") {
        return Err(format!("Path traversal detected: {path}"));
    }
    // Double slashes
    if path.contains("//") {
        return Err(format!("Double slashes detected: {path}"));
    }
    // Invalid URL characters
    for ch in path.chars() {
        if ch.is_control() || matches!(ch, '\\' | '?' | '#' | ' ' | '%') {
            return Err(format!("Invalid character '{ch}' in asset path: {path}"));
        }
    }
    // File extension allowlist
    let ext = std::path::Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| e.to_lowercase());
    match ext {
        None => return Err(format!("File has no extension (not in allowlist): {path}")),
        Some(ext) => {
            let allowed = DEFAULT_ALLOWED_EXTENSIONS.contains(&ext.as_str())
                || config
                    .extra_allowed_extensions
                    .iter()
                    .any(|e| e.eq_ignore_ascii_case(&ext));
            if !allowed {
                return Err(format!(
                    "File extension '.{ext}' is not in the allowed list: {path}"
                ));
            }
        }
    }
    // File size
    if size > config.max_file_size {
        return Err(format!(
            "File size ({size} bytes) exceeds maximum ({} bytes): {path}",
            config.max_file_size
        ));
    }
    Ok(())
}

fn is_compressible(path: &str) -> bool {
    std::path::Path::new(path)
        .extension()
        .and_then(|e| e.to_str())
        .is_some_and(|e| COMPRESSIBLE_EXTENSIONS.contains(&e.to_lowercase().as_str()))
}

fn gzip_compress(data: &[u8]) -> Result<Vec<u8>, String> {
    let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
    encoder
        .write_all(data)
        .map_err(|e| format!("Gzip compression failed: {e}"))?;
    encoder
        .finish()
        .map_err(|e| format!("Gzip finalization failed: {e}"))
}

fn create_asset_config(path: &str, include_gzip: bool) -> AssetConfig {
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
        encodings: if include_gzip {
            vec![
                (AssetEncoding::Identity, "".to_string()),
                (AssetEncoding::Gzip, ".gz".to_string()),
            ]
        } else {
            vec![(AssetEncoding::Identity, "".to_string())]
        },
    }
}

fn infer_content_type(path: &str) -> String {
    mime_guess::from_path(path)
        .first()
        .map(|mime| mime.to_string())
        .unwrap_or_else(|| "application/octet-stream".to_string())
}

fn create_default_headers(_content_type: &str) -> Vec<(String, String)> {
    vec![
        ("X-Content-Type-Options".into(), "nosniff".into()),
        ("X-Frame-Options".into(), "DENY".into()),
        ("Referrer-Policy".into(), "no-referrer".into()),
        ("X-XSS-Protection".into(), "0".into()),
        (
            "Strict-Transport-Security".into(),
            "max-age=31536000; includeSubDomains".into(),
        ),
        (
            "Permissions-Policy".into(),
            "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()".into(),
        ),
        (
            "Cross-Origin-Opener-Policy".into(),
            "same-origin-allow-popups".into(),
        ),
        ("Cross-Origin-Resource-Policy".into(), "same-origin".into()),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    mod frontend_config_defaults {
        use super::*;

        #[test]
        fn default_max_file_size_is_2mb() {
            let config = FrontendConfig::default();
            assert_eq!(config.max_file_size, 2 * 1024 * 1024);
        }

        #[test]
        fn default_extra_extensions_is_empty() {
            let config = FrontendConfig::default();
            assert!(config.extra_allowed_extensions.is_empty());
        }

        #[test]
        fn default_allowed_extensions_count() {
            // Ensure the allowlist has the expected number of entries
            assert_eq!(DEFAULT_ALLOWED_EXTENSIONS.len(), 22);
        }

        #[test]
        fn default_allowed_extensions_contains_web_essentials() {
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"html"));
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"js"));
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"css"));
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"json"));
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"svg"));
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"png"));
            assert!(DEFAULT_ALLOWED_EXTENSIONS.contains(&"wasm"));
        }

        #[test]
        fn compressible_extensions_are_text_based() {
            for ext in COMPRESSIBLE_EXTENSIONS {
                assert!(
                    DEFAULT_ALLOWED_EXTENSIONS.contains(ext),
                    "Compressible extension '{ext}' is not in the allowed list"
                );
            }
        }
    }

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
            let config = create_asset_config("/index.html", false);

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
            let config = create_asset_config("/other.html", false);

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
            let config = create_asset_config("/app.js", false);

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
            let config = create_asset_config("/assets/images/logo.png", false);

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
            let config = create_asset_config("/style.css", false);

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
        fn returns_eight_headers() {
            let headers = create_default_headers("text/html");
            assert_eq!(headers.len(), 8);
        }

        #[test]
        fn includes_x_content_type_options() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&("X-Content-Type-Options".into(), "nosniff".into())));
        }

        #[test]
        fn includes_x_frame_options() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&("X-Frame-Options".into(), "DENY".into())));
        }

        #[test]
        fn includes_referrer_policy() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&("Referrer-Policy".into(), "no-referrer".into())));
        }

        #[test]
        fn includes_xss_protection_disabled() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&("X-XSS-Protection".into(), "0".into())));
        }

        #[test]
        fn includes_hsts() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&(
                "Strict-Transport-Security".into(),
                "max-age=31536000; includeSubDomains".into()
            )));
        }

        #[test]
        fn includes_permissions_policy() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&(
                "Permissions-Policy".into(),
                "accelerometer=(), camera=(), geolocation=(), microphone=(), payment=(), usb=()"
                    .into()
            )));
        }

        #[test]
        fn includes_cross_origin_opener_policy() {
            let headers = create_default_headers("text/html");
            assert!(headers.contains(&(
                "Cross-Origin-Opener-Policy".into(),
                "same-origin-allow-popups".into(),
            )));
        }

        #[test]
        fn includes_cross_origin_resource_policy() {
            let headers = create_default_headers("text/html");
            assert!(
                headers.contains(&("Cross-Origin-Resource-Policy".into(), "same-origin".into()))
            );
        }

        #[test]
        fn same_headers_regardless_of_content_type() {
            let headers_html = create_default_headers("text/html");
            let headers_js = create_default_headers("application/javascript");
            let headers_empty = create_default_headers("");

            assert_eq!(headers_html, headers_js);
            assert_eq!(headers_js, headers_empty);
        }
    }

    mod validate_asset {
        use super::*;

        #[test]
        fn allows_default_extensions() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/index.html", 100, &config).is_ok());
            assert!(validate_asset("/app.js", 100, &config).is_ok());
            assert!(validate_asset("/style.css", 100, &config).is_ok());
            assert!(validate_asset("/data.json", 100, &config).is_ok());
            assert!(validate_asset("/logo.png", 100, &config).is_ok());
            assert!(validate_asset("/font.woff2", 100, &config).is_ok());
            assert!(validate_asset("/module.wasm", 100, &config).is_ok());
            assert!(validate_asset("/app.mjs", 100, &config).is_ok());
            assert!(validate_asset("/bundle.js.map", 100, &config).is_ok());
        }

        #[test]
        fn rejects_unknown_extension() {
            let config = FrontendConfig::default();
            let result = validate_asset("/file.exe", 100, &config);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("not in the allowed list"));
        }

        #[test]
        fn rejects_no_extension() {
            let config = FrontendConfig::default();
            let result = validate_asset("/no-extension", 100, &config);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("no extension"));
        }

        #[test]
        fn allows_extra_extension() {
            let config = FrontendConfig {
                extra_allowed_extensions: vec!["webmanifest".to_string()],
                ..Default::default()
            };
            assert!(validate_asset("/manifest.webmanifest", 100, &config).is_ok());
        }

        #[test]
        fn extra_extension_case_insensitive() {
            let config = FrontendConfig {
                extra_allowed_extensions: vec!["WebManifest".to_string()],
                ..Default::default()
            };
            assert!(validate_asset("/manifest.webmanifest", 100, &config).is_ok());
        }

        #[test]
        fn rejects_oversized_file() {
            let config = FrontendConfig::default();
            let result = validate_asset("/big.html", 3_000_000, &config);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("exceeds maximum"));
        }

        #[test]
        fn allows_file_at_size_limit() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/exact.html", DEFAULT_MAX_FILE_SIZE, &config).is_ok());
        }

        #[test]
        fn rejects_file_one_byte_over_limit() {
            let config = FrontendConfig::default();
            let result = validate_asset("/over.html", DEFAULT_MAX_FILE_SIZE + 1, &config);
            assert!(result.is_err());
        }

        #[test]
        fn custom_max_file_size() {
            let config = FrontendConfig {
                max_file_size: 500,
                ..Default::default()
            };
            assert!(validate_asset("/small.html", 500, &config).is_ok());
            assert!(validate_asset("/big.html", 501, &config).is_err());
        }

        #[test]
        fn rejects_path_traversal() {
            let config = FrontendConfig::default();
            let result = validate_asset("/assets/../etc/passwd.html", 100, &config);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("traversal"));
        }

        #[test]
        fn rejects_double_slashes() {
            let config = FrontendConfig::default();
            let result = validate_asset("/assets//file.html", 100, &config);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("Double slashes"));
        }

        #[test]
        fn rejects_space_in_path() {
            let config = FrontendConfig::default();
            let result = validate_asset("/my file.html", 100, &config);
            assert!(result.is_err());
            assert!(result.unwrap_err().contains("Invalid character"));
        }

        #[test]
        fn rejects_question_mark() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/file.html?v=1", 100, &config).is_err());
        }

        #[test]
        fn rejects_hash() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/file.html#section", 100, &config).is_err());
        }

        #[test]
        fn rejects_backslash() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/assets\\file.html", 100, &config).is_err());
        }

        #[test]
        fn rejects_percent() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/file%20name.html", 100, &config).is_err());
        }

        #[test]
        fn allows_nested_paths() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/assets/images/logo.png", 100, &config).is_ok());
            assert!(validate_asset("/deep/nested/path/file.js", 100, &config).is_ok());
        }

        #[test]
        fn allows_hyphens_and_underscores() {
            let config = FrontendConfig::default();
            assert!(validate_asset("/my-app_v2.js", 100, &config).is_ok());
        }
    }

    mod gzip_compression {
        use super::*;

        #[test]
        fn compress_and_decompress_roundtrip() {
            let original = b"Hello, World! This is a test of gzip compression for IC canisters.";
            let compressed = gzip_compress(original).expect("compression failed");

            // Verify gzip magic bytes
            assert!(compressed.len() >= 2);
            assert_eq!(compressed[0], 0x1f);
            assert_eq!(compressed[1], 0x8b);

            // Verify roundtrip
            use flate2::read::GzDecoder;
            use std::io::Read;
            let mut decoder = GzDecoder::new(&compressed[..]);
            let mut decompressed = Vec::new();
            decoder
                .read_to_end(&mut decompressed)
                .expect("decompression failed");
            assert_eq!(decompressed, original);
        }

        #[test]
        fn compressed_is_smaller_for_repetitive_data() {
            let original = "a]".repeat(1000);
            let compressed = gzip_compress(original.as_bytes()).expect("compression failed");
            assert!(compressed.len() < original.len());
        }

        #[test]
        fn text_types_are_compressible() {
            assert!(is_compressible("/index.html"));
            assert!(is_compressible("/app.js"));
            assert!(is_compressible("/app.mjs"));
            assert!(is_compressible("/style.css"));
            assert!(is_compressible("/data.json"));
            assert!(is_compressible("/icon.svg"));
            assert!(is_compressible("/data.xml"));
            assert!(is_compressible("/readme.txt"));
            assert!(is_compressible("/bundle.js.map"));
        }

        #[test]
        fn binary_types_are_not_compressible() {
            assert!(!is_compressible("/image.png"));
            assert!(!is_compressible("/photo.jpg"));
            assert!(!is_compressible("/photo.jpeg"));
            assert!(!is_compressible("/animation.gif"));
            assert!(!is_compressible("/image.webp"));
            assert!(!is_compressible("/favicon.ico"));
            assert!(!is_compressible("/font.woff"));
            assert!(!is_compressible("/font.woff2"));
            assert!(!is_compressible("/font.ttf"));
            assert!(!is_compressible("/module.wasm"));
        }

        #[test]
        fn compressible_config_has_two_encodings() {
            let config = create_asset_config("/app.js", true);
            match config {
                AssetConfig::File { encodings, .. } => {
                    assert_eq!(encodings.len(), 2);
                    assert!(matches!(encodings[0].0, AssetEncoding::Identity));
                    assert!(matches!(encodings[1].0, AssetEncoding::Gzip));
                    assert_eq!(encodings[1].1, ".gz");
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }

        #[test]
        fn non_compressible_config_has_one_encoding() {
            let config = create_asset_config("/image.png", false);
            match config {
                AssetConfig::File { encodings, .. } => {
                    assert_eq!(encodings.len(), 1);
                    assert!(matches!(encodings[0].0, AssetEncoding::Identity));
                }
                _ => panic!("Expected AssetConfig::File"),
            }
        }
    }
}
