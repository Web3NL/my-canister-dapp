use anyhow::{Result, bail};
use std::path::Path;

use crate::auth;
use crate::icp::IcpCli;

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
    /// Canister name (must match a canister defined in icp.yaml for build/install).
    /// If omitted with --wasm, the name is derived from the wasm filename.
    pub canister: Option<String>,

    /// Path to a pre-built .wasm or .wasm.gz file (skips build step)
    #[arg(long)]
    pub wasm: Option<String>,

    /// Environment: "local" or "ic"
    #[arg(short = 'e', long, default_value = "local")]
    pub environment: String,

    /// icp-cli identity to use (defaults to the currently selected identity)
    #[arg(long)]
    pub identity: Option<String>,

    /// Cycles for canister creation
    #[arg(long, default_value = "1000000000000")]
    pub cycles: String,

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

    // Step 2: Resolve canister name and wasm strategy
    let (canister_name, wasm_path) = resolve_canister_and_wasm(&args)?;

    // Step 3: Build (only when no --wasm)
    if let Some(ref path) = wasm_path {
        println!("\nWasm: {path}");
    } else {
        println!("\nBuilding '{canister_name}'...");
        icp.build(&canister_name)?;
        println!("Build complete.");
    }

    // Step 4: Create canister
    println!("\nCreating canister '{canister_name}'...");
    icp.canister_create(&canister_name, &args.cycles)?;

    let canister_id = icp.canister_id(&canister_name)?;
    println!("Canister ID: {canister_id}");

    // Step 5: Install wasm
    println!("Installing wasm...");
    icp.canister_install(&canister_name, wasm_path.as_deref())?;
    println!("Wasm installed.");

    // Step 6: II authentication
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

    // 6a. Start auth server and get the port
    println!("Starting authentication server...");
    let auth_result = auth::run_auth_flow(&ii_provider, &canister_origin, &icp, &canister_name)?;
    let principal = &auth_result.principal;
    println!("Derived II principal: {principal}");

    // 6b. Set II principal in canister (deployer is still controller)
    println!("Setting II principal...");
    let set_principal_arg = format!("(variant {{ Set = principal \"{principal}\" }})");
    icp.canister_call(&canister_name, "manage_ii_principal", &set_principal_arg)?;

    // 6c. Remove CLI origin from alternative origins (deployer is still controller)
    println!("Cleaning up alternative origins...");
    let remove_origin_arg = format!("(variant {{ Remove = \"{}\" }})", auth_result.cli_origin);
    icp.canister_call(
        &canister_name,
        "manage_alternative_origins",
        &remove_origin_arg,
    )?;

    // 6d. Update controllers (deployer relinquishes control — must be LAST)
    println!("Setting controllers...");
    icp.canister_update_settings(&canister_name, &[&canister_id, principal])?;

    print_summary(&canister_id, is_mainnet, Some(principal));

    Ok(())
}

/// Resolve the canister name and optional wasm path from CLI arguments.
fn resolve_canister_and_wasm(args: &DeployArgs) -> Result<(String, Option<String>)> {
    match (&args.canister, &args.wasm) {
        (Some(name), Some(wasm)) => {
            if !Path::new(wasm).exists() {
                bail!("Wasm file not found: {wasm}");
            }
            Ok((name.clone(), Some(wasm.clone())))
        }
        (Some(name), None) => Ok((name.clone(), None)),
        (None, Some(wasm)) => {
            if !Path::new(wasm).exists() {
                bail!("Wasm file not found: {wasm}");
            }
            let name = derive_canister_name(wasm);
            Ok((name, Some(wasm.clone())))
        }
        (None, None) => bail!(
            "Canister name is required.\n\
             Usage: dapp deploy <CANISTER> [-e <env>]\n\
             Or:    dapp deploy --wasm <path>"
        ),
    }
}

/// Derive a canister name from a wasm filename.
fn derive_canister_name(wasm_path: &str) -> String {
    Path::new(wasm_path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("my-dapp")
        .trim_end_matches(".wasm")
        .to_string()
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

    // -- derive_canister_name tests --

    #[test]
    fn derive_name_from_wasm_gz() {
        assert_eq!(derive_canister_name("target/my-dapp.wasm.gz"), "my-dapp");
    }

    #[test]
    fn derive_name_from_wasm() {
        assert_eq!(derive_canister_name("my-dapp.wasm"), "my-dapp");
    }

    #[test]
    fn derive_name_from_path_with_directories() {
        assert_eq!(derive_canister_name("/tmp/build/my-app.wasm.gz"), "my-app");
    }

    #[test]
    fn derive_name_fallback() {
        assert_eq!(derive_canister_name(""), "my-dapp");
    }

    // -- resolve_canister_and_wasm tests --

    fn make_args(canister: Option<&str>, wasm: Option<&str>) -> DeployArgs {
        DeployArgs {
            canister: canister.map(String::from),
            wasm: wasm.map(String::from),
            environment: "local".into(),
            identity: None,
            cycles: "1000000000000".into(),
            skip_auth: false,
            ii_provider: None,
        }
    }

    #[test]
    fn resolve_explicit_canister_no_wasm() {
        let args = make_args(Some("my-dapp"), None);
        let (name, wasm) = resolve_canister_and_wasm(&args).unwrap();
        assert_eq!(name, "my-dapp");
        assert!(wasm.is_none());
    }

    #[test]
    fn resolve_neither_provided_errors() {
        let args = make_args(None, None);
        let err = resolve_canister_and_wasm(&args).unwrap_err().to_string();
        assert!(err.contains("Canister name is required"));
    }

    #[test]
    fn resolve_wasm_not_found_errors() {
        let args = make_args(Some("my-dapp"), Some("/nonexistent/path.wasm.gz"));
        let err = resolve_canister_and_wasm(&args).unwrap_err().to_string();
        assert!(err.contains("Wasm file not found"));
    }

    #[test]
    fn resolve_wasm_only_derives_name() {
        // Use a file that exists on all systems
        let args = make_args(None, Some("/dev/null"));
        let (name, wasm) = resolve_canister_and_wasm(&args).unwrap();
        assert_eq!(name, "null");
        assert_eq!(wasm.unwrap(), "/dev/null");
    }

    #[test]
    fn resolve_both_canister_and_wasm() {
        let args = make_args(Some("custom-name"), Some("/dev/null"));
        let (name, wasm) = resolve_canister_and_wasm(&args).unwrap();
        assert_eq!(name, "custom-name");
        assert_eq!(wasm.unwrap(), "/dev/null");
    }
}
