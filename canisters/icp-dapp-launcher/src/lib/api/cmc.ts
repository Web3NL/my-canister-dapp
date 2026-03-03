import { CmcCanister, type CmcCanisterOptions } from '@icp-sdk/canisters/cmc';
import { createHttpAgent } from '$lib/utils/agent';
import { Principal } from '@icp-sdk/core/principal';
import { CMC_CANISTER_ID } from '$lib/constants';

export class CmcApi {
  private cmc: CmcCanister;

  private constructor(cmc: CmcCanister) {
    this.cmc = cmc;
  }

  static async create(): Promise<CmcApi> {
    const agent = await createHttpAgent();
    const options: CmcCanisterOptions = {
      agent,
      canisterId: Principal.fromText(CMC_CANISTER_ID),
    };
    const cmc = CmcCanister.create(options);
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

  async getIcpToCyclesConversionRate(
    params: { certified?: boolean } = {}
  ): Promise<bigint> {
    return this.cmc.getIcpToCyclesConversionRate(params);
  }
}
