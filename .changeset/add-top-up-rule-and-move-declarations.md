---
'@web3nl/my-canister-dashboard': minor
---

Add manageTopUpRule to API and switch to generated declarations

- New method: `manageTopUpRule(arg)` on `MyDashboardBackend` to manage cycles top-up rules in the dashboard canister.
- New exported types: `ManageTopUpRuleArg`, `ManageTopUpRuleResult`.
- Internal: declarations are now generated from `my-canister-dashboard.did` and live under
  `my-canister-dapp-js/my-canister-dashboard-js/declarations/` (replacing the previously copied IDL file).
