---
"@web3nl/vite-plugin-canister-dapp": major
---

Remove deprecated API and release v1.0.0

**BREAKING CHANGES:**

- Removed `canisterDashboardDevConfig()` - use `canisterDappEnvironmentConfig()` instead
- Removed `CanisterDashboardDevConfig` interface - use `CanisterDappEnvironmentConfig` instead
- Removed `CanisterDashboardPluginConfig` interface - use `CanisterDappEnvironmentPluginConfig` instead
- Removed VITE_* environment variable based configuration - use plugin options instead
- Removed `/canister-dashboard-dev-config.json` endpoint - configuration is now injected at build time

See CHANGELOG.md for migration guide.
