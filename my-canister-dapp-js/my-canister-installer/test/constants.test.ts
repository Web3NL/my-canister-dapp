import { describe, it, expect } from 'vitest';
import { E8S_PER_TOKEN } from '../src/constants';

describe('E8S_PER_TOKEN', () => {
  it('equals 100_000_000n (1 ICP = 100 million e8s)', () => {
    expect(E8S_PER_TOKEN).toBe(100_000_000n);
  });

  it('is a bigint', () => {
    expect(typeof E8S_PER_TOKEN).toBe('bigint');
  });
});
