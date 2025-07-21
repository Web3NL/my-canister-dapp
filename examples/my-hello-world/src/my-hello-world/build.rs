use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    let dfx_network = env::var("DFX_NETWORK").unwrap_or_else(|_| "ic".to_string());

    println!("cargo:rerun-if-changed=../my-hello-world-frontend/src");
    println!("cargo:rerun-if-changed=../my-hello-world-frontend/package.json");
    println!("cargo:rerun-if-changed=../my-hello-world-frontend/vite.config.ts");
    println!("cargo:rerun-if-env-changed=DFX_NETWORK");

    let frontend_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../my-hello-world-frontend");

    if !frontend_dir.exists() {
        panic!("Frontend directory not found: {}", frontend_dir.display());
    }

    let npm_command = match dfx_network.as_str() {
        "local" => "build:dev",
        "ic" => "build",
        _ => "build", // default to prod build for other networks
    };

    println!("Building my-hello-world frontend assets for {dfx_network} network...");

    let output = Command::new("npm")
        .args(["run", npm_command])
        .current_dir(&frontend_dir)
        .output()
        .expect("Failed to execute npm command");

    if !output.status.success() {
        panic!(
            "Frontend build failed:\nstdout: {}\nstderr: {}",
            String::from_utf8_lossy(&output.stdout),
            String::from_utf8_lossy(&output.stderr)
        );
    }

    let dist_dir = frontend_dir.join("dist");
    if !dist_dir.exists() {
        panic!(
            "Frontend dist directory not found after build: {}",
            dist_dir.display()
        );
    }

    println!(
        "Frontend assets built successfully at: {}",
        dist_dir.display()
    );
}
