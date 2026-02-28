import type { ActorSubclass } from '@icp-sdk/core/agent';
import { Actor } from '@icp-sdk/core/agent';
import { createHttpAgent } from '$lib/utils/agent';
import { DEMOS_CANISTER_ID } from '$lib/constants/canisterIds';
import { idlFactory } from '$lib/declarations/demos/demos.did.js';
import type {
  _SERVICE as DemosService,
  ActiveDemo,
  RedeemResult,
  GenericResult,
} from '$lib/declarations/demos/demos.did.d.ts';
import type { Principal } from '@icp-sdk/core/principal';

export type { ActiveDemo };

export class DemosApi {
  private actor: ActorSubclass<DemosService>;

  private constructor(actor: ActorSubclass<DemosService>) {
    this.actor = actor;
  }

  static async create(): Promise<DemosApi> {
    const agent = await createHttpAgent();

    const actor = Actor.createActor<DemosService>(idlFactory, {
      agent,
      canisterId: DEMOS_CANISTER_ID,
    });

    return new DemosApi(actor);
  }

  async validateCode(code: string): Promise<boolean> {
    return await this.actor.validate_code(code);
  }

  async redeemCode(code: string, wasmName: string): Promise<RedeemResult> {
    return await this.actor.redeem_code(code, wasmName);
  }

  async finalizeDemo(
    code: string,
    dappPrincipal: Principal
  ): Promise<GenericResult> {
    return await this.actor.finalize_demo(code, dappPrincipal);
  }

  async getMyDemos(): Promise<ActiveDemo[]> {
    return await this.actor.get_my_demos();
  }
}
