use anyhow::{Context, Result, bail};
use flate2::Compression;
use flate2::write::GzEncoder;
use serde::Serialize;
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;
use tempfile::NamedTempFile;

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
    /// Canister name (must match a canister defined in icp.yaml).
    /// Cannot be combined with --wasm.
    #[arg(conflicts_with = "wasm")]
    pub canister: Option<String>,

    /// Path to a pre-built .wasm or .wasm.gz file (skips build step, no icp.yaml needed)
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
    if wasm_path.is_none() {
        // Verify icp.yaml exists before attempting build
        if !Path::new("icp.yaml").exists() {
            bail!(
                "No icp.yaml found in the current directory.\n\
                 \n\
                 `dapp deploy <CANISTER>` requires an icp.yaml that defines the canister.\n\
                 To deploy a pre-built wasm without icp.yaml, use:\n\
                 \x20 dapp deploy --wasm <PATH>"
            );
        }
        println!("\nBuilding '{canister_name}'...");
        icp.build(&canister_name).with_context(|| {
            format!(
                "Failed to build canister '{canister_name}'.\n\
                 Make sure '{canister_name}' is defined in icp.yaml."
            )
        })?;
        println!("Build complete.");
    }

    // Step 4: Resolve wasm bytes and gzip if needed
    let wasm_bytes = resolve_wasm_bytes(&canister_name, wasm_path.as_deref())?;
    let gzipped_wasm = ensure_gzipped(&wasm_bytes)?;
    let gzipped_path = gzipped_wasm.path().to_str().unwrap();

    // Step 5: Create fresh canister (detached — new ID every time)
    println!("\nCreating canister...");
    let canister_id = icp.canister_create_detached(&args.cycles)?;
    println!("Canister ID: {canister_id}");

    // Step 6: Install wasm
    println!("Installing wasm...");
    icp.canister_install(&canister_id, Some(gzipped_path))?;
    println!("Wasm installed.");

    // Step 7: II authentication
    if args.skip_auth {
        println!("\nSkipping II authentication (--skip-auth).");
        print_summary(&canister_id, is_mainnet, &args.environment, None);
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
    let auth_result = auth::run_auth_flow(&ii_provider, &canister_origin, &icp, &canister_id)
        .context(
            "Failed to authenticate with Internet Identity.\n\
             Make sure the II provider is reachable and you complete the auth flow in the browser.\n\
             To skip authentication, use: dapp deploy <CANISTER> --skip-auth"
        )?;
    let principal = &auth_result.principal;
    println!("Derived II principal: {principal}");

    // 6b. Set II principal in canister (deployer is still controller)
    println!("Setting II principal...");
    let set_principal_arg = format!("(variant {{ Set = principal \"{principal}\" }})");
    icp.canister_call(&canister_id, "manage_ii_principal", &set_principal_arg)?;

    // 6c. Remove CLI origin from alternative origins (deployer is still controller)
    println!("Cleaning up alternative origins...");
    let remove_origin_arg = format!("(variant {{ Remove = \"{}\" }})", auth_result.cli_origin);
    icp.canister_call(
        &canister_id,
        "manage_alternative_origins",
        &remove_origin_arg,
    )?;

    // 6d. Update controllers (deployer relinquishes control — must be LAST)
    println!("Setting controllers...");
    icp.canister_update_settings(&canister_id, &[&canister_id, principal])?;

    print_summary(&canister_id, is_mainnet, &args.environment, Some(principal));

    Ok(())
}

/// Resolve the canister name and optional wasm path from CLI arguments.
///
/// Two mutually exclusive modes:
/// - `dapp deploy <name>` — builds from icp.yaml, reads artifact from cache
/// - `dapp deploy --wasm <path>` — uses pre-built wasm, derives name from filename
fn resolve_canister_and_wasm(args: &DeployArgs) -> Result<(String, Option<String>)> {
    match (&args.canister, &args.wasm) {
        (Some(name), None) => Ok((name.clone(), None)),
        (None, Some(wasm)) => {
            if !Path::new(wasm).exists() {
                bail!(
                    "Wasm file not found: {wasm}\n\
                     Check that the path is correct and the file exists."
                );
            }
            let name = derive_canister_name(wasm);
            Ok((name, Some(wasm.clone())))
        }
        // clap's conflicts_with handles (Some, Some) — this arm is unreachable
        (Some(_), Some(_)) => unreachable!("clap prevents --wasm with positional canister name"),
        (None, None) => bail!(
            "Missing canister name or --wasm flag.\n\
             \n\
             Usage:\n\
             \x20 dapp deploy <CANISTER>       Build and deploy a canister defined in icp.yaml\n\
             \x20 dapp deploy --wasm <PATH>    Deploy a pre-built .wasm or .wasm.gz file"
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

/// Artifact directory where `icp build` places compiled wasms.
const ARTIFACT_DIR: &str = ".icp/cache/artifacts";

/// Read wasm bytes from the build artifact or a user-provided path.
fn resolve_wasm_bytes(canister_name: &str, wasm_path: Option<&str>) -> Result<Vec<u8>> {
    match wasm_path {
        Some(p) => std::fs::read(p).with_context(|| {
            format!(
                "Wasm file not found: {p}\n\
                 Check that the path is correct and the file exists."
            )
        }),
        None => {
            let path = format!("{ARTIFACT_DIR}/{canister_name}");
            std::fs::read(&path).with_context(|| {
                format!(
                    "Build artifact not found: {path}\n\
                     `icp build` completed but no wasm was produced for '{canister_name}'.\n\
                     Check that '{canister_name}' is correctly configured in icp.yaml."
                )
            })
        }
    }
}

/// Check if bytes are gzip-compressed (magic bytes 0x1f 0x8b).
fn is_gzipped(bytes: &[u8]) -> bool {
    bytes.len() >= 2 && bytes[0] == 0x1f && bytes[1] == 0x8b
}

/// Ensure wasm bytes are gzipped, writing to a temp file for icp-cli to consume.
fn ensure_gzipped(bytes: &[u8]) -> Result<NamedTempFile> {
    let mut tmp = NamedTempFile::new().context("Failed to create temp file")?;
    if is_gzipped(bytes) {
        tmp.write_all(bytes)?;
    } else {
        let mut encoder = GzEncoder::new(Vec::new(), Compression::best());
        encoder.write_all(bytes)?;
        tmp.write_all(&encoder.finish()?)?;
    }
    Ok(tmp)
}

/// Deployment log directory and file.
const DEPLOY_LOG_DIR: &str = ".dapp";
const DEPLOY_LOG_FILE: &str = ".dapp/deployments.jsonl";

#[derive(Serialize)]
struct DeploymentRecord {
    canister_id: String,
    frontend: String,
    dashboard: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    owner: Option<String>,
    environment: String,
    timestamp: String,
}

/// Append a deployment record to `.dapp/deployments.jsonl`.
fn log_deployment(record: &DeploymentRecord) {
    if let Err(e) = try_log_deployment(record) {
        eprintln!("Warning: failed to write deployment log: {e}");
    }
}

fn try_log_deployment(record: &DeploymentRecord) -> Result<()> {
    std::fs::create_dir_all(DEPLOY_LOG_DIR)?;
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(DEPLOY_LOG_FILE)?;
    let json = serde_json::to_string(record)?;
    writeln!(file, "{json}")?;
    Ok(())
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

fn print_summary(canister_id: &str, is_mainnet: bool, environment: &str, principal: Option<&str>) {
    let base = if is_mainnet {
        format!("https://{canister_id}.icp0.io")
    } else {
        format!("http://{canister_id}.localhost:8080")
    };

    let frontend = base.to_string();
    let dashboard = format!("{base}/canister-dashboard");

    println!("\n--- Deployment complete ---");
    println!("  Canister ID: {canister_id}");
    println!("  Frontend:    {frontend}");
    println!("  Dashboard:   {dashboard}");
    if let Some(p) = principal {
        println!("  Owner:       {p}");
    }

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs().to_string())
        .unwrap_or_default();

    log_deployment(&DeploymentRecord {
        canister_id: canister_id.to_string(),
        frontend,
        dashboard,
        owner: principal.map(String::from),
        environment: environment.to_string(),
        timestamp: now,
    });
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
        assert!(err.contains("Missing canister name or --wasm flag"));
    }

    #[test]
    fn resolve_wasm_not_found_errors() {
        let args = make_args(None, Some("/nonexistent/path.wasm.gz"));
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

    // -- gzip helper tests --

    #[test]
    fn is_gzipped_detects_gzip_magic() {
        assert!(is_gzipped(&[0x1f, 0x8b, 0x08, 0x00]));
    }

    #[test]
    fn is_gzipped_rejects_raw_wasm() {
        // Wasm magic: \0asm
        assert!(!is_gzipped(&[0x00, 0x61, 0x73, 0x6d]));
    }

    #[test]
    fn is_gzipped_rejects_empty() {
        assert!(!is_gzipped(&[]));
    }

    #[test]
    fn ensure_gzipped_compresses_raw_bytes() {
        let raw = b"hello wasm";
        let tmp = ensure_gzipped(raw).unwrap();
        let result = std::fs::read(tmp.path()).unwrap();
        assert!(is_gzipped(&result));
    }

    #[test]
    fn ensure_gzipped_passes_through_gzipped() {
        use flate2::write::GzEncoder;
        let mut encoder = GzEncoder::new(Vec::new(), Compression::fast());
        encoder.write_all(b"already compressed").unwrap();
        let compressed = encoder.finish().unwrap();

        let tmp = ensure_gzipped(&compressed).unwrap();
        let result = std::fs::read(tmp.path()).unwrap();
        assert_eq!(result, compressed);
    }
}
