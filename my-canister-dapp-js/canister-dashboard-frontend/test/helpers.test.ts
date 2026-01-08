import { describe, it, expect } from 'vitest';
import { Principal } from '@dfinity/principal';
import {
  principalToSubaccount,
  formatMemorySize,
  formatCycles,
  formatIcpBalance,
} from '../src/helpers';

describe('helpers', () => {
  describe('principalToSubaccount', () => {
    it('should convert a principal to a 32-byte subaccount', () => {
      const principal = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');
      const subaccount = principalToSubaccount(principal);

      expect(subaccount).toBeInstanceOf(Uint8Array);
      expect(subaccount.length).toBe(32);
    });

    it('should set the first byte to the principal length', () => {
      const principal = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');
      const principalBytes = principal.toUint8Array();
      const subaccount = principalToSubaccount(principal);

      expect(subaccount[0]).toBe(principalBytes.length);
    });

    it('should copy principal bytes starting from byte 1', () => {
      const principal = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');
      const principalBytes = principal.toUint8Array();
      const subaccount = principalToSubaccount(principal);

      for (let i = 0; i < principalBytes.length; i++) {
        expect(subaccount[i + 1]).toBe(principalBytes[i]);
      }
    });

    it('should zero-pad remaining bytes', () => {
      const principal = Principal.fromText('rdmx6-jaaaa-aaaaa-aaadq-cai');
      const principalBytes = principal.toUint8Array();
      const subaccount = principalToSubaccount(principal);

      for (let i = principalBytes.length + 1; i < 32; i++) {
        expect(subaccount[i]).toBe(0);
      }
    });

    it('should handle anonymous principal', () => {
      const principal = Principal.anonymous();
      const subaccount = principalToSubaccount(principal);

      expect(subaccount).toBeInstanceOf(Uint8Array);
      expect(subaccount.length).toBe(32);
      expect(subaccount[0]).toBe(1); // Anonymous principal is 1 byte (0x04)
    });
  });

  describe('formatMemorySize', () => {
    it('should format bytes to MB with 2 decimal places', () => {
      const bytes = BigInt(1024 * 1024); // 1 MB
      expect(formatMemorySize(bytes)).toBe('1.00 MB');
    });

    it('should format partial MB correctly', () => {
      const bytes = BigInt(1024 * 1024 * 2.5);
      expect(formatMemorySize(bytes)).toBe('2.50 MB');
    });

    it('should format small values', () => {
      const bytes = BigInt(512 * 1024); // 0.5 MB
      expect(formatMemorySize(bytes)).toBe('0.50 MB');
    });

    it('should format large values', () => {
      const bytes = BigInt(1024 * 1024 * 1024); // 1 GB = 1024 MB
      expect(formatMemorySize(bytes)).toBe('1024.00 MB');
    });

    it('should handle zero', () => {
      expect(formatMemorySize(BigInt(0))).toBe('0.00 MB');
    });

    it('should handle negative values as zero', () => {
      expect(formatMemorySize(BigInt(-100))).toBe('0.00 MB');
    });
  });

  describe('formatCycles', () => {
    it('should format cycles to trillions with 2 decimal places', () => {
      const cycles = BigInt(1_000_000_000_000); // 1 T
      expect(formatCycles(cycles)).toBe('1.00 T');
    });

    it('should format partial trillions correctly', () => {
      const cycles = BigInt(500_000_000_000); // 0.5 T
      expect(formatCycles(cycles)).toBe('0.50 T');
    });

    it('should format large values', () => {
      const cycles = BigInt(10_000_000_000_000); // 10 T
      expect(formatCycles(cycles)).toBe('10.00 T');
    });

    it('should handle zero', () => {
      expect(formatCycles(BigInt(0))).toBe('0.00 T');
    });

    it('should handle negative values as zero', () => {
      expect(formatCycles(BigInt(-100))).toBe('0.00 T');
    });

    it('should format small amounts', () => {
      const cycles = BigInt(100_000_000_000); // 0.1 T
      expect(formatCycles(cycles)).toBe('0.10 T');
    });
  });

  describe('formatIcpBalance', () => {
    it('should format e8s to ICP with 8 decimal places', () => {
      const balance = BigInt(100_000_000); // 1 ICP
      expect(formatIcpBalance(balance)).toBe('1.00000000');
    });

    it('should format partial ICP correctly', () => {
      const balance = BigInt(50_000_000); // 0.5 ICP
      expect(formatIcpBalance(balance)).toBe('0.50000000');
    });

    it('should format small amounts', () => {
      const balance = BigInt(1); // 0.00000001 ICP
      expect(formatIcpBalance(balance)).toBe('0.00000001');
    });

    it('should format large amounts', () => {
      const balance = BigInt(1000_000_000_000); // 10000 ICP
      expect(formatIcpBalance(balance)).toBe('10000.00000000');
    });

    it('should handle zero', () => {
      expect(formatIcpBalance(BigInt(0))).toBe('0.00000000');
    });

    it('should handle negative values as zero', () => {
      expect(formatIcpBalance(BigInt(-100))).toBe('0.00000000');
    });

    it('should format standard transaction fee', () => {
      const balance = BigInt(10_000); // 0.0001 ICP (tx fee)
      expect(formatIcpBalance(balance)).toBe('0.00010000');
    });
  });
});
