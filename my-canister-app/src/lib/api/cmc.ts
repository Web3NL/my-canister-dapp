import { CMCCanister } from '@dfinity/cmc';
import { createHttpAgent } from '$lib/utils/agent';
import { Principal } from '@dfinity/principal';
import type { CMCCanisterOptions } from '@dfinity/cmc/dist/types/cmc.options';
import { CMC_CANISTER_ID } from '$lib/constants';

export class CmcApi {
  private cmc: CMCCanister;

  private constructor(cmc: CMCCanister) {
    this.cmc = cmc;
  }

  static async create(): Promise<CmcApi> {
    const agent = await createHttpAgent();
    const options: CMCCanisterOptions = {
      agent,
      canisterId: Principal.fromText(CMC_CANISTER_ID),
    };
    const cmc = CMCCanister.create(options);
    return new CmcApi(cmc);
  }

  async notifyCreateCanister(
    blockIndex: bigint,
    controller: Principal
  ): Promise<Principal> {
    return await this.cmc.notifyCreateCanister({
      block_index: blockIndex,
      controller: controller,
      subnet_selection: [],
      settings: [],
      subnet_type: [],
    });
  }
}
