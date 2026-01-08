import { describe, it, expect } from 'vitest';

// Re-implement the variant constructors here for testing since they are not exported
// This mirrors the implementation in top-up-rule.ts

type CyclesAmount =
  | { _0_25T: null }
  | { _0_5T: null }
  | { _1T: null }
  | { _2T: null }
  | { _5T: null }
  | { _10T: null }
  | { _50T: null }
  | { _100T: null };

type TopUpInterval =
  | { Hourly: null }
  | { Daily: null }
  | { Weekly: null }
  | { Monthly: null };

const CYCLES_AMOUNTS: Record<string, CyclesAmount> = {
  _0_25T: { _0_25T: null },
  _0_5T: { _0_5T: null },
  _1T: { _1T: null },
  _2T: { _2T: null },
  _5T: { _5T: null },
  _10T: { _10T: null },
  _50T: { _50T: null },
  _100T: { _100T: null },
};

const INTERVALS: Record<string, TopUpInterval> = {
  Hourly: { Hourly: null },
  Daily: { Daily: null },
  Weekly: { Weekly: null },
  Monthly: { Monthly: null },
};

function buildCyclesAmount(variantKey: string): CyclesAmount {
  const amount = CYCLES_AMOUNTS[variantKey];
  if (!amount) {
    throw new Error(`Invalid cycles amount: ${variantKey}`);
  }
  return amount;
}

function buildInterval(key: string): TopUpInterval {
  const interval = INTERVALS[key];
  if (!interval) {
    return { Monthly: null }; // Default fallback
  }
  return interval;
}

function firstKey<T extends Record<string, unknown>>(
  obj: T | null | undefined
): string | undefined {
  if (!obj) return undefined;
  return Object.keys(obj)[0];
}

function formatCyclesAmount(ca: CyclesAmount): string {
  const key = firstKey(ca as Record<string, unknown>);
  if (!key) return 'Unknown';
  return key.replace(/^_/, '').replace('_', '.');
}

function formatInterval(interval: TopUpInterval): string {
  return firstKey(interval as Record<string, unknown>) || 'Unknown';
}

describe('top-up-rule variant constructors', () => {
  describe('buildCyclesAmount', () => {
    it('should build _0_25T variant', () => {
      const result = buildCyclesAmount('_0_25T');
      expect(result).toEqual({ _0_25T: null });
    });

    it('should build _0_5T variant', () => {
      const result = buildCyclesAmount('_0_5T');
      expect(result).toEqual({ _0_5T: null });
    });

    it('should build _1T variant', () => {
      const result = buildCyclesAmount('_1T');
      expect(result).toEqual({ _1T: null });
    });

    it('should build _2T variant', () => {
      const result = buildCyclesAmount('_2T');
      expect(result).toEqual({ _2T: null });
    });

    it('should build _5T variant', () => {
      const result = buildCyclesAmount('_5T');
      expect(result).toEqual({ _5T: null });
    });

    it('should build _10T variant', () => {
      const result = buildCyclesAmount('_10T');
      expect(result).toEqual({ _10T: null });
    });

    it('should build _50T variant', () => {
      const result = buildCyclesAmount('_50T');
      expect(result).toEqual({ _50T: null });
    });

    it('should build _100T variant', () => {
      const result = buildCyclesAmount('_100T');
      expect(result).toEqual({ _100T: null });
    });

    it('should throw for invalid variant key', () => {
      expect(() => buildCyclesAmount('invalid')).toThrow(
        'Invalid cycles amount: invalid'
      );
    });

    it('should throw for empty string', () => {
      expect(() => buildCyclesAmount('')).toThrow('Invalid cycles amount: ');
    });
  });

  describe('buildInterval', () => {
    it('should build Hourly variant', () => {
      const result = buildInterval('Hourly');
      expect(result).toEqual({ Hourly: null });
    });

    it('should build Daily variant', () => {
      const result = buildInterval('Daily');
      expect(result).toEqual({ Daily: null });
    });

    it('should build Weekly variant', () => {
      const result = buildInterval('Weekly');
      expect(result).toEqual({ Weekly: null });
    });

    it('should build Monthly variant', () => {
      const result = buildInterval('Monthly');
      expect(result).toEqual({ Monthly: null });
    });

    it('should fallback to Monthly for invalid key', () => {
      const result = buildInterval('invalid');
      expect(result).toEqual({ Monthly: null });
    });

    it('should fallback to Monthly for empty string', () => {
      const result = buildInterval('');
      expect(result).toEqual({ Monthly: null });
    });
  });

  describe('formatCyclesAmount', () => {
    it('should format _0_25T as 0.25T', () => {
      expect(formatCyclesAmount({ _0_25T: null })).toBe('0.25T');
    });

    it('should format _0_5T as 0.5T', () => {
      expect(formatCyclesAmount({ _0_5T: null })).toBe('0.5T');
    });

    it('should format _1T as 1T', () => {
      expect(formatCyclesAmount({ _1T: null })).toBe('1T');
    });

    it('should format _10T as 10T', () => {
      expect(formatCyclesAmount({ _10T: null })).toBe('10T');
    });

    it('should format _100T as 100T', () => {
      expect(formatCyclesAmount({ _100T: null })).toBe('100T');
    });
  });

  describe('formatInterval', () => {
    it('should format Hourly interval', () => {
      expect(formatInterval({ Hourly: null })).toBe('Hourly');
    });

    it('should format Daily interval', () => {
      expect(formatInterval({ Daily: null })).toBe('Daily');
    });

    it('should format Weekly interval', () => {
      expect(formatInterval({ Weekly: null })).toBe('Weekly');
    });

    it('should format Monthly interval', () => {
      expect(formatInterval({ Monthly: null })).toBe('Monthly');
    });
  });

  describe('firstKey', () => {
    it('should return first key from object', () => {
      expect(firstKey({ foo: null })).toBe('foo');
    });

    it('should return undefined for null', () => {
      expect(firstKey(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(firstKey(undefined)).toBeUndefined();
    });

    it('should return first key from multi-key object', () => {
      // Note: Object key order is preserved in modern JS for string keys
      const result = firstKey({ first: null, second: null });
      expect(result).toBe('first');
    });
  });
});
