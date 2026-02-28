use anyhow::{Context, Result};
use std::fs;
use std::process;

/// Arguments for the `dapp test` command.
#[derive(clap::Args)]
pub struct TestArgs {
    /// Path to the .wasm.gz file to test
    pub wasm_path: String,
}

/// Run the canister-dapp-test acceptance suite on a wasm file.
pub fn test(args: TestArgs) -> Result<()> {
    let wasm_bytes = fs::read(&args.wasm_path)
        .with_context(|| format!("Failed to read wasm file: {}", args.wasm_path))?;

    println!("Running acceptance suite on: {}", args.wasm_path);

    // run_acceptance_suite panics on test failure, so catch it
    let result = std::panic::catch_unwind(|| {
        canister_dapp_test::run_acceptance_suite(&wasm_bytes, &args.wasm_path)
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
