mod auth;
mod commands;
mod icp;

use clap::{Parser, Subcommand};

/// CLI for deploying and testing user-owned dapps on the Internet Computer.
#[derive(Parser)]
#[command(name = "dapp", version, about)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Deploy a canister dapp locally (requires a running local network)
    Deploy(commands::DeployArgs),
    /// Run acceptance tests on a wasm
    Test(commands::TestArgs),
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Command::Deploy(args) => commands::deploy(args),
        Command::Test(args) => commands::test(args),
    }
}
