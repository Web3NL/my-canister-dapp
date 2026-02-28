use clap::Parser;
use std::fs;
use std::process;

/// Acceptance suite for user-owned dapps built with my-canister-dashboard.
///
/// Validates that a WASM module correctly implements every endpoint
/// defined in `my-canister-dashboard.did`.
#[derive(Parser)]
#[command(name = "canister-dapp-test", version)]
struct Cli {
    /// Path to the .wasm.gz file to test
    wasm_path: String,
}

fn main() {
    let cli = Cli::parse();
    let wasm_bytes = fs::read(&cli.wasm_path).unwrap_or_else(|e| {
        eprintln!("Failed to read {}: {e}", cli.wasm_path);
        process::exit(1);
    });
    canister_dapp_test::run_acceptance_suite(&wasm_bytes, &cli.wasm_path);
}
