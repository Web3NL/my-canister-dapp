import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Principal } from '@icp-sdk/core/principal';
import { MyCanisterDashboard } from '../src/dashboard';
import { LOW_CYCLES_THRESHOLD } from '../src/constants';

// Mock @icp-sdk/canisters/ic-management
vi.mock('@icp-sdk/canisters/ic-management', () => ({
  IcManagementCanister: {
    create: vi.fn(() => ({
      canisterStatus: vi.fn(),
    })),
  },
}));

// Mock the actor module to avoid import issues with declarations
vi.mock('../src/actor', () => ({
  MyDashboardBackend: {
    create: vi.fn(() => ({
      manageIIPrincipal: vi.fn(),
    })),
  },
}));

import { IcManagementCanister } from '@icp-sdk/canisters/ic-management';
import { MyDashboardBackend } from '../src/actor';

describe('MyCanisterDashboard', () => {
  const TEST_CANISTER_ID = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');

  const createMockAgent = () =>
    ({
      getPrincipal: vi.fn().mockResolvedValue(Principal.anonymous()),
      rootKey: new Uint8Array([]),
    }) as unknown as import('@icp-sdk/core/agent').HttpAgent;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new MyCanisterDashboard instance', () => {
      const agent = createMockAgent();

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);

      expect(dashboard).toBeInstanceOf(MyCanisterDashboard);
    });

    it('should create IcManagementCanister with the provided agent', () => {
      const agent = createMockAgent();

      MyCanisterDashboard.create(agent, TEST_CANISTER_ID);

      expect(IcManagementCanister.create).toHaveBeenCalledWith({ agent });
    });
  });

  describe('checkCyclesBalance', () => {
    it('should return ok with cycles when above threshold', async () => {
      const agent = createMockAgent();
      const mockCanisterStatus = vi.fn().mockResolvedValue({
        cycles: 2_000_000_000_000n, // 2 trillion cycles
      });
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance();

      expect(result).toEqual({ ok: 2_000_000_000_000n });
      expect(mockCanisterStatus).toHaveBeenCalledWith({
        canisterId: TEST_CANISTER_ID,
      });
    });

    it('should return ok with cycles equal to threshold', async () => {
      const agent = createMockAgent();
      const mockCanisterStatus = vi.fn().mockResolvedValue({
        cycles: LOW_CYCLES_THRESHOLD,
      });
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance();

      expect(result).toEqual({ ok: LOW_CYCLES_THRESHOLD });
    });

    it('should return error when cycles below default threshold', async () => {
      const agent = createMockAgent();
      const lowCycles = 500_000_000_000n; // 500 billion cycles
      const mockCanisterStatus = vi.fn().mockResolvedValue({
        cycles: lowCycles,
      });
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance();

      expect(result).toEqual({
        error: `Low cycles warning: ${lowCycles.toString()} cycles remaining (threshold: ${LOW_CYCLES_THRESHOLD.toString()})`,
      });
    });

    it('should use custom threshold when provided', async () => {
      const agent = createMockAgent();
      const customThreshold = 5_000_000_000_000n; // 5 trillion cycles
      const cycles = 3_000_000_000_000n; // 3 trillion cycles (below custom threshold)
      const mockCanisterStatus = vi.fn().mockResolvedValue({ cycles });
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance({
        threshold: customThreshold,
      });

      expect(result).toEqual({
        error: `Low cycles warning: ${cycles.toString()} cycles remaining (threshold: ${customThreshold.toString()})`,
      });
    });

    it('should return ok when cycles above custom threshold', async () => {
      const agent = createMockAgent();
      const customThreshold = 500_000_000_000n; // 500 billion cycles
      const cycles = 600_000_000_000n; // 600 billion cycles (above custom threshold)
      const mockCanisterStatus = vi.fn().mockResolvedValue({ cycles });
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance({
        threshold: customThreshold,
      });

      expect(result).toEqual({ ok: cycles });
    });

    it('should return error when canisterStatus throws', async () => {
      const agent = createMockAgent();
      const mockCanisterStatus = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance();

      expect(result).toEqual({ error: 'Error: Network error' });
    });

    it('should return error string for non-Error thrown values', async () => {
      const agent = createMockAgent();
      const mockCanisterStatus = vi.fn().mockRejectedValue('string error');
      vi.mocked(IcManagementCanister.create).mockReturnValue({
        canisterStatus: mockCanisterStatus,
      } as unknown as ReturnType<typeof IcManagementCanister.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.checkCyclesBalance();

      expect(result).toEqual({ error: 'string error' });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when manageIIPrincipal returns Ok', async () => {
      const agent = createMockAgent();
      const mockManageIIPrincipal = vi.fn().mockResolvedValue({ Ok: null });
      vi.mocked(MyDashboardBackend.create).mockReturnValue({
        manageIIPrincipal: mockManageIIPrincipal,
      } as unknown as ReturnType<typeof MyDashboardBackend.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.isAuthenticated();

      expect(result).toBe(true);
      expect(MyDashboardBackend.create).toHaveBeenCalledWith({
        agent,
        canisterId: TEST_CANISTER_ID,
      });
      expect(mockManageIIPrincipal).toHaveBeenCalledWith({ Get: null });
    });

    it('should return true when manageIIPrincipal returns Ok with principal', async () => {
      const agent = createMockAgent();
      const mockManageIIPrincipal = vi
        .fn()
        .mockResolvedValue({ Ok: TEST_CANISTER_ID });
      vi.mocked(MyDashboardBackend.create).mockReturnValue({
        manageIIPrincipal: mockManageIIPrincipal,
      } as unknown as ReturnType<typeof MyDashboardBackend.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when manageIIPrincipal returns Err', async () => {
      const agent = createMockAgent();
      const mockManageIIPrincipal = vi
        .fn()
        .mockResolvedValue({ Err: 'Not authenticated' });
      vi.mocked(MyDashboardBackend.create).mockReturnValue({
        manageIIPrincipal: mockManageIIPrincipal,
      } as unknown as ReturnType<typeof MyDashboardBackend.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false when manageIIPrincipal throws', async () => {
      const agent = createMockAgent();
      const mockManageIIPrincipal = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));
      vi.mocked(MyDashboardBackend.create).mockReturnValue({
        manageIIPrincipal: mockManageIIPrincipal,
      } as unknown as ReturnType<typeof MyDashboardBackend.create>);

      const dashboard = MyCanisterDashboard.create(agent, TEST_CANISTER_ID);
      const result = await dashboard.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
