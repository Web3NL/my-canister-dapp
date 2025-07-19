use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    let build_mode = env::var("DAPP_BUILD_MODE").unwrap_or_else(|_| "prod".to_string());

    println!("cargo:rerun-if-changed=../../my-canister-dapp-js/canister-dashboard-frontend/src");
    println!(
        "cargo:rerun-if-changed=../../my-canister-dapp-js/canister-dashboard-frontend/package.json"
    );
    println!(
        "cargo:rerun-if-changed=../../my-canister-dapp-js/canister-dashboard-frontend/vite.config.ts"
    );
    println!("cargo:rerun-if-env-changed=DAPP_BUILD_MODE");

    let workspace_root = Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .unwrap()
        .parent()
        .unwrap();

    let frontend_dir = workspace_root.join("my-canister-dapp-js/canister-dashboard-frontend");
    let assets_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("assets");

    if !frontend_dir.exists() {
        panic!("Frontend directory not found: {}", frontend_dir.display());
    }

    std::fs::create_dir_all(&assets_dir).expect("Failed to create assets directory");

    let npm_command = match build_mode.as_str() {
        "dev" => "build:dev",
        "prod" => "build",
        _ => {
            eprintln!("Warning: Unknown build mode '{build_mode}', defaulting to 'prod'");
            "build"
        }
    };

    println!("Building frontend assets in {build_mode} mode...");

    let output = Command::new("npm")
        .args([
            "run",
            npm_command,
            "--workspace=canister-dashboard-frontend",
        ])
        .current_dir(workspace_root)
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

    copy_dir_all(&dist_dir, &assets_dir).expect("Failed to copy frontend assets");

    println!("Frontend assets copied to: {}", assets_dir.display());
}

fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    if src.is_dir() {
        for entry in std::fs::read_dir(src)? {
            let entry = entry?;
            let src_path = entry.path();
            let dst_path = dst.join(entry.file_name());

            if src_path.is_dir() {
                std::fs::create_dir_all(&dst_path)?;
                copy_dir_all(&src_path, &dst_path)?;
            } else {
                std::fs::copy(&src_path, &dst_path)?;
            }
        }
    }
    Ok(())
}
