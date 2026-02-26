Versions to bump:

- examples/my-hello-world/src/frontend/package.json
- examples/my-hello-world/src/backend/Cargo.toml
- examples/my-hello-world/src/backend/src/lib.rs

Upload new WASM to wasm-registry canister:

- Build and compress: ./scripts/build-all-wasm.sh
- Upload: ./scripts/upload-wasm-to-registry.sh "my-hello-world" "The Internet Computer Hello World Dapp" "<new-version>" wasm/my-hello-world.wasm.gz -e mainnet --identity web3nl

use tag:

- examples-my-hello-world-v\*
