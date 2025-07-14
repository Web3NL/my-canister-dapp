import { Actor, type ActorSubclass } from '@dfinity/agent';
import type {
  _SERVICE,
  ManageAlternativeOriginsArg,
  ManageAlternativeOriginsResult,
} from '$declarations/my-canister/my-canister.did.d.ts';
import { idlFactory } from '$declarations/my-canister/my-canister.did.js';

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
    const canisterIdPrincipal = canisterId();

    this.canisterApi = Actor.createActor(idlFactory, {
      agent,
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
}
