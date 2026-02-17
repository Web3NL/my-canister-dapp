# Canister Dashboard Architecture v1

## 1. Summary

This document defines a clean-slate architecture for a user-owned canister dashboard system on the Internet Computer.

The system has two mandatory handoff flows:

1. Dashboard bootstrap handoff:
   installer origin principal -> dashboard domain principal
2. App installation handoff:
   dashboard origin principal -> app domain principal

Both handoff flows are first-class protocol features and must be fully testable in local end-to-end tests.

## 2. Goals

1. Enable a user to create a single dashboard canister they control.
2. Enable a user to create and manage many app canisters from that dashboard.
3. Keep app controller model deterministic and safe.
4. Make handoff operations durable, resumable, and idempotent.
5. Provide production-safe observability for handoff verification and operations.
6. Ensure local E2E testability without test-only privileged mutation APIs.

## 3. Non-Goals

1. No compatibility layer for legacy per-app embedded dashboards.
2. No custom-domain support in v1.
3. No migration protocol from prior systems in v1 scope.

## 4. Scope Defaults

1. Clean break architecture.
2. Installer-assisted bootstrap flow.
3. IC-native canister domains only.
4. Permanent dual controllers for app canisters:
   dashboard canister principal + app-domain II principal.
5. Local E2E handoff validation is a non-negotiable architecture constraint.

## 5. Actors And Principals

1. User
2. Installer frontend/service
3. Dashboard canister
4. App canister
5. Internet Identity
6. ICP Ledger
7. Cycles Minting Canister (CMC)
8. IC management canister

Principal contexts used by protocol:

1. Service principal: user principal at installer origin.
2. Dashboard principal: user principal derived at dashboard canister domain.
3. App principal: user principal derived at app canister domain.

## 6. Controller Invariants

### 6.1 Dashboard Canister

Final controller set must be:

1. Dashboard canister principal (self controller)
2. Dashboard principal (user principal at dashboard domain)

### 6.2 App Canister

Final controller set must be:

1. Dashboard canister principal
2. App principal (user principal at app domain)

The controller update step is mandatory and must be checkpointed.

## 7. Protocol Flows

### 7.1 Dashboard Bootstrap Handoff

1. User authenticates at installer origin.
2. Installer creates dashboard canister (CMC + management workflow).
3. Installer installs dashboard wasm.
4. Installer initiates II login using `derivationOrigin = https://<dashboard-canister>.icp0.io`.
5. Captured dashboard principal is submitted to dashboard canister.
6. Installer updates dashboard canister controllers to final invariant set.
7. Operation finalized and persisted.

Required checkpoint sequence:

1. `CanisterCreated`
2. `InitialInstallComplete`
3. `RemoteAuthPrincipalCaptured`
4. `ControllersUpdated`
5. `FinalizationComplete`

### 7.2 App Installation Handoff

1. User authenticates to dashboard.
2. Dashboard creates app canister.
3. Dashboard installs initial app payload required for handoff.
4. Dashboard origin is present in app `/.well-known/ii-alternative-origins`.
5. Frontend initiates II login using `derivationOrigin = https://<app-canister>.icp0.io`.
6. Captured app principal is submitted to dashboard canister.
7. Dashboard updates app controllers to final invariant set.
8. Dashboard finalizes install record and active app metadata.

Required checkpoint sequence:

1. `CanisterCreated`
2. `InitialInstallComplete`
3. `RemoteAuthPrincipalCaptured`
4. `ControllersUpdated`
5. `FinalizationComplete`

## 8. Durable Operations Model

All handoff flows are represented as persistent operations.

### 8.1 Operation Types

1. `BootstrapDashboard`
2. `InstallApp`
3. `UpgradeApp`
4. `TopUpApp`

### 8.2 Core Properties

1. Every create/bootstrap call returns an `operation_id`.
2. Latest successful checkpoint is persisted per operation.
3. `resume_operation(operation_id)` must continue safely from checkpoint.
4. Repeated completion requests are idempotent.
5. In-flight and terminal states are queryable via read-only APIs.

### 8.3 Checkpoints

```candid
type OperationCheckpoint = variant {
  CanisterCreated;
  InitialInstallComplete;
  RemoteAuthPrincipalCaptured;
  ControllersUpdated;
  FinalizationComplete;
};
```

### 8.4 Status

```candid
type OperationStage = variant {
  Pending;
  Running;
  AwaitingRemoteAuth;
  Completed;
  Failed;
};
```

## 9. Read-Only Verification Surfaces

The following read-only data must be available for runtime diagnostics and E2E assertions:

1. Dashboard owner principal.
2. App records with lifecycle stage and controller expectation.
3. Operation record including:
   operation type, stage, latest checkpoint, failure reason (if any), timestamps.

No privileged test-only mutation endpoints are allowed.

## 10. Dashboard Canister Interface (v1 Draft)

```candid
type OperationId = text;
type TimestampNs = nat64;

type DashboardStatus = record {
  owner_principal : opt principal;
  dashboard_canister_id : principal;
};

type AppLifecycleStage = variant {
  Pending;
  Active;
  Upgrading;
  Failed;
};

type AppRecord = record {
  app_canister_id : principal;
  app_principal : opt principal;
  stage : AppLifecycleStage;
  created_at_ns : TimestampNs;
  updated_at_ns : TimestampNs;
};

type OperationStatus = record {
  operation_id : OperationId;
  operation_type : text;
  stage : OperationStage;
  last_checkpoint : opt OperationCheckpoint;
  failure_reason : opt text;
  created_at_ns : TimestampNs;
  updated_at_ns : TimestampNs;
};

type CreateDashboardRequest = record {};
type CreateDashboardResponse = record { operation_id : OperationId; dashboard_canister_id : principal; };
type CompleteBootstrapRequest = record { operation_id : OperationId; dashboard_principal : principal; };

type InstallAppRequest = record {
  wasm_module : vec nat8;
  name : text;
  version : nat32;
  memo : opt text;
};
type InstallAppResponse = record { operation_id : OperationId; app_canister_id : principal; };
type CompleteAppHandoffRequest = record { operation_id : OperationId; app_principal : principal; };

type TopUpRequest = record {
  app_canister_id : principal;
  amount_e8s : nat64;
};

type UpgradeAppRequest = record {
  app_canister_id : principal;
  wasm_module : vec nat8;
  expected_version : nat32;
};

service : {
  dashboard_status : () -> (DashboardStatus) query;
  get_owner_principal : () -> (opt principal) query;

  create_dashboard : (CreateDashboardRequest) -> (CreateDashboardResponse);
  complete_bootstrap_handoff : (CompleteBootstrapRequest) -> ();

  install_app : (InstallAppRequest) -> (InstallAppResponse);
  complete_app_handoff : (CompleteAppHandoffRequest) -> ();

  top_up_app : (TopUpRequest) -> ();
  upgrade_app : (UpgradeAppRequest) -> ();

  list_apps : () -> (vec AppRecord) query;
  get_app : (principal) -> (opt AppRecord) query;

  get_operation_status : (OperationId) -> (opt OperationStatus) query;
  resume_operation : (OperationId) -> ();
}
```

## 11. Security And Safety Requirements

1. Mutation methods are caller-restricted to authorized principals for each operation phase.
2. Controller updates are explicit and audited via operation checkpoints.
3. Alternative-origins data must be certified and validated by II rules.
4. Resume operations must never skip mandatory checkpoints.
5. On checkpoint failure, operation status must be `Failed` with reason.

## 12. Local E2E Handoff Validation

This section defines mandatory local end-to-end validation for both handoff flows.

### 12.1 Baseline Local Stack

1. Start replica with system canisters:
   `dfx start --clean --background --system-canisters`
2. Deploy custom pinned Internet Identity wasm for deterministic E2E behavior.
3. Deploy installer frontend, dashboard wasm, and sample app wasm.
4. Tests execute against local canister domains and real II login popups.

### 12.2 Mandatory Test Tracks

1. Dashboard bootstrap handoff happy path.
2. App installation handoff happy path.
3. Mid-flow interruption and resume for both handoff types.
4. Duplicate completion/idempotency checks for handoff completion methods.
5. Unauthorized caller rejection for mutation endpoints.

### 12.3 Assertion Model

Each track must assert:

1. Principal derivation differs by origin where expected.
2. Final controller sets match architecture invariants.
3. Dashboard canister state matches IC management canister truth.
4. Operation checkpoint progression is monotonic and persisted.

### 12.4 Production-Safe Test Principle

1. Primary E2E path must not use mock-only ownership transfer shortcuts.
2. E2E verification uses normal APIs and management canister queries only.
3. No privileged test endpoints are introduced for state mutation.

### 12.5 One-Command Execution Requirement

Local developers must be able to run a single command that:

1. Boots local infrastructure.
2. Deploys required artifacts.
3. Runs the full handoff E2E suite.

Pass condition:

1. Fresh local environment.
2. Zero manual controller edits.
3. All handoff and recovery tracks green.

## 13. Acceptance Criteria

1. Both handoff flows are durable, resumable, and idempotent.
2. Operation API exposes `operation_id`, checkpoint, and stage.
3. Read-only verification endpoints expose owner principal, app lifecycle, and operation status.
4. Local E2E suite validates real II derivation-origin behavior for both handoff flows.
5. Final controller sets are enforced by protocol and validated by tests.
6. Design remains production-safe without test-only mutation surfaces.
