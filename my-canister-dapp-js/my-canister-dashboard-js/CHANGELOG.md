# @web3nl/my-canister-dashboard

## 0.6.2

### Patch Changes

- [#126](https://github.com/Web3NL/my-canister-dapp/pull/126) [`00fe509`](https://github.com/Web3NL/my-canister-dapp/commit/00fe50986bc9ad39abdc27155a3bd647bdf0e940) Thanks [@Web3NL](https://github.com/Web3NL)! - export essential currently unexported types

## 0.6.1

### Patch Changes

- failed to commit files before publish

## 0.6.0

### Minor Changes

- [#101](https://github.com/Web3NL/my-canister-dapp/pull/101) [`4fd77dd`](https://github.com/Web3NL/my-canister-dapp/commit/4fd77dd3b97405e4e83402fe63b438a446ad0883) Thanks [@Web3NL](https://github.com/Web3NL)! - Add manageTopUpRule to API and switch to generated declarations

  - New method: `manageTopUpRule(arg)` on `MyDashboardBackend` to manage cycles top-up rules in the dashboard canister.
  - New exported types: `ManageTopUpRuleArg`, `ManageTopUpRuleResult`.
  - Internal: declarations are now generated from `my-canister-dashboard.did` and live under
    `my-canister-dapp-js/my-canister-dashboard-js/declarations/` (replacing the previously copied IDL file).

## 0.5.5

### Patch Changes

- [#88](https://github.com/Web3NL/my-canister-dapp/pull/88) [`48b1fca`](https://github.com/Web3NL/my-canister-dapp/commit/48b1fca2696642141d1f6cd9416f2eb3afdb310b) Thanks [@Web3NL](https://github.com/Web3NL)! - Fix docs publishing: consolidate to a single Pages workflow and ensure dashboard docs are included under /web3nl-my-canister-dashboard-js/ with .nojekyll.

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
