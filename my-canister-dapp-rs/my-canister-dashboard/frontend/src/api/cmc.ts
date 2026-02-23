import { CmcCanister } from '@icp-sdk/canisters/cmc';
import { Principal } from '@icp-sdk/core/principal';
import { createHttpAgent } from '../utils';
import { CMC_CANISTER_ID } from '../constants';
import { reportError, NETWORK_ERROR_MESSAGE } from '../error';

export class CMCApi {
  private async cmcApi(): Promise<CmcCanister> {
    const agent = await createHttpAgent();
    return CmcCanister.create({
      agent,
      canisterId: Principal.fromText(CMC_CANISTER_ID),
    });
  }

  async notifyTopUp(canisterId: string, blockIndex: bigint): Promise<bigint> {
    try {
      const cmc = await this.cmcApi();
      return await cmc.notifyTopUp({
        canister_id: Principal.fromText(canisterId),
        block_index: blockIndex,
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
