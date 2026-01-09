import { Actor, type ActorSubclass } from '@icp-sdk/core/agent';
import { createHttpAgent } from '$lib/utils/agent';
import { idlFactory } from '$declarations/icp-index/icp-index.did.js';
import type {
  _SERVICE,
  GetAccountIdentifierTransactionsResult,
  Account,
} from '$declarations/icp-index/icp-index.did.d.ts';
import { INDEX_CANISTER_ID } from '$lib/constants';
import type { Principal } from '@icp-sdk/core/principal';

export class LedgerIndex {
  private indexCanister: ActorSubclass<_SERVICE>;

  private constructor(indexCanister: ActorSubclass<_SERVICE>) {
    this.indexCanister = indexCanister;
  }

  static async create(): Promise<LedgerIndex> {
    const agent = await createHttpAgent();
    const indexCanister = Actor.createActor<_SERVICE>(idlFactory, {
      agent,
      canisterId: INDEX_CANISTER_ID,
    });
    return new LedgerIndex(indexCanister);
  }

  async ledger_id(): Promise<Principal> {
    return await this.indexCanister.ledger_id();
  }

  async getAccountTransactions(): Promise<GetAccountIdentifierTransactionsResult> {
    const agent = await createHttpAgent();
    const principal = await agent.getPrincipal();
    const account: Account = {
      owner: principal,
      subaccount: [],
    };
    return await this.indexCanister.get_account_transactions({
      account,
      start: [],
      max_results: BigInt(100),
    });
  }
}
