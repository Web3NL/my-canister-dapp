import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Principal } from '@icp-sdk/core/principal';

// Mock the utils module
vi.mock('../../src/utils', () => ({
  createHttpAgent: vi.fn(),
  canisterId: vi.fn(),
}));

// Mock the error module
vi.mock('../../src/error', () => ({
  reportError: vi.fn(),
  NETWORK_ERROR_MESSAGE: 'Network error occurred. Please try again.',
}));

// Mock @icp-sdk/canisters/ledger/icp
vi.mock('@icp-sdk/canisters/ledger/icp', () => ({
  IcpLedgerCanister: {
    create: vi.fn(),
  },
  AccountIdentifier: {
    fromPrincipal: vi.fn(),
  },
}));

import { createHttpAgent, canisterId } from '../../src/utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../../src/error';
import {
  IcpLedgerCanister,
  AccountIdentifier,
} from '@icp-sdk/canisters/ledger/icp';
import { LedgerApi } from '../../src/api/ledger';

describe('LedgerApi', () => {
  const TEST_CANISTER_ID = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');
  const TEST_USER_PRINCIPAL = Principal.fromText('aaaaa-aa');

  const createMockAgent = () => ({
    getPrincipal: vi.fn().mockResolvedValue(TEST_USER_PRINCIPAL),
    rootKey: new Uint8Array([]),
  });

  const createMockLedger = () => ({
    accountBalance: vi.fn(),
    icrc1Transfer: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('balance', () => {
    it('should return user account balance', async () => {
      const mockAgent = createMockAgent();
      const mockLedger = createMockLedger();
      const mockAccountId = { toHex: () => 'abc123' };
      const expectedBalance = 1_000_000_000n;

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(AccountIdentifier.fromPrincipal).mockReturnValue(
        mockAccountId as never
      );
      vi.mocked(IcpLedgerCanister.create).mockReturnValue(mockLedger as never);
      mockLedger.accountBalance.mockResolvedValue(expectedBalance);

      const api = new LedgerApi();
      const result = await api.balance();

      expect(result).toBe(expectedBalance);
      expect(createHttpAgent).toHaveBeenCalled();
      expect(mockAgent.getPrincipal).toHaveBeenCalled();
      expect(AccountIdentifier.fromPrincipal).toHaveBeenCalledWith({
        principal: TEST_USER_PRINCIPAL,
      });
      expect(mockLedger.accountBalance).toHaveBeenCalledWith({
        accountIdentifier: mockAccountId,
      });
    });

    it('should report error and rethrow on failure', async () => {
      const mockAgent = createMockAgent();
      const error = new Error('Network failure');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      mockAgent.getPrincipal.mockRejectedValue(error);

      const api = new LedgerApi();

      await expect(api.balance()).rejects.toThrow('Network failure');
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });

  describe('canisterBalance', () => {
    it('should return canister account balance', async () => {
      const mockAgent = createMockAgent();
      const mockLedger = createMockLedger();
      const mockAccountId = { toHex: () => 'canister-account' };
      const expectedBalance = 500_000_000n;

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(canisterId).mockReturnValue(TEST_CANISTER_ID);
      vi.mocked(AccountIdentifier.fromPrincipal).mockReturnValue(
        mockAccountId as never
      );
      vi.mocked(IcpLedgerCanister.create).mockReturnValue(mockLedger as never);
      mockLedger.accountBalance.mockResolvedValue(expectedBalance);

      const api = new LedgerApi();
      const result = await api.canisterBalance();

      expect(result).toBe(expectedBalance);
      expect(canisterId).toHaveBeenCalled();
      expect(AccountIdentifier.fromPrincipal).toHaveBeenCalledWith({
        principal: TEST_CANISTER_ID,
      });
    });

    it('should report error and rethrow on failure', async () => {
      const error = new Error('Ledger unavailable');

      vi.mocked(canisterId).mockImplementation(() => {
        throw error;
      });

      const api = new LedgerApi();

      await expect(api.canisterBalance()).rejects.toThrow('Ledger unavailable');
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });

  describe('transfer', () => {
    it('should transfer ICP using icrc1Transfer', async () => {
      const mockAgent = createMockAgent();
      const mockLedger = createMockLedger();
      const expectedBlockIndex = 12345n;
      const toPrincipal = TEST_CANISTER_ID;
      const subAccount = new Uint8Array(32);
      const amount = 100_000_000n;
      const memo = new Uint8Array([0x54, 0x50, 0x55, 0x50]);
      const fee = 10_000n;

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcpLedgerCanister.create).mockReturnValue(mockLedger as never);
      mockLedger.icrc1Transfer.mockResolvedValue(expectedBlockIndex);

      const api = new LedgerApi();
      const result = await api.transfer(
        toPrincipal,
        subAccount,
        amount,
        memo,
        fee
      );

      expect(result).toBe(expectedBlockIndex);
      expect(mockLedger.icrc1Transfer).toHaveBeenCalledWith({
        to: {
          owner: toPrincipal,
          subaccount: [subAccount],
        },
        amount,
        icrc1Memo: memo,
        fee,
      });
    });

    it('should report error and rethrow on transfer failure', async () => {
      const mockAgent = createMockAgent();
      const mockLedger = createMockLedger();
      const error = new Error('Insufficient funds');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcpLedgerCanister.create).mockReturnValue(mockLedger as never);
      mockLedger.icrc1Transfer.mockRejectedValue(error);

      const api = new LedgerApi();

      await expect(
        api.transfer(
          TEST_CANISTER_ID,
          new Uint8Array(32),
          100n,
          new Uint8Array([]),
          10_000n
        )
      ).rejects.toThrow('Insufficient funds');
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });
});
