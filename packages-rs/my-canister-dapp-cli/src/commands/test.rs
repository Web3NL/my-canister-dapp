use anyhow::{Context, Result, bail};
use std::fs;
use std::path::Path;
use std::process;

use crate::icp::IcpCli;

/// Arguments for the `dapp test` command.
#[derive(clap::Args)]
pub struct TestArgs {
    /// Canister name (builds via icp.yaml) or path to a .wasm/.wasm.gz file
    pub target: String,

    /// Environment: "local" or "ic" (used for icp build)
    #[arg(short = 'e', long, default_value = "local")]
    pub environment: String,

    /// icp-cli identity to use
    #[arg(long)]
    pub identity: Option<String>,
}

/// Run the canister-dapp-test acceptance suite.
///
/// If `target` is a file path, reads the wasm directly.
/// Otherwise treats it as a canister name, builds via `icp build`, and reads
/// the artifact from `.icp/cache/artifacts/<name>`.
pub fn test(args: TestArgs) -> Result<()> {
    let (wasm_bytes, label) = resolve_wasm(&args)?;

    println!("Running acceptance suite on: {label}");

    // run_acceptance_suite panics on test failure, so catch it
    let result = std::panic::catch_unwind(move || {
        canister_dapp_test::run_acceptance_suite(&wasm_bytes, &label)
    });

    match result {
        Ok(()) => {
            println!("\nAll tests passed.");
            Ok(())
        }
        Err(_) => {
            eprintln!("\nAcceptance tests failed.");
            process::exit(1);
        }
    }
}

/// Resolve the wasm bytes and a display label from the target argument.
fn resolve_wasm(args: &TestArgs) -> Result<(Vec<u8>, String)> {
    let target = &args.target;

    // If target looks like a file path (exists on disk), read it directly
    if Path::new(target).exists() {
        let bytes =
            fs::read(target).with_context(|| format!("Failed to read wasm file: {target}"))?;
        return Ok((bytes, target.clone()));
    }

    // Otherwise treat as canister name — build via icp-cli
    let icp = IcpCli {
        environment: args.environment.clone(),
        identity: args.identity.clone(),
    };

    println!("Building '{target}'...");
    icp.build(target)?;
    println!("Build complete.");

    let artifact = format!(".icp/cache/artifacts/{target}");
    if !Path::new(&artifact).exists() {
        bail!(
            "Build artifact not found at: {artifact}\n\
             Ensure '{target}' is defined in icp.yaml."
        );
    }

    let bytes = fs::read(&artifact)
        .with_context(|| format!("Failed to read build artifact: {artifact}"))?;
    Ok((bytes, target.clone()))
}
