use anyhow::{Context, Result, bail};
use std::process::Command;

/// Wrapper around the `icp` CLI tool.
pub struct IcpCli {
    pub environment: String,
    pub identity: Option<String>,
}

impl IcpCli {
    /// Check that `icp` is installed and reachable.
    pub fn check_installed() -> Result<String> {
        let output = Command::new("icp").arg("--version").output().context(
            "icp-cli is not installed or not in PATH.\n\
                 Install it with: npm install -g @aspect-build/icp-cli\n\
                 Or see: https://github.com/nicholasosaka/icp-cli",
        )?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            bail!(
                "icp-cli returned an error:\n{stderr}\n\
                 Ensure icp-cli is correctly installed."
            );
        }

        let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(version)
    }

    /// Build base args that are appended to every `icp` invocation.
    fn base_args(&self) -> Vec<String> {
        let mut args = vec!["-e".to_string(), self.environment.clone()];
        if let Some(id) = &self.identity {
            args.push("--identity".to_string());
            args.push(id.clone());
        }
        args
    }

    /// Build a canister using its icp.yaml recipe.
    pub fn build(&self, name: &str) -> Result<()> {
        self.run(&["build", name])
            .with_context(|| format!("Failed to build canister '{name}'"))
    }

    /// Create a new canister on the network.
    pub fn canister_create(&self, name: &str, cycles: &str) -> Result<()> {
        self.run(&["canister", "create", name, "--cycles", cycles])
            .with_context(|| format!("Failed to create canister '{name}'"))
    }

    /// Install a wasm module into a canister.
    ///
    /// If `wasm_path` is `None`, icp-cli uses the build output from `icp build`.
    pub fn canister_install(&self, name: &str, wasm_path: Option<&str>) -> Result<()> {
        let mut args: Vec<&str> = vec!["canister", "install", name];
        if let Some(path) = wasm_path {
            args.push("--wasm");
            args.push(path);
        }
        self.run(&args)
            .with_context(|| format!("Failed to install wasm into canister '{name}'"))
    }

    /// Get the canister ID for a named canister.
    pub fn canister_id(&self, name: &str) -> Result<String> {
        self.run_capture(&["canister", "status", name, "--id-only"])
            .with_context(|| format!("Failed to get canister ID for '{name}'"))
    }

    /// Call an update method on a canister with Candid arguments.
    pub fn canister_call(&self, name: &str, method: &str, candid_args: &str) -> Result<String> {
        self.run_capture(&["canister", "call", name, method, candid_args])
            .with_context(|| format!("Failed to call {name}.{method}"))
    }

    /// Update canister settings to set the controller list.
    pub fn canister_update_settings(&self, name: &str, controllers: &[&str]) -> Result<()> {
        let mut args: Vec<&str> = vec!["canister", "settings", "update", name, "-f"];
        for c in controllers {
            args.push("--set-controller");
            args.push(c);
        }
        self.run(&args)
            .with_context(|| format!("Failed to update settings for canister '{name}'"))
    }

    /// Run an `icp` command, check exit status, discard stdout.
    fn run(&self, args: &[&str]) -> Result<()> {
        let base = self.base_args();
        let mut cmd = Command::new("icp");
        cmd.args(args);
        for a in &base {
            cmd.arg(a);
        }

        let output = cmd.output().context("Failed to execute icp command")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            bail!(
                "icp {} failed (exit {}):\n{stdout}{stderr}",
                args.join(" "),
                output.status
            );
        }
        Ok(())
    }

    /// Run an `icp` command, check exit status, return trimmed stdout.
    fn run_capture(&self, args: &[&str]) -> Result<String> {
        let base = self.base_args();
        let mut cmd = Command::new("icp");
        cmd.args(args);
        for a in &base {
            cmd.arg(a);
        }

        let output = cmd.output().context("Failed to execute icp command")?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let stdout = String::from_utf8_lossy(&output.stdout);
            bail!(
                "icp {} failed (exit {}):\n{stdout}{stderr}",
                args.join(" "),
                output.status
            );
        }

        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // -- base_args tests --

    #[test]
    fn base_args_local_no_identity() {
        let icp = IcpCli {
            environment: "local".to_string(),
            identity: None,
        };
        assert_eq!(icp.base_args(), vec!["-e", "local"]);
    }

    #[test]
    fn base_args_local_with_identity() {
        let icp = IcpCli {
            environment: "local".to_string(),
            identity: Some("my-id".to_string()),
        };
        assert_eq!(icp.base_args(), vec!["-e", "local", "--identity", "my-id"]);
    }

    #[test]
    fn base_args_mainnet() {
        let icp = IcpCli {
            environment: "ic".to_string(),
            identity: None,
        };
        assert_eq!(icp.base_args(), vec!["-e", "ic"]);
    }

    #[test]
    fn base_args_mainnet_with_identity() {
        let icp = IcpCli {
            environment: "ic".to_string(),
            identity: Some("prod-identity".to_string()),
        };
        assert_eq!(
            icp.base_args(),
            vec!["-e", "ic", "--identity", "prod-identity"]
        );
    }
}
