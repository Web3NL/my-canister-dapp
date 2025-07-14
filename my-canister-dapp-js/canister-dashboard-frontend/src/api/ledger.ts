import { LedgerCanister, AccountIdentifier } from '@dfinity/ledger-icp';
import type { Principal } from '@dfinity/principal';
import { createHttpAgent } from '../utils';
import { showError, NETWORK_ERROR_MESSAGE } from '../error';

export class LedgerApi {
  private async ledgerApi(): Promise<LedgerCanister> {
    const agent = await createHttpAgent();
    return LedgerCanister.create({
      agent,
    });
  }

  async balance(): Promise<bigint> {
    try {
      const agent = await createHttpAgent();
      const principal = await agent.getPrincipal();
      const accountIdentifier = AccountIdentifier.fromPrincipal({
        principal,
      });
      const ledger = await this.ledgerApi();
      return await ledger.accountBalance({
        accountIdentifier,
      });
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }

  async transfer(
    to: Principal,
    subAccount: Uint8Array,
    amount: bigint,
    memo: Uint8Array,
    fee: bigint
  ): Promise<bigint> {
    try {
      const ledger = await this.ledgerApi();

      return await ledger.icrc1Transfer({
        to: {
          owner: to,
          subaccount: [subAccount],
        },
        amount,
        icrc1Memo: memo,
        fee: fee,
      });
    } catch (error) {
      showError(NETWORK_ERROR_MESSAGE);
      throw error;
    }
  }
}
