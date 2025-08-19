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
import { showError, NETWORK_ERROR_MESSAGE } from '../error';

export class CanisterApi {
  private canisterApi!: ActorSubclass<CanisterApiService>;

  constructor() {
    void this.create();
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
      return await this.canisterApi.manage_alternative_origins(arg);
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }

  async manageTopUpRule(
    arg: ManageTopUpRuleArg
  ): Promise<ManageTopUpRuleResult> {
    try {
      return await this.canisterApi.manage_top_up_rule(arg);
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
