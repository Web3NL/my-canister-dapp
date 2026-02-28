/// The pre-built IIFE bundle for the II authentication page.
///
/// This file is generated from `auth-js/cli-auth.ts` via Vite and committed to the repo.
/// Rebuild with: `cd auth-js && npm run build`
const JS_BUNDLE: &str = include_str!("../../auth-js/cli-auth.iife.js");

/// Generate the HTML page for Internet Identity authentication.
///
/// The page shows a "Login with Internet Identity" button. When clicked, it opens
/// the II popup, authenticates with the given `derivation_origin`, and POSTs the
/// derived principal back to the CLI's callback URL.
pub fn generate_auth_page(
    ii_provider: &str,
    derivation_origin: &str,
    callback_url: &str,
) -> String {
    format!(
        r#"<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>dapp deploy - Internet Identity</title>
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
      color: #333;
    }}
    .container {{
      text-align: center;
      max-width: 480px;
      padding: 48px 32px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }}
    h1 {{ font-size: 1.5em; margin-bottom: 12px; }}
    p {{ color: #666; margin-bottom: 24px; line-height: 1.5; }}
    button {{
      font-size: 1.1em;
      padding: 12px 32px;
      cursor: pointer;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      transition: background 0.2s;
    }}
    button:hover {{ background: #2563eb; }}
    button:disabled {{ background: #9ca3af; cursor: default; }}
    #status {{
      margin-top: 20px;
      padding: 12px;
      font-size: 0.9em;
      color: #666;
      word-break: break-all;
    }}
    .success {{ color: #16a34a !important; font-weight: 600; }}
    .error {{ color: #dc2626 !important; }}
  </style>
</head>
<body>
  <div class="container">
    <h1>Connect Internet Identity</h1>
    <p>Authenticate with Internet Identity to claim ownership of your canister.</p>
    <div id="button-container"></div>
    <div id="status"></div>
  </div>
  <script>
    window.CLI_AUTH_CONFIG = {{
      identityProvider: "{ii_provider}",
      derivationOrigin: "{derivation_origin}",
      callbackUrl: "{callback_url}"
    }};
  </script>
  <script>{JS_BUNDLE}</script>
</body>
</html>"#
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample_page() -> String {
        generate_auth_page(
            "https://identity.internetcomputer.org",
            "https://abc123.icp0.io",
            "http://localhost:12345/callback",
        )
    }

    #[test]
    fn page_has_doctype() {
        assert!(sample_page().starts_with("<!DOCTYPE html>"));
    }

    #[test]
    fn page_has_utf8_charset() {
        assert!(sample_page().contains(r#"<meta charset="utf-8">"#));
    }

    #[test]
    fn page_has_title() {
        assert!(sample_page().contains("<title>dapp deploy - Internet Identity</title>"));
    }

    #[test]
    fn page_has_heading() {
        assert!(sample_page().contains("Connect Internet Identity"));
    }

    #[test]
    fn page_has_button_container() {
        assert!(sample_page().contains(r#"id="button-container"#));
    }

    #[test]
    fn page_has_status_div() {
        assert!(sample_page().contains(r#"id="status"#));
    }

    #[test]
    fn page_config_has_identity_provider() {
        assert!(
            sample_page().contains(r#"identityProvider: "https://identity.internetcomputer.org""#)
        );
    }

    #[test]
    fn page_config_has_derivation_origin() {
        assert!(sample_page().contains(r#"derivationOrigin: "https://abc123.icp0.io""#));
    }

    #[test]
    fn page_config_has_callback_url() {
        assert!(sample_page().contains(r#"callbackUrl: "http://localhost:12345/callback""#));
    }

    #[test]
    fn page_embeds_js_bundle() {
        let page = sample_page();
        // Count <script> tags — should be exactly 2 (config + bundle)
        let script_count = page.matches("<script>").count();
        assert_eq!(
            script_count, 2,
            "expected 2 <script> tags (config + bundle)"
        );
        // The bundle script should contain the AuthClient class from @icp-sdk/auth
        assert!(
            page.contains("AuthClient"),
            "JS bundle should contain AuthClient"
        );
    }

    #[test]
    fn page_has_success_and_error_css_classes() {
        let page = sample_page();
        assert!(page.contains(".success"));
        assert!(page.contains(".error"));
    }

    #[test]
    fn page_interpolates_different_values() {
        let page = generate_auth_page(
            "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080",
            "http://xyz.localhost:8080",
            "http://localhost:9999/callback",
        );
        assert!(
            page.contains(
                r#"identityProvider: "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080""#
            )
        );
        assert!(page.contains(r#"derivationOrigin: "http://xyz.localhost:8080""#));
        assert!(page.contains(r#"callbackUrl: "http://localhost:9999/callback""#));
    }
}
