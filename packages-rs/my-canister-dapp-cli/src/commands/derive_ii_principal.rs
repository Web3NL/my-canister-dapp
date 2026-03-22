use anyhow::{Context, Result, bail};
use std::{fs, process::Command};

const LOCAL_II_PROVIDER: &str = "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080";

/// The derive-ii-principal browser bundle, embedded at compile time.
///
/// Source: `packages-rs/my-canister-dapp-cli/playwright-js/derive-ii-principal.ts` → built by Vite.
/// To rebuild: `cd packages-rs/my-canister-dapp-cli/playwright-js && npx vite build`
const DERIVE_II_BUNDLE: &str = include_str!("../../playwright-js/derive-ii-principal.iife.js");

/// The Node.js Playwright script, embedded at compile time.
const DERIVE_PRINCIPAL_MJS: &str = include_str!("../../playwright-js/derive-principal.mjs");

/// Arguments for the `dapp derive-ii-principal` command.
#[derive(clap::Args)]
pub struct DeriveIiPrincipalArgs {
    /// Canister origin to derive the II principal for, e.g. http://<canister-id>.localhost:8080
    pub canister_origin: String,

    /// Internet Identity provider URL (default: local PocketIC II canister)
    #[arg(long)]
    pub ii_provider: Option<String>,
}

/// Non-interactively derive the II principal for a canister origin using Playwright.
///
/// Always creates a fresh II identity. Outputs the derived principal to stdout.
/// All diagnostic output goes to stderr.
///
/// Prerequisites:
/// - `node` in PATH
/// - `@playwright/test` installed in the project (`npm install @playwright/test`)
/// - Playwright Chromium installed (`npx playwright install chromium`)
/// - Local II canister running at the given `--ii-provider` URL
pub fn derive_ii_principal(args: DeriveIiPrincipalArgs) -> Result<()> {
    check_node_installed()?;

    let ii_provider = args
        .ii_provider
        .unwrap_or_else(|| LOCAL_II_PROVIDER.to_string());

    let project_root = std::env::current_dir().context("Failed to determine current directory")?;

    // Create temp dir inside the project root so Node.js ESM module resolution
    // walks up to project_root/node_modules and finds @playwright/test.
    let tmp = tempfile::Builder::new()
        .prefix(".dapp-tmp")
        .tempdir_in(&project_root)
        .context("Failed to create temp directory in project root")?;
    let bundle_path = tmp.path().join("bundle.js");
    let script_path = tmp.path().join("derive-principal.mjs");
    fs::write(&bundle_path, DERIVE_II_BUNDLE).context("Failed to write browser bundle")?;
    fs::write(&script_path, DERIVE_PRINCIPAL_MJS).context("Failed to write Playwright script")?;

    eprintln!("Deriving II principal for: {}", args.canister_origin);
    eprintln!("Identity provider:         {ii_provider}");

    let output = Command::new("node")
        .arg(&script_path)
        .env("DAPP_CANISTER_ORIGIN", &args.canister_origin)
        .env("DAPP_II_PROVIDER", &ii_provider)
        .env("DAPP_BUNDLE_PATH", &bundle_path)
        .current_dir(&project_root)
        .output()
        .context(
            "`node` not found.\n\
             Install Node.js from https://nodejs.org/ and ensure `node` is in PATH.",
        )?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        bail!(
            "Playwright script failed (exit {}):\n{stderr}\n\
             Make sure:\n\
             - @playwright/test is installed (`npm install @playwright/test`)\n\
             - Playwright browsers are installed (`npx playwright install chromium`)\n\
             - The local II canister is running at {ii_provider}",
            output.status,
            ii_provider = ii_provider,
        );
    }

    let principal = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if principal.is_empty() {
        bail!("Playwright script succeeded but printed no principal to stdout");
    }
    if principal.starts_with("ERROR:") {
        bail!("Principal derivation failed: {principal}");
    }

    // Print only the principal to stdout — callers can capture it directly
    print!("{principal}");
    Ok(())
}

fn check_node_installed() -> Result<()> {
    Command::new("node").arg("--version").output().context(
        "`node` is not installed or not in PATH.\n\
             Install Node.js from https://nodejs.org/",
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_ii_provider_is_local() {
        assert!(LOCAL_II_PROVIDER.contains("localhost"));
    }

    #[test]
    fn bundle_is_non_empty() {
        assert!(
            DERIVE_II_BUNDLE.len() > 1000,
            "IIFE bundle should be at least 1KB, got {} bytes",
            DERIVE_II_BUNDLE.len()
        );
    }
}
