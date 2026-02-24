import { describe, it, expect } from 'vitest';
import {
  MAX_TIME_TO_LIVE,
  CMC_CANISTER_ID,
  ICP_TX_FEE,
  E8S,
  TPUP_MEMO,
} from '../src/constants';

describe('constants', () => {
  describe('MAX_TIME_TO_LIVE', () => {
    it('should be 15 minutes in nanoseconds', () => {
      const fifteenMinutesInNanos = BigInt(15) * BigInt(60) * BigInt(1_000_000_000);
      expect(MAX_TIME_TO_LIVE).toBe(fifteenMinutesInNanos);
    });

    it('should be a bigint', () => {
      expect(typeof MAX_TIME_TO_LIVE).toBe('bigint');
    });
  });

  describe('CMC_CANISTER_ID', () => {
    it('should be the correct CMC canister ID', () => {
      expect(CMC_CANISTER_ID).toBe('rkp4c-7iaaa-aaaaa-aaaca-cai');
    });

    it('should be a string', () => {
      expect(typeof CMC_CANISTER_ID).toBe('string');
    });
  });

  describe('ICP_TX_FEE', () => {
    it('should be 10000 e8s (0.0001 ICP)', () => {
      expect(ICP_TX_FEE).toBe(BigInt(10000));
    });

    it('should be a bigint', () => {
      expect(typeof ICP_TX_FEE).toBe('bigint');
    });
  });

  describe('E8S', () => {
    it('should be 100 million (10^8)', () => {
      expect(E8S).toBe(100_000_000);
    });

    it('should be a number', () => {
      expect(typeof E8S).toBe('number');
    });
  });

  describe('TPUP_MEMO', () => {
    it('should be a Uint8Array', () => {
      expect(TPUP_MEMO).toBeInstanceOf(Uint8Array);
    });

    it('should have 8 bytes', () => {
      expect(TPUP_MEMO.length).toBe(8);
    });

    it('should spell TPUP in first 4 bytes', () => {
      // T = 0x54, P = 0x50, U = 0x55, P = 0x50
      expect(TPUP_MEMO[0]).toBe(0x54);
      expect(TPUP_MEMO[1]).toBe(0x50);
      expect(TPUP_MEMO[2]).toBe(0x55);
      expect(TPUP_MEMO[3]).toBe(0x50);
    });

    it('should have zeros in last 4 bytes', () => {
      expect(TPUP_MEMO[4]).toBe(0x00);
      expect(TPUP_MEMO[5]).toBe(0x00);
      expect(TPUP_MEMO[6]).toBe(0x00);
      expect(TPUP_MEMO[7]).toBe(0x00);
    });
  });
});
