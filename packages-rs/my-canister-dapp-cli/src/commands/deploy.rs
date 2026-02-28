use anyhow::{Context, Result, bail};
use std::path::Path;
use std::process::Command;

use crate::auth;
use crate::icp::{IcpCli, check_tool};

/// Default II provider for local development (PocketIC with NNS).
const LOCAL_II_PROVIDER: &str = "http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8080";

/// Default II provider for mainnet.
const MAINNET_II_PROVIDER: &str = "https://identity.internetcomputer.org";

/// Default local network host.
const LOCAL_HOST: &str = "http://localhost:8080";

/// Default mainnet host.
const MAINNET_HOST: &str = "https://icp0.io";

/// Arguments for the `dapp deploy` command.
#[derive(clap::Args)]
pub struct DeployArgs {
    /// Path to a pre-built .wasm.gz file (skips build step)
    #[arg(long)]
    pub wasm: Option<String>,

    /// Cargo package name to build (required if --wasm is not provided
    /// and the workspace has multiple cdylib targets)
    #[arg(long, short)]
    pub package: Option<String>,

    /// Environment: "local" or "ic"
    #[arg(short = 'e', long, default_value = "local")]
    pub environment: String,

    /// icp-cli identity to use (defaults to the currently selected identity)
    #[arg(long)]
    pub identity: Option<String>,

    /// Cycles for canister creation
    #[arg(long, default_value = "1000000000000")]
    pub cycles: String,

    /// Canister name for icp-cli tracking
    #[arg(long)]
    pub canister_name: Option<String>,

    /// Skip Internet Identity authentication (deploy only, no owner setup)
    #[arg(long)]
    pub skip_auth: bool,

    /// Internet Identity provider URL (auto-detected from environment)
    #[arg(long)]
    pub ii_provider: Option<String>,
}

/// Deploy a canister dapp to the Internet Computer.
pub fn deploy(args: DeployArgs) -> Result<()> {
    // Step 1: Check prerequisites
    let icp_version = IcpCli::check_installed()?;
    println!("Using icp-cli: {icp_version}");

    let is_mainnet = args.environment == "ic";

    let icp = IcpCli {
        environment: args.environment.clone(),
        identity: args.identity.clone(),
    };

    // Step 2: Resolve the wasm file
    let wasm_path = match &args.wasm {
        Some(path) => {
            // Using pre-built wasm
            if !Path::new(path).exists() {
                bail!("Wasm file not found: {path}");
            }
            path.clone()
        }
        None => {
            // Build the wasm
            build_wasm(args.package.as_deref())?
        }
    };

    println!("Wasm: {wasm_path}");

    // Derive the canister name from the wasm filename or --canister-name
    let canister_name = args.canister_name.unwrap_or_else(|| {
        Path::new(&wasm_path)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("my-dapp")
            .trim_end_matches(".wasm")
            .to_string()
    });

    // Step 3: Create canister
    println!("\nCreating canister '{canister_name}'...");
    icp.canister_create(&canister_name, &args.cycles)?;

    let canister_id = icp.canister_id(&canister_name)?;
    println!("Canister ID: {canister_id}");

    // Step 4: Install wasm
    println!("Installing wasm...");
    icp.canister_install(&canister_name, &wasm_path)?;
    println!("Wasm installed.");

    // Step 5: II authentication
    if args.skip_auth {
        println!("\nSkipping II authentication (--skip-auth).");
        print_summary(&canister_id, is_mainnet, None);
        return Ok(());
    }

    let host = if is_mainnet { MAINNET_HOST } else { LOCAL_HOST };
    let ii_provider = args.ii_provider.unwrap_or_else(|| {
        if is_mainnet {
            MAINNET_II_PROVIDER
        } else {
            LOCAL_II_PROVIDER
        }
        .to_string()
    });

    let canister_origin = create_canister_origin(&canister_id, host);
    println!("\nCanister origin: {canister_origin}");

    // 5a. Start auth server and get the port
    println!("Starting authentication server...");
    let auth_result = auth::run_auth_flow(&ii_provider, &canister_origin, &icp, &canister_name)?;
    let principal = &auth_result.principal;
    println!("Derived II principal: {principal}");

    // 5b. Set II principal in canister (deployer is still controller)
    println!("Setting II principal...");
    let set_principal_arg = format!("(variant {{ Set = principal \"{principal}\" }})");
    icp.canister_call(&canister_name, "manage_ii_principal", &set_principal_arg)?;

    // 5c. Remove CLI origin from alternative origins (deployer is still controller)
    println!("Cleaning up alternative origins...");
    let remove_origin_arg = format!("(variant {{ Remove = \"{}\" }})", auth_result.cli_origin);
    icp.canister_call(
        &canister_name,
        "manage_alternative_origins",
        &remove_origin_arg,
    )?;

    // 5d. Update controllers (deployer relinquishes control — must be LAST)
    println!("Setting controllers...");
    icp.canister_update_settings(&canister_name, &[&canister_id, principal])?;

    print_summary(&canister_id, is_mainnet, Some(principal));

    Ok(())
}

/// Build a wasm from source using cargo + ic-wasm + gzip.
fn build_wasm(package: Option<&str>) -> Result<String> {
    check_tool("cargo", "Install Rust from: https://rustup.rs")?;
    check_tool("ic-wasm", "Install with: cargo install ic-wasm")?;

    let package_name = match package {
        Some(name) => name.to_string(),
        None => detect_cdylib_package()?,
    };

    println!("Building {package_name}...");

    // cargo build --target wasm32-unknown-unknown --release -p <name>
    let status = Command::new("cargo")
        .args([
            "build",
            "--target",
            "wasm32-unknown-unknown",
            "--release",
            "-p",
            &package_name,
        ])
        .status()
        .context("Failed to run cargo build")?;

    if !status.success() {
        bail!("cargo build failed");
    }

    // The cargo output uses underscores in filenames
    let wasm_filename = package_name.replace('-', "_");
    let raw_wasm = format!("target/wasm32-unknown-unknown/release/{wasm_filename}.wasm");

    if !Path::new(&raw_wasm).exists() {
        bail!(
            "Expected wasm output not found at: {raw_wasm}\n\
             The crate may not produce a cdylib target."
        );
    }

    // ic-wasm shrink
    let shrunk_wasm = format!("target/{package_name}.wasm");
    println!("Shrinking wasm...");
    let status = Command::new("ic-wasm")
        .args([&raw_wasm, "-o", &shrunk_wasm, "shrink"])
        .status()
        .context("Failed to run ic-wasm shrink")?;

    if !status.success() {
        bail!("ic-wasm shrink failed");
    }

    // gzip
    let gzipped_wasm = format!("target/{package_name}.wasm.gz");
    println!("Compressing wasm...");
    let status = Command::new("gzip")
        .args(["-9", "-f", "-k", &shrunk_wasm])
        .status()
        .context("Failed to run gzip")?;

    if !status.success() {
        bail!("gzip failed");
    }

    // gzip -k produces <name>.wasm.gz alongside the input
    let gz_output = format!("{shrunk_wasm}.gz");
    if gz_output != gzipped_wasm {
        std::fs::rename(&gz_output, &gzipped_wasm)
            .with_context(|| format!("Failed to rename {gz_output} to {gzipped_wasm}"))?;
    }

    println!("Built: {gzipped_wasm}");
    Ok(gzipped_wasm)
}

/// Attempt to detect a single cdylib package from the workspace/project Cargo.toml.
fn detect_cdylib_package() -> Result<String> {
    let cargo_toml = std::fs::read_to_string("Cargo.toml").context(
        "No Cargo.toml found in current directory.\n\
         Use --package <name> to specify the crate to build,\n\
         or --wasm <path> to provide a pre-built wasm.",
    )?;
    parse_cdylib_package(&cargo_toml)
}

/// Parse a cdylib package name from Cargo.toml contents.
///
/// Simple heuristic: look for `crate-type = ["cdylib"]` and extract the `[package]` name.
fn parse_cdylib_package(cargo_toml: &str) -> Result<String> {
    if cargo_toml.contains("cdylib") {
        for line in cargo_toml.lines() {
            let trimmed = line.trim();
            if trimmed.starts_with("name")
                && trimmed.contains('=')
                && let Some(name) = trimmed.split('=').nth(1)
            {
                let name = name.trim().trim_matches('"');
                return Ok(name.to_string());
            }
        }
    }

    bail!(
        "Could not detect a cdylib package from Cargo.toml.\n\
         Use --package <name> to specify the crate to build,\n\
         or --wasm <path> to provide a pre-built wasm."
    )
}

/// Construct the canister origin URL from its ID and host.
///
/// Local:   `http://localhost:8080` → `http://<id>.localhost:8080`
/// Mainnet: `https://icp0.io` → `https://<id>.icp0.io`
fn create_canister_origin(canister_id: &str, host: &str) -> String {
    if host.contains("localhost") {
        host.replacen("localhost", &format!("{canister_id}.localhost"), 1)
    } else {
        let scheme_end = host.find("://").map(|i| i + 3).unwrap_or(0);
        format!(
            "{}{canister_id}.{}",
            &host[..scheme_end],
            &host[scheme_end..]
        )
    }
}

fn print_summary(canister_id: &str, is_mainnet: bool, principal: Option<&str>) {
    let base = if is_mainnet {
        format!("https://{canister_id}.icp0.io")
    } else {
        format!("http://{canister_id}.localhost:8080")
    };

    println!("\n--- Deployment complete ---");
    println!("  Canister ID: {canister_id}");
    println!("  Frontend:    {base}");
    println!("  Dashboard:   {base}/canister-dashboard");
    if let Some(p) = principal {
        println!("  Owner:       {p}");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // -- create_canister_origin tests --

    #[test]
    fn origin_local_default_port() {
        let origin = create_canister_origin("abc123", "http://localhost:8080");
        assert_eq!(origin, "http://abc123.localhost:8080");
    }

    #[test]
    fn origin_mainnet_icp0() {
        let origin = create_canister_origin("abc123", "https://icp0.io");
        assert_eq!(origin, "https://abc123.icp0.io");
    }

    #[test]
    fn origin_local_custom_port() {
        let origin = create_canister_origin("abc123", "http://localhost:4943");
        assert_eq!(origin, "http://abc123.localhost:4943");
    }

    #[test]
    fn origin_mainnet_ic0_app() {
        let origin = create_canister_origin("abc123", "https://ic0.app");
        assert_eq!(origin, "https://abc123.ic0.app");
    }

    #[test]
    fn origin_real_canister_id() {
        let id = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
        let origin = create_canister_origin(id, "http://localhost:8080");
        assert_eq!(origin, "http://bkyz2-fmaaa-aaaaa-qaaaq-cai.localhost:8080");
    }

    #[test]
    fn origin_real_canister_id_mainnet() {
        let id = "bkyz2-fmaaa-aaaaa-qaaaq-cai";
        let origin = create_canister_origin(id, "https://icp0.io");
        assert_eq!(origin, "https://bkyz2-fmaaa-aaaaa-qaaaq-cai.icp0.io");
    }

    // -- parse_cdylib_package tests --

    #[test]
    fn parse_cdylib_valid() {
        let toml = r#"
[package]
name = "my-backend"
version = "0.1.0"

[lib]
crate-type = ["cdylib"]
"#;
        assert_eq!(parse_cdylib_package(toml).unwrap(), "my-backend");
    }

    #[test]
    fn parse_cdylib_no_cdylib() {
        let toml = r#"
[package]
name = "my-lib"
version = "0.1.0"

[lib]
crate-type = ["rlib"]
"#;
        assert!(parse_cdylib_package(toml).is_err());
    }

    #[test]
    fn parse_cdylib_empty() {
        assert!(parse_cdylib_package("").is_err());
    }

    #[test]
    fn parse_cdylib_name_with_spaces() {
        let toml = r#"
[package]
name   =   "spaced-name"

[lib]
crate-type = ["cdylib"]
"#;
        assert_eq!(parse_cdylib_package(toml).unwrap(), "spaced-name");
    }

    #[test]
    fn parse_cdylib_name_before_crate_type() {
        // name appears before the cdylib declaration — should still work
        let toml = r#"
[package]
name = "early-name"
version = "0.1.0"
edition = "2024"

[lib]
crate-type = ["cdylib"]
"#;
        assert_eq!(parse_cdylib_package(toml).unwrap(), "early-name");
    }

    #[test]
    fn parse_cdylib_has_cdylib_word_but_no_name() {
        // Contains "cdylib" but no valid name line
        let toml = r#"
[lib]
crate-type = ["cdylib"]
"#;
        assert!(parse_cdylib_package(toml).is_err());
    }
}
