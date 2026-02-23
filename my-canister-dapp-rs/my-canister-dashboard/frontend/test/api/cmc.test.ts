import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Principal } from '@icp-sdk/core/principal';

// Mock the utils module
vi.mock('../../src/utils', () => ({
  createHttpAgent: vi.fn(),
}));

// Mock the error module
vi.mock('../../src/error', () => ({
  reportError: vi.fn(),
  NETWORK_ERROR_MESSAGE: 'Network error occurred. Please try again.',
}));

// Mock the constants module
vi.mock('../../src/constants', () => ({
  CMC_CANISTER_ID: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
}));

// Mock @icp-sdk/canisters/cmc
vi.mock('@icp-sdk/canisters/cmc', () => ({
  CmcCanister: {
    create: vi.fn(),
  },
}));

import { createHttpAgent } from '../../src/utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../../src/error';
import { CmcCanister } from '@icp-sdk/canisters/cmc';
import { CMCApi } from '../../src/api/cmc';

describe('CMCApi', () => {
  const TEST_CANISTER_ID = 'rdmx6-jaaaa-aaaaa-aaadq-cai';
  const CMC_CANISTER_ID = 'rkp4c-7iaaa-aaaaa-aaaca-cai';

  const createMockAgent = () => ({
    getPrincipal: vi.fn().mockResolvedValue(Principal.anonymous()),
    rootKey: new Uint8Array([]),
  });

  const createMockCmc = () => ({
    notifyTopUp: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('notifyTopUp', () => {
    it('should notify CMC of top-up and return cycles', async () => {
      const mockAgent = createMockAgent();
      const mockCmc = createMockCmc();
      const blockIndex = 12345n;
      const expectedCycles = 1_000_000_000_000n;

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(CmcCanister.create).mockReturnValue(mockCmc as never);
      mockCmc.notifyTopUp.mockResolvedValue(expectedCycles);

      const api = new CMCApi();
      const result = await api.notifyTopUp(TEST_CANISTER_ID, blockIndex);

      expect(result).toBe(expectedCycles);
      expect(CmcCanister.create).toHaveBeenCalledWith({
        agent: mockAgent,
        canisterId: Principal.fromText(CMC_CANISTER_ID),
      });
      expect(mockCmc.notifyTopUp).toHaveBeenCalledWith({
        canister_id: Principal.fromText(TEST_CANISTER_ID),
        block_index: blockIndex,
      });
    });

    it('should work with different canister IDs', async () => {
      const mockAgent = createMockAgent();
      const mockCmc = createMockCmc();
      const differentCanisterId = 'aaaaa-aa';
      const blockIndex = 999n;
      const expectedCycles = 500_000_000_000n;

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(CmcCanister.create).mockReturnValue(mockCmc as never);
      mockCmc.notifyTopUp.mockResolvedValue(expectedCycles);

      const api = new CMCApi();
      const result = await api.notifyTopUp(differentCanisterId, blockIndex);

      expect(result).toBe(expectedCycles);
      expect(mockCmc.notifyTopUp).toHaveBeenCalledWith({
        canister_id: Principal.fromText(differentCanisterId),
        block_index: blockIndex,
      });
    });

    it('should report error and rethrow on failure', async () => {
      const mockAgent = createMockAgent();
      const mockCmc = createMockCmc();
      const error = new Error('CMC notification failed');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(CmcCanister.create).mockReturnValue(mockCmc as never);
      mockCmc.notifyTopUp.mockRejectedValue(error);

      const api = new CMCApi();

      await expect(api.notifyTopUp(TEST_CANISTER_ID, 123n)).rejects.toThrow(
        'CMC notification failed'
      );
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });

    it('should report error when agent creation fails', async () => {
      const error = new Error('Agent creation failed');

      vi.mocked(createHttpAgent).mockRejectedValue(error);

      const api = new CMCApi();

      await expect(api.notifyTopUp(TEST_CANISTER_ID, 123n)).rejects.toThrow(
        'Agent creation failed'
      );
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });
});
