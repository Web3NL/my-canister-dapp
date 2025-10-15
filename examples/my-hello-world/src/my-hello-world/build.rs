use std::env;
use std::path::Path;
use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=../my-hello-world-frontend/src");
    println!("cargo:rerun-if-changed=../my-hello-world-frontend/package.json");
    println!("cargo:rerun-if-changed=../my-hello-world-frontend/vite.config.ts");

    let frontend_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../my-hello-world-frontend");

    if !frontend_dir.exists() {
        panic!("Frontend directory not found: {}", frontend_dir.display());
    }

    let output = Command::new("npm")
        .args(["run", "build"])
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
}
