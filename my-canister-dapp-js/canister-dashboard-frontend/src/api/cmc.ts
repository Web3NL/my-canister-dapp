import { CMCCanister } from '@dfinity/cmc';
import { Principal } from '@dfinity/principal';
import { createHttpAgent } from '../utils';
import { CMC_CANISTER_ID } from '../constants';
import { showError, NETWORK_ERROR_MESSAGE } from '../error';

export class CMCApi {
  private async cmcApi(): Promise<CMCCanister> {
    const agent = await createHttpAgent();
    return CMCCanister.create({
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
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
