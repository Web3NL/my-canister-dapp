import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inferCanisterIdFromLocation } from '../src/index.js';
import { Principal } from '@dfinity/principal';

describe('inferCanisterIdFromLocation', () => {
  const TEST_PRINCIPAL = 'rdmx6-jaaaa-aaaaa-aaadq-cai';

  const mockLocation = (protocol: string, hostname: string) => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname,
        protocol,
      },
      writable: true,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('valid cases', () => {
    it('should extract canister ID from localhost with http protocol', () => {
      mockLocation('http:', `${TEST_PRINCIPAL}.localhost`);

      const result = inferCanisterIdFromLocation();

      expect(result).toBeInstanceOf(Principal);
      expect(result.toString()).toBe(TEST_PRINCIPAL);
    });

    it('should extract canister ID from icp0.io with https protocol', () => {
      mockLocation('https:', `${TEST_PRINCIPAL}.icp0.io`);

      const result = inferCanisterIdFromLocation();

      expect(result).toBeInstanceOf(Principal);
      expect(result.toString()).toBe(TEST_PRINCIPAL);
    });
  });

  describe('invalid protocol-hostname combinations', () => {
    it('should throw error for https protocol with localhost', () => {
      mockLocation('https:', `${TEST_PRINCIPAL}.localhost`);

      expect(() => inferCanisterIdFromLocation()).toThrow(
        'Invalid protocol for localhost: https:. Only http: is allowed for localhost.'
      );
    });

    it('should throw error for http protocol with icp0.io', () => {
      mockLocation('http:', `${TEST_PRINCIPAL}.icp0.io`);

      expect(() => inferCanisterIdFromLocation()).toThrow(
        'Invalid protocol for production: http:. Only https: is allowed for icp0.io.'
      );
    });

    it('should throw error for unsupported icp domain', () => {
      mockLocation('https:', `${TEST_PRINCIPAL}.icp1.io`);

      expect(() => inferCanisterIdFromLocation()).toThrow(
        `Could not infer canister ID from hostname: ${TEST_PRINCIPAL}.icp1.io`
      );
    });
  });

  describe('invalid Principal formats', () => {
    it('should throw error for invalid Principal format on localhost', () => {
      mockLocation('http:', 'not-a-principal.localhost');

      expect(() => inferCanisterIdFromLocation()).toThrow();
    });

    it('should throw error for invalid Principal format on icp0.io', () => {
      mockLocation('https:', 'invalid-format.icp0.io');

      expect(() => inferCanisterIdFromLocation()).toThrow();
    });

    it('should throw error for too short canister ID', () => {
      mockLocation('http:', 'short.localhost');

      expect(() => inferCanisterIdFromLocation()).toThrow();
    });

    it('should throw error for special characters in canister ID', () => {
      mockLocation('https:', 'special-chars!@#.icp0.io');

      expect(() => inferCanisterIdFromLocation()).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should throw error for unknown hostname pattern', () => {
      mockLocation('https:', 'example.com');

      expect(() => inferCanisterIdFromLocation()).toThrow(
        'Could not infer canister ID from hostname: example.com'
      );
    });

    it('should throw error for localhost without canister ID', () => {
      mockLocation('http:', 'localhost');

      expect(() => inferCanisterIdFromLocation()).toThrow(
        'Could not infer canister ID from hostname: localhost'
      );
    });

    it('should throw error for empty hostname', () => {
      mockLocation('http:', '');

      expect(() => inferCanisterIdFromLocation()).toThrow(
        'Could not infer canister ID from hostname: '
      );
    });
  });
});