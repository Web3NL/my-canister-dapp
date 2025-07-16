import { LedgerIndex } from '$lib/api/ledgerIndex';
import { filterCreateCanisterTransactions } from '$lib/utils/transactions';
import { CmcApi } from '$lib/api/cmc';
import { authStore } from '$lib/stores/auth';
import { createDerivationOrigin } from '$lib/remoteAuthentication/derivationOrigin';
import type { TransactionWithId } from '@dfinity/ledger-icp';
import { MyDashboardBackend } from '@web3nl/my-canister-dashboard';
import { createHttpAgent } from '$lib/utils/agent';

export function createDashboardUrl(canisterId: string): string {
  const origin = createDerivationOrigin(canisterId);
  return `${origin}/canister-dashboard`;
}

export function createFrontpageUrl(canisterId: string): string {
  const origin = createDerivationOrigin(canisterId);
  return origin;
}

function createTransactionUrl(transactionHash: string): string {
  return `https://dashboard.internetcomputer.org/transaction/${transactionHash}`;
}

export interface CreatedCanister {
  frontpageUrl: string;
  dashboardUrl: string;
  transactionUrl: string;
  blockId: bigint;
  name: string;
}

export async function getCreateCanisterTransactions(): Promise<
  TransactionWithId[]
> {
  const ledgerIndex = await LedgerIndex.create();
  const result = await ledgerIndex.getAccountTransactions();
  return filterCreateCanisterTransactions(result);
}

export async function getCreatedCanister(
  blockId: bigint
): Promise<CreatedCanister | null> {
  const principal = await authStore.getPrincipal();
  const cmc = await CmcApi.create();

  const canisterId = await cmc.notifyCreateCanister(blockId, principal);
  const transactionHash = blockId.toString(16);

  let name = 'Private dApp';

  const agent = await createHttpAgent();
  const backend = MyDashboardBackend.create({ agent, canisterId });
  const status = await backend.wasmStatus();
  if (status.name.length > 0) {
    name = status.name;
  }

  return {
    frontpageUrl: createFrontpageUrl(canisterId.toText()),
    dashboardUrl: createDashboardUrl(canisterId.toText()),
    transactionUrl: createTransactionUrl(transactionHash),
    blockId: blockId,
    name: name,
  };
}
