import {
  IcpLedgerCanister,
  AccountIdentifier,
} from '@icp-sdk/canisters/ledger/icp';
import type { Principal } from '@icp-sdk/core/principal';
import { createHttpAgent, canisterId } from '../utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../error';

export class LedgerApi {
  private async ledgerApi(): Promise<IcpLedgerCanister> {
    const agent = await createHttpAgent();
    return IcpLedgerCanister.create({
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
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }

  async canisterBalance(): Promise<bigint> {
    try {
      const canister = canisterId();
      const accountIdentifier = AccountIdentifier.fromPrincipal({
        principal: canister,
      });
      const ledger = await this.ledgerApi();
      return await ledger.accountBalance({
        accountIdentifier,
      });
    } catch (error) {
      reportError(NETWORK_ERROR_MESSAGE, error);
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
      reportError(NETWORK_ERROR_MESSAGE, error);
      throw error;
    }
  }
}
