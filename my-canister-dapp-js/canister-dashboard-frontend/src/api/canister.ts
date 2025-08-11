import { Actor, type ActorSubclass } from '@dfinity/agent';
import type {
  _SERVICE,
  ManageAlternativeOriginsArg,
  ManageAlternativeOriginsResult,
  ManageTopUpRuleArg,
  ManageTopUpRuleResult,
} from '$declarations/my-canister-dashboard.did.d.ts';
import { idlFactory } from '$declarations/my-canister-dashboard.did.js';

type CanisterApiService = _SERVICE;
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

    this.canisterApi = Actor.createActor(idlFactory, {
      agent,
      canisterId: canisterIdPrincipal,
    });
  }

  async manageAlternativeOrigins(
    arg: ManageAlternativeOriginsArg
  ): Promise<ManageAlternativeOriginsResult> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      return await this.canisterApi.manage_top_up_rule(arg);
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
