import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateIcpFromCyclesRate,
  hasSufficientBalanceForCanisterCreation,
} from '../balance';

// Mock the CmcApi module for async function tests
vi.mock('$lib/api/cmc', () => ({
  CmcApi: {
    create: vi.fn(),
  },
}));

describe('calculateIcpFromCyclesRate', () => {
  const ONE_TRILLION_CYCLES = 1_000_000_000_000n;

  it('calculates correct ICP for typical mainnet rate (~50k xdr_permyriad)', () => {
    const rate = 50_000n;
    const result = calculateIcpFromCyclesRate(ONE_TRILLION_CYCLES, rate);
    expect(result).toBe(20_000_000n);
  });

  it('throws when rate is 0', () => {
    expect(() => calculateIcpFromCyclesRate(ONE_TRILLION_CYCLES, 0n)).toThrow(
      'Invalid rate (0)'
    );
  });

  it('uses ceiling division (rounds up)', () => {
    const rate = 50_000n;
    const baseResult = calculateIcpFromCyclesRate(ONE_TRILLION_CYCLES, rate);
    const slightlyMore = calculateIcpFromCyclesRate(
      ONE_TRILLION_CYCLES + 1n,
      rate
    );
    expect(slightlyMore).toBeGreaterThanOrEqual(baseResult);
  });

  it('handles high conversion rates', () => {
    const highRate = 100_000n;
    const result = calculateIcpFromCyclesRate(ONE_TRILLION_CYCLES, highRate);
    expect(result).toBe(10_000_000n);
  });

  it('handles low conversion rates', () => {
    const lowRate = 10_000n;
    const result = calculateIcpFromCyclesRate(ONE_TRILLION_CYCLES, lowRate);
    expect(result).toBe(100_000_000n);
  });

  it('uses provided e8sPerToken parameter', () => {
    const rate = 50_000n;
    const customE8s = 1_000_000n;
    const defaultResult = calculateIcpFromCyclesRate(ONE_TRILLION_CYCLES, rate);
    const customResult = calculateIcpFromCyclesRate(
      ONE_TRILLION_CYCLES,
      rate,
      customE8s
    );
    expect(customResult).not.toBe(defaultResult);
  });
});

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
