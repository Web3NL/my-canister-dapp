import {
  IcpIndexCanister,
  AccountIdentifier,
  type IcpIndexDid,
} from '@icp-sdk/canisters/ledger/icp';
import { Principal } from '@icp-sdk/core/principal';
import { createHttpAgent } from '$lib/utils/agent';
import { INDEX_CANISTER_ID } from '$lib/constants';
import { authStore } from '$lib/stores/auth';

export type GetAccountIdentifierTransactionsResponse =
  IcpIndexDid.GetAccountIdentifierTransactionsResponse;
export type TransactionWithId = IcpIndexDid.TransactionWithId;

export class LedgerIndex {
  private indexCanister: IcpIndexCanister;

  private constructor(indexCanister: IcpIndexCanister) {
    this.indexCanister = indexCanister;
  }

  static async create(): Promise<LedgerIndex> {
    const agent = await createHttpAgent();
    const indexCanister = IcpIndexCanister.create({
      agent,
      canisterId: Principal.fromText(INDEX_CANISTER_ID),
    });
    return new LedgerIndex(indexCanister);
  }

  async getAccountTransactions(): Promise<GetAccountIdentifierTransactionsResponse> {
    const principal = await authStore.getPrincipal();
    const accountIdentifier = AccountIdentifier.fromPrincipal({
      principal,
    });
    return await this.indexCanister.getTransactions({
      accountIdentifier,
      maxResults: BigInt(100),
      certified: false,
    });
  }
}
