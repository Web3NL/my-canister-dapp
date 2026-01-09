import {
  IcpLedgerCanister,
  AccountIdentifier,
} from '@icp-sdk/canisters/ledger/icp';
import { createHttpAgent } from '$lib/utils/agent';
import { CREATE_CANISTER_MEMO, TRANSACTION_FEE } from '$lib/constants';
import { authStore } from '$lib/stores/auth';
import { cmcCreateCanisterAccount } from '$lib/utils/account';

export class LedgerApi {
  private ledger: IcpLedgerCanister;

  private constructor(ledger: IcpLedgerCanister) {
    this.ledger = ledger;
  }

  static async create(): Promise<LedgerApi> {
    const agent = await createHttpAgent();
    const ledger = IcpLedgerCanister.create({
      agent,
    });
    return new LedgerApi(ledger);
  }

  async balance(): Promise<bigint> {
    const principal = await authStore.getPrincipal();

    const accountIdentifier = AccountIdentifier.fromPrincipal({
      principal,
    });
    return await this.ledger.accountBalance({
      accountIdentifier,
      certified: true,
    });
  }

  async transfer_to_cmc_for_create_canister(amount: bigint): Promise<bigint> {
    return await this.ledger.icrc1Transfer({
      to: await cmcCreateCanisterAccount(),
      amount,
      icrc1Memo: CREATE_CANISTER_MEMO,
      fee: TRANSACTION_FEE,
    });
  }
}
