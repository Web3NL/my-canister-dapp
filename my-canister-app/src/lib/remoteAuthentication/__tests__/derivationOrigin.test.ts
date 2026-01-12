import { describe, it, expect } from 'vitest';
import { createDerivationOriginFromHost } from '../derivationOrigin';

describe('createDerivationOriginFromHost', () => {
  const TEST_CANISTER_ID = 'rrkah-fqaaa-aaaaa-aaaaq-cai';

  describe('localhost (development)', () => {
    it('creates canister-id.localhost:port format', () => {
      const result = createDerivationOriginFromHost(
        TEST_CANISTER_ID,
        'http://localhost:8080'
      );
      expect(result).toBe(`http://${TEST_CANISTER_ID}.localhost:8080`);
    });

    it('preserves http protocol', () => {
      const result = createDerivationOriginFromHost(
        TEST_CANISTER_ID,
        'http://localhost:4943'
      );
      expect(result.startsWith('http://')).toBe(true);
    });

    it('handles different port numbers', () => {
      expect(
        createDerivationOriginFromHost(
          TEST_CANISTER_ID,
          'http://localhost:4943'
        )
      ).toBe(`http://${TEST_CANISTER_ID}.localhost:4943`);

      expect(
        createDerivationOriginFromHost(
          TEST_CANISTER_ID,
          'http://localhost:8000'
        )
      ).toBe(`http://${TEST_CANISTER_ID}.localhost:8000`);
    });
  });

  describe('mainnet (production)', () => {
    it('creates canister-id.icp0.io format', () => {
      const result = createDerivationOriginFromHost(
        TEST_CANISTER_ID,
        'https://icp0.io'
      );
      expect(result).toBe(`https://${TEST_CANISTER_ID}.icp0.io`);
    });

    it('does not include port', () => {
      const result = createDerivationOriginFromHost(
        TEST_CANISTER_ID,
        'https://icp0.io'
      );
      expect(result).not.toContain(':443');
      expect(result).not.toContain(':80');
    });

    it('uses https protocol', () => {
      const result = createDerivationOriginFromHost(
        TEST_CANISTER_ID,
        'https://icp0.io'
      );
      expect(result.startsWith('https://')).toBe(true);
    });
  });
});
