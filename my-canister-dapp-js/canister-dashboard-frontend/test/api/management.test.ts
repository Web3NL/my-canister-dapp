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

// Mock @icp-sdk/canisters/ic-management
vi.mock('@icp-sdk/canisters/ic-management', () => ({
  IcManagementCanister: {
    create: vi.fn(),
  },
}));

import { createHttpAgent, canisterId } from '../../src/utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../../src/error';
import { IcManagementCanister } from '@icp-sdk/canisters/ic-management';
import { ManagementApi } from '../../src/api/management';

describe('ManagementApi', () => {
  const TEST_CANISTER_ID = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');

  const createMockAgent = () => ({
    getPrincipal: vi.fn().mockResolvedValue(Principal.anonymous()),
    rootKey: new Uint8Array([]),
  });

  const createMockManagement = () => ({
    canisterStatus: vi.fn(),
    updateSettings: vi.fn(),
    fetchCanisterLogs: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canisterId).mockReturnValue(TEST_CANISTER_ID);
  });

  describe('getCanisterStatus', () => {
    it('should return canister status', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const expectedStatus = {
        status: { running: null },
        memory_size: 1_000_000n,
        cycles: 5_000_000_000_000n,
        settings: {
          controllers: [TEST_CANISTER_ID.toString()],
          compute_allocation: 0n,
          memory_allocation: 0n,
          freezing_threshold: 2_592_000n,
        },
        module_hash: [],
        idle_cycles_burned_per_day: 0n,
      };

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.canisterStatus.mockResolvedValue(expectedStatus);

      const api = new ManagementApi();
      const result = await api.getCanisterStatus();

      expect(result).toBe(expectedStatus);
      expect(IcManagementCanister.create).toHaveBeenCalledWith({
        agent: mockAgent,
      });
      expect(mockManagement.canisterStatus).toHaveBeenCalledWith({
        canisterId: TEST_CANISTER_ID,
      });
    });

    it('should report error and rethrow on failure', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const error = new Error('Canister status unavailable');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.canisterStatus.mockRejectedValue(error);

      const api = new ManagementApi();

      await expect(api.getCanisterStatus()).rejects.toThrow(
        'Canister status unavailable'
      );
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });

  describe('updateControllers', () => {
    it('should update canister controllers', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const newControllers = [
        Principal.fromText('aaaaa-aa'),
        Principal.fromText('2vxsx-fae'),
      ];

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.updateSettings.mockResolvedValue(undefined);

      const api = new ManagementApi();
      await api.updateControllers(newControllers);

      expect(mockManagement.updateSettings).toHaveBeenCalledWith({
        canisterId: TEST_CANISTER_ID,
        settings: {
          controllers: newControllers.map((c) => c.toString()),
        },
      });
    });

    it('should handle empty controllers array', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.updateSettings.mockResolvedValue(undefined);

      const api = new ManagementApi();
      await api.updateControllers([]);

      expect(mockManagement.updateSettings).toHaveBeenCalledWith({
        canisterId: TEST_CANISTER_ID,
        settings: {
          controllers: [],
        },
      });
    });

    it('should report error and rethrow on failure', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const error = new Error('Not authorized to update settings');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.updateSettings.mockRejectedValue(error);

      const api = new ManagementApi();

      await expect(
        api.updateControllers([Principal.fromText('aaaaa-aa')])
      ).rejects.toThrow('Not authorized to update settings');
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });

  describe('getCanisterLogs', () => {
    it('should return canister logs', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const expectedLogs = {
        canister_log_records: [
          {
            idx: 0n,
            timestamp_nanos: 1234567890n,
            content: new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
          },
        ],
      };

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.fetchCanisterLogs.mockResolvedValue(expectedLogs);

      const api = new ManagementApi();
      const result = await api.getCanisterLogs();

      expect(result).toBe(expectedLogs);
      expect(mockManagement.fetchCanisterLogs).toHaveBeenCalledWith(
        TEST_CANISTER_ID
      );
    });

    it('should return empty logs array', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const emptyLogs = {
        canister_log_records: [],
      };

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.fetchCanisterLogs.mockResolvedValue(emptyLogs);

      const api = new ManagementApi();
      const result = await api.getCanisterLogs();

      expect(result.canister_log_records).toEqual([]);
    });

    it('should report error and rethrow on failure', async () => {
      const mockAgent = createMockAgent();
      const mockManagement = createMockManagement();
      const error = new Error('Logs not available');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(IcManagementCanister.create).mockReturnValue(
        mockManagement as never
      );
      mockManagement.fetchCanisterLogs.mockRejectedValue(error);

      const api = new ManagementApi();

      await expect(api.getCanisterLogs()).rejects.toThrow('Logs not available');
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });
});
