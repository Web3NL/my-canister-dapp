import { describe, it, expect } from 'vitest';
import { formatIcpBalance } from '../format';

describe('formatIcpBalance', () => {
  it('formats 0 balance as "0.00000000 ICP"', () => {
    expect(formatIcpBalance(0n)).toBe('0.00000000 ICP');
  });

  it('formats 1 ICP (100_000_000 e8s) as "1.00000000 ICP"', () => {
    expect(formatIcpBalance(100_000_000n)).toBe('1.00000000 ICP');
  });

  it('formats fractional amounts correctly', () => {
    // 0.5 ICP = 50_000_000 e8s
    expect(formatIcpBalance(50_000_000n)).toBe('0.50000000 ICP');
    // 0.00000001 ICP = 1 e8s
    expect(formatIcpBalance(1n)).toBe('0.00000001 ICP');
    // 1.23456789 ICP
    expect(formatIcpBalance(123_456_789n)).toBe('1.23456789 ICP');
  });

  it('formats large balances (1000+ ICP)', () => {
    // 1000 ICP
    expect(formatIcpBalance(100_000_000_000n)).toBe('1000.00000000 ICP');
    // 1,234,567.89 ICP
    expect(formatIcpBalance(123_456_789_000_000n)).toBe('1234567.89000000 ICP');
  });

  it('always shows 8 decimal places', () => {
    const result = formatIcpBalance(100_000_000n);
    const decimalPart = result.split('.')[1]?.split(' ')[0];
    expect(decimalPart).toHaveLength(8);
  });

  it('handles bigint input', () => {
    const largeBalance = BigInt('10000000000000000'); // 100M ICP
    const result = formatIcpBalance(largeBalance);
    expect(result).toContain('ICP');
    expect(result).toContain('100000000');
  });
});
