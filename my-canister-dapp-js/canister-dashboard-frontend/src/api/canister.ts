import type { ActorSubclass, HttpAgent } from '@dfinity/agent';
import {
  createMyCanisterActor,
  type MyDashboardService as CanisterApiService,
  type ManageAlternativeOriginsArg,
  type ManageAlternativeOriginsResult,
  type ManageTopUpRuleArg,
  type ManageTopUpRuleResult,
} from '@web3nl/my-canister-dashboard';

import { createHttpAgent, canisterId } from '../utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../error';

export class CanisterApi {
  private canisterApi!: ActorSubclass<CanisterApiService>;
  private ready: Promise<void>;

  constructor() {
    // Start async initialization immediately and store the promise
    this.ready = this.create();
  }

  private async create(): Promise<void> {
    const agent = await createHttpAgent();
    const canisterIdPrincipal = await canisterId();

    this.canisterApi = createMyCanisterActor({
      agent: agent as HttpAgent,
      canisterId: canisterIdPrincipal,
    });
  }

  async manageAlternativeOrigins(
    arg: ManageAlternativeOriginsArg
  ): Promise<ManageAlternativeOriginsResult> {
    try {
      // Ensure the actor is initialized before making the call
      await this.ready;
      return await this.canisterApi.manage_alternative_origins(arg);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }

  async manageTopUpRule(
    arg: ManageTopUpRuleArg
  ): Promise<ManageTopUpRuleResult> {
    try {
      // Ensure the actor is initialized before making the call
      await this.ready;
      return await this.canisterApi.manage_top_up_rule(arg);
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
