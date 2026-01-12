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

// Mock @web3nl/my-canister-dashboard
vi.mock('@web3nl/my-canister-dashboard', () => ({
  createMyCanisterActor: vi.fn(),
}));

import { createHttpAgent, canisterId } from '../../src/utils';
import { reportError, NETWORK_ERROR_MESSAGE } from '../../src/error';
import { createMyCanisterActor } from '@web3nl/my-canister-dashboard';
import { CanisterApi } from '../../src/api/canister';

describe('CanisterApi', () => {
  const TEST_CANISTER_ID = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');

  const createMockAgent = () => ({
    getPrincipal: vi.fn().mockResolvedValue(Principal.anonymous()),
    rootKey: new Uint8Array([]),
  });

  const createMockActor = () => ({
    manage_alternative_origins: vi.fn(),
    manage_top_up_rule: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(canisterId).mockReturnValue(TEST_CANISTER_ID);
  });

  describe('constructor', () => {
    it('should initialize actor asynchronously', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);

      const api = new CanisterApi();

      // Wait for initialization by calling a method
      mockActor.manage_alternative_origins.mockResolvedValue({ Ok: [] });
      await api.manageAlternativeOrigins({ List: null });

      expect(createHttpAgent).toHaveBeenCalled();
      expect(canisterId).toHaveBeenCalled();
      expect(createMyCanisterActor).toHaveBeenCalledWith({
        agent: mockAgent,
        canisterId: TEST_CANISTER_ID,
      });
    });
  });

  describe('manageAlternativeOrigins', () => {
    it('should list alternative origins', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();
      const expectedOrigins = ['https://example.com', 'https://test.com'];

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_alternative_origins.mockResolvedValue({
        Ok: expectedOrigins,
      });

      const api = new CanisterApi();
      const result = await api.manageAlternativeOrigins({ List: null });

      expect(result).toEqual({ Ok: expectedOrigins });
      expect(mockActor.manage_alternative_origins).toHaveBeenCalledWith({
        List: null,
      });
    });

    it('should add alternative origin', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_alternative_origins.mockResolvedValue({ Ok: null });

      const api = new CanisterApi();
      const result = await api.manageAlternativeOrigins({
        Add: 'https://neworigin.com',
      });

      expect(result).toEqual({ Ok: null });
      expect(mockActor.manage_alternative_origins).toHaveBeenCalledWith({
        Add: 'https://neworigin.com',
      });
    });

    it('should remove alternative origin', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_alternative_origins.mockResolvedValue({ Ok: null });

      const api = new CanisterApi();
      const result = await api.manageAlternativeOrigins({
        Remove: 'https://oldorigin.com',
      });

      expect(result).toEqual({ Ok: null });
      expect(mockActor.manage_alternative_origins).toHaveBeenCalledWith({
        Remove: 'https://oldorigin.com',
      });
    });

    it('should return error result when operation fails', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_alternative_origins.mockResolvedValue({
        Err: 'Maximum origins reached',
      });

      const api = new CanisterApi();
      const result = await api.manageAlternativeOrigins({
        Add: 'https://toomany.com',
      });

      expect(result).toEqual({ Err: 'Maximum origins reached' });
    });

    it('should report error and rethrow on network failure', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();
      const error = new Error('Network timeout');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_alternative_origins.mockRejectedValue(error);

      const api = new CanisterApi();

      await expect(
        api.manageAlternativeOrigins({ List: null })
      ).rejects.toThrow('Network timeout');
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });

  describe('manageTopUpRule', () => {
    it('should get current top-up rule', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();
      const expectedRule = {
        Ok: {
          Enabled: {
            threshold: { TCycles: 1n },
            amount: { TCycles: 5n },
            interval: { Hours: 24n },
          },
        },
      };

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_top_up_rule.mockResolvedValue(expectedRule);

      const api = new CanisterApi();
      const result = await api.manageTopUpRule({ Get: null });

      expect(result).toEqual(expectedRule);
      expect(mockActor.manage_top_up_rule).toHaveBeenCalledWith({ Get: null });
    });

    it('should set top-up rule', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();
      const newRule = {
        threshold: { TCycles: 2n },
        amount: { TCycles: 10n },
        interval: { Minutes: 60n },
      };

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_top_up_rule.mockResolvedValue({ Ok: null });

      const api = new CanisterApi();
      const result = await api.manageTopUpRule({ Set: newRule });

      expect(result).toEqual({ Ok: null });
      expect(mockActor.manage_top_up_rule).toHaveBeenCalledWith({
        Set: newRule,
      });
    });

    it('should disable top-up rule', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_top_up_rule.mockResolvedValue({ Ok: null });

      const api = new CanisterApi();
      const result = await api.manageTopUpRule({ Disable: null });

      expect(result).toEqual({ Ok: null });
      expect(mockActor.manage_top_up_rule).toHaveBeenCalledWith({
        Disable: null,
      });
    });

    it('should return disabled state', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_top_up_rule.mockResolvedValue({
        Ok: { Disabled: null },
      });

      const api = new CanisterApi();
      const result = await api.manageTopUpRule({ Get: null });

      expect(result).toEqual({ Ok: { Disabled: null } });
    });

    it('should report error and rethrow on failure', async () => {
      const mockAgent = createMockAgent();
      const mockActor = createMockActor();
      const error = new Error('Not authorized');

      vi.mocked(createHttpAgent).mockResolvedValue(mockAgent as never);
      vi.mocked(createMyCanisterActor).mockReturnValue(mockActor as never);
      mockActor.manage_top_up_rule.mockRejectedValue(error);

      const api = new CanisterApi();

      await expect(api.manageTopUpRule({ Get: null })).rejects.toThrow(
        'Not authorized'
      );
      expect(reportError).toHaveBeenCalledWith(NETWORK_ERROR_MESSAGE, error);
    });
  });
});
