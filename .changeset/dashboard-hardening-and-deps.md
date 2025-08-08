---
'@web3nl/my-canister-dashboard': patch
---

Harden package for publishing and consumer use.

- Declare correct runtime dependency (`@dfinity/ic-management`) and move `@dfinity/agent` / `@dfinity/principal` to peerDependencies (with matching devDependencies for local builds)
- Vendor canister IDL/types into the package (`src/idl/my-canister.did.ts`) and remove reliance on workspace `$declarations`
- Update build config to drop `$declarations` alias and keep external deps clean
- Ensure the package builds/tests in isolation and `npm pack` ships only the intended files
