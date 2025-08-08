---
'@web3nl/my-canister-dashboard': patch
---

Fix: declare correct runtime and peer dependencies and vendor the canister IDL/types.

Changes:

- dependencies: add `@dfinity/ic-management`
- peerDependencies: add `@dfinity/agent` and `@dfinity/principal`
- remove reliance on workspace `$declarations`; embed IDL/types within the package
