import { describe, it, expect } from 'vitest';
import { LOW_CYCLES_THRESHOLD } from '../src/constants';

describe('constants', () => {
  describe('LOW_CYCLES_THRESHOLD', () => {
    it('should be 1 trillion cycles', () => {
      expect(LOW_CYCLES_THRESHOLD).toBe(1_000_000_000_000n);
    });

    it('should be a bigint', () => {
      expect(typeof LOW_CYCLES_THRESHOLD).toBe('bigint');
    });

    it('should be exported from index', async () => {
      const { LOW_CYCLES_THRESHOLD: exported } = await import('../src/index');
      expect(exported).toBe(LOW_CYCLES_THRESHOLD);
    });
  });
});
