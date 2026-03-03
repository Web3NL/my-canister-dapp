import type {
  GetAccountIdentifierTransactionsResult,
  TransactionWithId,
} from '$declarations/icp-index/icp-index.did.d.ts';
import { CREATE_CANISTER_MEMO } from '$lib/constants';

export function filterCreateCanisterTransactions(
  result: GetAccountIdentifierTransactionsResult
): TransactionWithId[] {
  if ('Err' in result) {
    return [];
  }

  const transactions = result.Ok.transactions;

  return transactions.filter(tx => {
    const icrc1Memo = tx.transaction.icrc1_memo;
    if (icrc1Memo.length === 0) return false;

    // Check if icrc1_memo matches CREATE_CANISTER_MEMO [67,82,69,65,0,0,0,0]
    const memo = icrc1Memo[0];
    if (memo.length !== CREATE_CANISTER_MEMO.length) return false;

    return memo.every((byte, index) => byte === CREATE_CANISTER_MEMO[index]);
  });
}
