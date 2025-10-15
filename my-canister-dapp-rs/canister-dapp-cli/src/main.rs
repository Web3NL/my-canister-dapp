use anyhow::{Context, Result};
use colored::Colorize;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::thread;
use std::time::Duration;
use tokio::process::Command as TokioCommand;

/// Find the project root by looking for package.json and Cargo.toml files
fn find_project_root(start_dir: &Path) -> Option<PathBuf> {
    let mut current_dir = start_dir;

    loop {
        // Check if this directory contains both package.json and Cargo.toml (signs of the project root)
        let package_json = current_dir.join("package.json");
        let cargo_toml = current_dir.join("Cargo.toml");
        let dfx_json = current_dir.join("dfx.json");

        if package_json.exists() && cargo_toml.exists() && dfx_json.exists() {
            return Some(current_dir.to_path_buf());
        }

        // Move up one directory
        match current_dir.parent() {
            Some(parent) => current_dir = parent,
            None => break,
        }
    }

    None
}

#[tokio::main]
async fn main() -> Result<()> {
    println!("{}", "🚀 My Canister Dapp CLI".bright_green().bold());
    println!("{}", "Starting development server...".cyan());

    // Get the project root directory
    // First, try to find the project root by looking for key files
    let current_dir = std::env::current_dir().context("Failed to get current directory")?;
    let project_root = find_project_root(&current_dir)
        .context("Failed to find project root directory. Make sure you're running from within the my-canister-dapp project.")?;

    println!(
        "{} {}",
        "Project root:".bright_blue(),
        project_root.display()
    );

    // Change to project root directory
    std::env::set_current_dir(project_root)
        .context("Failed to change to project root directory")?;

    // Start the vite dev server
    println!("{}", "Starting Vite development server...".yellow());

    let child = TokioCommand::new("npm")
        .args(["run", "dev:app"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .context("Failed to start npm run dev:app")?;

    // Give the server a moment to start up
    println!("{}", "Waiting for server to start...".cyan());
    thread::sleep(Duration::from_secs(3));

    // Open browser to localhost:5174
    println!("{}", "Opening browser at http://localhost:5174...".green());

    match webbrowser::open("http://localhost:5174") {
        Ok(_) => println!("{}", "✅ Browser opened successfully!".bright_green()),
        Err(e) => {
            println!("{} {}", "⚠️  Failed to open browser:".yellow(), e);
            println!(
                "{}",
                "Please manually navigate to http://localhost:5174".cyan()
            );
        }
    }

    println!();
    println!(
        "{}",
        "🎉 Development server is running!".bright_green().bold()
    );
    println!("{}", "- Server: http://localhost:5174".bright_blue());
    println!("{}", "- Press Ctrl+C to stop the server".bright_yellow());
    println!();

    // Wait for the child process to complete
    let output = child
        .wait_with_output()
        .await
        .context("Failed to wait for npm process")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        println!("{} {}", "❌ Server failed:".red(), stderr);
        std::process::exit(1);
    }

    println!("{}", "✅ Server stopped.".green());
    Ok(())
}
