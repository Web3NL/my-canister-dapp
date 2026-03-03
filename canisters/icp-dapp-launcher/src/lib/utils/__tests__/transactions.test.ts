import { describe, it, expect } from 'vitest';
import { filterCreateCanisterTransactions } from '../transactions';
import type {
  GetAccountIdentifierTransactionsResponse,
  TransactionWithId,
} from '$lib/api/ledgerIndex';

// CREATE_CANISTER_MEMO = [0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x00] = 'CREA' + padding
const CREATE_CANISTER_MEMO = new Uint8Array([
  0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x00,
]);

function createMockTransaction(
  icrc1Memo: [] | [Uint8Array]
): TransactionWithId {
  return {
    id: 1n,
    transaction: {
      icrc1_memo: icrc1Memo,
      memo: 0n,
      operation: {
        Transfer: {
          to: 'account-to',
          fee: { e8s: 10000n },
          from: 'account-from',
          amount: { e8s: 100000000n },
          spender: [],
        },
      },
      created_at_time: [],
      timestamp: [],
    },
  };
}

function createResponse(
  transactions: TransactionWithId[]
): GetAccountIdentifierTransactionsResponse {
  return {
    transactions,
    oldest_tx_id: [],
    balance: 0n,
  };
}

describe('filterCreateCanisterTransactions', () => {
  it('returns empty array when transactions is empty', () => {
    const response = createResponse([]);
    expect(filterCreateCanisterTransactions(response)).toEqual([]);
  });

  it('filters transactions with CREATE_CANISTER_MEMO', () => {
    const validTx = createMockTransaction([CREATE_CANISTER_MEMO]);
    const response = createResponse([validTx]);

    const filtered = filterCreateCanisterTransactions(response);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toBe(validTx);
  });

  it('excludes transactions without icrc1_memo', () => {
    const txWithoutMemo = createMockTransaction([]);
    const response = createResponse([txWithoutMemo]);

    expect(filterCreateCanisterTransactions(response)).toEqual([]);
  });

  it('excludes transactions with wrong memo length', () => {
    const wrongLengthMemo = new Uint8Array([0x43, 0x52, 0x45, 0x41]); // Only 4 bytes
    const txWithWrongLength = createMockTransaction([wrongLengthMemo]);
    const response = createResponse([txWithWrongLength]);

    expect(filterCreateCanisterTransactions(response)).toEqual([]);
  });

  it('excludes transactions with partial memo match', () => {
    const partialMemo = new Uint8Array([
      0x43, 0x52, 0x45, 0x41, 0x00, 0x00, 0x00, 0x01,
    ]); // Last byte different
    const txWithPartialMatch = createMockTransaction([partialMemo]);
    const response = createResponse([txWithPartialMatch]);

    expect(filterCreateCanisterTransactions(response)).toEqual([]);
  });

  it('returns multiple matching transactions', () => {
    const validTx1 = createMockTransaction([CREATE_CANISTER_MEMO]);
    const validTx2 = createMockTransaction([CREATE_CANISTER_MEMO]);
    const response = createResponse([validTx1, validTx2]);

    const filtered = filterCreateCanisterTransactions(response);
    expect(filtered).toHaveLength(2);
  });

  it('handles mixed valid/invalid transactions', () => {
    const validTx = createMockTransaction([CREATE_CANISTER_MEMO]);
    const invalidTx1 = createMockTransaction([]); // No memo
    const invalidTx2 = createMockTransaction([
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
    ]); // Wrong memo
    const response = createResponse([invalidTx1, validTx, invalidTx2]);

    const filtered = filterCreateCanisterTransactions(response);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toBe(validTx);
  });
});
