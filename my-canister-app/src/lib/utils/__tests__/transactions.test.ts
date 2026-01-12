import { describe, it, expect } from 'vitest';
import { filterCreateCanisterTransactions } from '../transactions';
import type {
  GetAccountIdentifierTransactionsResult,
  TransactionWithId,
} from '$declarations/icp-index/icp-index.did.d.ts';

// CREATE_CANISTER_MEMO = [0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x00] = 'CREA' + padding
const CREATE_CANISTER_MEMO = new Uint8Array([0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x00]);

function createMockTransaction(
  icrc1Memo: [] | [Uint8Array | number[]]
): TransactionWithId {
  return {
    id: 1n,
    transaction: {
      icrc1_memo: icrc1Memo,
      memo: 0n,
      operation: { Transfer: { to: 'account-to', fee: { e8s: 10000n }, from: 'account-from', amount: { e8s: 100000000n }, spender: [] } },
      created_at_time: [],
      timestamp: [],
    },
  };
}

function createOkResult(
  transactions: TransactionWithId[]
): GetAccountIdentifierTransactionsResult {
  return {
    Ok: {
      transactions,
      oldest_tx_id: [],
      balance: 0n,
    },
  };
}

describe('filterCreateCanisterTransactions', () => {
  it('returns empty array when result contains Err', () => {
    const errResult: GetAccountIdentifierTransactionsResult = {
      Err: { message: 'Invalid account' },
    };
    expect(filterCreateCanisterTransactions(errResult)).toEqual([]);
  });

  it('returns empty array when transactions is empty', () => {
    const result = createOkResult([]);
    expect(filterCreateCanisterTransactions(result)).toEqual([]);
  });

  it('filters transactions with CREATE_CANISTER_MEMO', () => {
    const validTx = createMockTransaction([CREATE_CANISTER_MEMO]);
    const result = createOkResult([validTx]);

    const filtered = filterCreateCanisterTransactions(result);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toBe(validTx);
  });

  it('excludes transactions without icrc1_memo', () => {
    const txWithoutMemo = createMockTransaction([]);
    const result = createOkResult([txWithoutMemo]);

    expect(filterCreateCanisterTransactions(result)).toEqual([]);
  });

  it('excludes transactions with wrong memo length', () => {
    const wrongLengthMemo = new Uint8Array([0x43, 0x52, 0x45, 0x41]); // Only 4 bytes
    const txWithWrongLength = createMockTransaction([wrongLengthMemo]);
    const result = createOkResult([txWithWrongLength]);

    expect(filterCreateCanisterTransactions(result)).toEqual([]);
  });

  it('excludes transactions with partial memo match', () => {
    const partialMemo = new Uint8Array([0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x01]); // Last byte different
    const txWithPartialMatch = createMockTransaction([partialMemo]);
    const result = createOkResult([txWithPartialMatch]);

    expect(filterCreateCanisterTransactions(result)).toEqual([]);
  });

  it('returns multiple matching transactions', () => {
    const validTx1 = createMockTransaction([CREATE_CANISTER_MEMO]);
    const validTx2 = createMockTransaction([CREATE_CANISTER_MEMO]);
    const result = createOkResult([validTx1, validTx2]);

    const filtered = filterCreateCanisterTransactions(result);
    expect(filtered).toHaveLength(2);
  });

  it('handles mixed valid/invalid transactions', () => {
    const validTx = createMockTransaction([CREATE_CANISTER_MEMO]);
    const invalidTx1 = createMockTransaction([]); // No memo
    const invalidTx2 = createMockTransaction([new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])]); // Wrong memo
    const result = createOkResult([invalidTx1, validTx, invalidTx2]);

    const filtered = filterCreateCanisterTransactions(result);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toBe(validTx);
  });
});
