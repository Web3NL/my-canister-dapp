# @web3nl/my-canister-dashboard

## 0.5.4

### Patch Changes

- [#86](https://github.com/Web3NL/my-canister-dapp/pull/86) [`37ad093`](https://github.com/Web3NL/my-canister-dapp/commit/37ad093ee896d1765a6e24c157056842d26a8216) Thanks [@Web3NL](https://github.com/Web3NL)! - Harden package for publishing and consumer use.

  - Declare correct runtime dependency (`@dfinity/ic-management`) and move `@dfinity/agent` / `@dfinity/principal` to peerDependencies (with matching devDependencies for local builds)
  - Vendor canister IDL/types into the package (`src/idl/my-canister.did.ts`) and remove reliance on workspace `$declarations`
  - Update build config to drop `$declarations` alias and keep external deps clean
  - Ensure the package builds/tests in isolation and `npm pack` ships only the intended files

- [#86](https://github.com/Web3NL/my-canister-dapp/pull/86) [`0b8dcb2`](https://github.com/Web3NL/my-canister-dapp/commit/0b8dcb23577cf3e208f22aa47dff0c578096f144) Thanks [@Web3NL](https://github.com/Web3NL)! - Fix: declare correct runtime and peer dependencies and vendor the canister IDL/types.

  Changes:

  - dependencies: add `@dfinity/ic-management`
  - peerDependencies: add `@dfinity/agent` and `@dfinity/principal`
  - remove reliance on workspace `$declarations`; embed IDL/types within the package
