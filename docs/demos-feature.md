# Demos Feature

## Intent

Allow administrators to generate **access codes** that give users free, time-limited trial access to the service. Instead of funding their own canister creation with ICP, a user enters an access code during the install flow and receives a pre-provisioned demo canister from a managed pool.

## Architecture

### New: `demos` canister (`canisters/demos/`)

A Rust canister that manages the full demo lifecycle:

- **Access code management** — generate, validate, and track codes
- **Canister pool** — pre-created empty canisters for instant provisioning
- **Wasm installation** — fetches wasm from `wasm-registry` and installs on pool canisters
- **Monitoring** — timer-based trial expiration + cycles top-up
- **Reclamation** — uninstalls expired demos and returns canisters to the pool

Lives on the same subnet as `wasm-registry`.

### Modified: `my-canister-app`

- Alternative path in `/install`: "Have an access code?" replaces the Fund Account step
- Calls demos canister for code redemption and finalization
- Handles remote II authentication (same mechanism as normal flow)
- "My Dapps" page polls demos canister for active demos

### Unchanged: `my-canister-dashboard` crate and `my-canister-dashboard-js` package

No modifications needed. Controller lockdown is achieved through a controller configuration that exploits the existing `hasRequiredPrincipals` safety check.

## Flow

```
1. Admin generates access codes via demos canister
2. Admin gives code to user
3. User visits my-canister-app, authenticates with II
4. User selects a dapp from the Dapp Store, clicks Install
5. On install page, user toggles "Have an access code?" and enters code
6. my-canister-app calls demos.redeem_code(code, wasm_name)
   -> demos canister: picks canister from pool, installs wasm, adds alt origins
   -> returns canister_id
7. User does remote II auth at demo canister domain (popup)
8. my-canister-app calls demos.finalize_demo(code, dapp_principal)
   -> demos canister: sets II principal, sets controllers, starts trial timer
9. User accesses their demo dapp
10. After trial expires, demos canister reclaims the canister
```

## Controller Lockdown

Demo canister controllers: `[demos_canister_id, user_ii_principal]`

The canister itself is NOT a controller. This causes the dashboard frontend's `hasRequiredPrincipals` check to block all controller add/remove operations, since it requires the canister's own ID in any proposed controller list. The controller list remains visible but all modifications are blocked.

No features break because no backend code requires canister self-controller status.

## Dual Principal Tracking

The demos canister tracks two distinct II principals per demo:

- **service_principal** — II principal at my-canister-app domain (used for `get_my_demos` polling)
- **dapp_principal** — II principal at demo canister domain (set on the canister, used for dashboard auth)

These are different because Internet Identity derives different principals per origin.
