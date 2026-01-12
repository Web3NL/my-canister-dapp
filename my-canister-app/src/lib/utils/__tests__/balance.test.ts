import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasSufficientBalanceForCanisterCreation } from '../balance';

// Mock the CmcApi module for async function tests
vi.mock('$lib/api/cmc', () => ({
  CmcApi: {
    create: vi.fn(),
  },
}));

describe('hasSufficientBalanceForCanisterCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when balance > needed', async () => {
    const { CmcApi } = await import('$lib/api/cmc');
    const mockCmc = {
      getIcpToCyclesConversionRate: vi.fn().mockResolvedValue(50_000n),
    };
    vi.mocked(CmcApi.create).mockResolvedValue(mockCmc as never);

    // At rate 50000, 1T cycles needs ~20_000_000 e8s (0.2 ICP)
    const result = await hasSufficientBalanceForCanisterCreation(100_000_000n); // 1 ICP
    expect(result).toBe(true);
  });

  it('returns true when balance == needed', async () => {
    const { CmcApi } = await import('$lib/api/cmc');
    const mockCmc = {
      getIcpToCyclesConversionRate: vi.fn().mockResolvedValue(50_000n),
    };
    vi.mocked(CmcApi.create).mockResolvedValue(mockCmc as never);

    // At rate 50000, 1T cycles needs exactly 20_000_000 e8s
    const result = await hasSufficientBalanceForCanisterCreation(20_000_000n);
    expect(result).toBe(true);
  });

  it('returns false when balance < needed', async () => {
    const { CmcApi } = await import('$lib/api/cmc');
    const mockCmc = {
      getIcpToCyclesConversionRate: vi.fn().mockResolvedValue(50_000n),
    };
    vi.mocked(CmcApi.create).mockResolvedValue(mockCmc as never);

    // At rate 50000, 1T cycles needs ~20_000_000 e8s
    const result = await hasSufficientBalanceForCanisterCreation(10_000_000n); // 0.1 ICP
    expect(result).toBe(false);
  });
});
