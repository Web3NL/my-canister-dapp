import type { HttpAgent, ActorSubclass } from '@dfinity/agent';
import { Actor } from '@dfinity/agent';
import type { Principal } from '@dfinity/principal';
import { idlFactory } from '$declarations/my-canister/my-canister.did.js';
import type {
  _SERVICE as MyDashboardService,
  HttpRequest,
  HttpResponse,
  ManageAlternativeOriginsArg,
  ManageAlternativeOriginsResult,
  ManageIIPrincipalArg,
  ManageIIPrincipalResult,
  WasmStatus,
} from '$declarations/my-canister/my-canister.did.d';

export type {
  _SERVICE as MyDashboardService,
  HttpRequest,
  HttpResponse,
  ManageAlternativeOriginsArg,
  ManageAlternativeOriginsResult,
  ManageIIPrincipalArg,
  ManageIIPrincipalResult,
  WasmStatus,
} from '$declarations/my-canister/my-canister.did.d';

/**
 * Configuration for MyDashboardBackend
 */
export interface MyDashboardBackendConfig {
  agent: HttpAgent;
  canisterId: string | Principal;
}

/**
 * Create an canister actor for the My Canister Dashboard backend.
 */
export function createMyCanisterActor(
  config: MyDashboardBackendConfig
): ActorSubclass<MyDashboardService> {
  if (config.canisterId === '') {
    throw new Error('canisterId is required');
  }

  return Actor.createActor(idlFactory, {
    agent: config.agent,
    canisterId: config.canisterId,
  });
}

/**
 * MyDashboardBackend actor class for the dashboard of a Canister Dapp
 */
export class MyDashboardBackend {
  private actor: ActorSubclass<MyDashboardService>;

  private constructor(actor: ActorSubclass<MyDashboardService>) {
    this.actor = actor;
  }

  /**
   * Create a new MyDashboardBackend instance
   */
  static create(config: MyDashboardBackendConfig): MyDashboardBackend {
    const actor = createMyCanisterActor(config);
    return new MyDashboardBackend(actor);
  }

  /**
   * Handle HTTP requests to the Canister Dapp
   */
  async httpRequest(request: HttpRequest): Promise<HttpResponse> {
    return await (
      this.actor.http_request as (request: HttpRequest) => Promise<HttpResponse>
    )(request);
  }

  /**
   * Update alternative origins for the Canister Dapp
   */
  async manageAlternativeOrigins(
    arg: ManageAlternativeOriginsArg
  ): Promise<ManageAlternativeOriginsResult> {
    return await (
      this.actor.manage_alternative_origins as (
        arg: ManageAlternativeOriginsArg
      ) => Promise<ManageAlternativeOriginsResult>
    )(arg);
  }

  /**
   * Update or get the Internet Identity principal of the Canister Dapp
   */
  async manageIIPrincipal(
    arg: ManageIIPrincipalArg
  ): Promise<ManageIIPrincipalResult> {
    return await (
      this.actor.manage_ii_principal as (
        arg: ManageIIPrincipalArg
      ) => Promise<ManageIIPrincipalResult>
    )(arg);
  }

  /**
   * Get the WASM status of the Canister Dapp
   */
  async wasmStatus(): Promise<WasmStatus> {
    return await (this.actor.wasm_status as () => Promise<WasmStatus>)();
  }
}
