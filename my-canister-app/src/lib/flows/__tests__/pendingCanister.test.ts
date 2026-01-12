import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Principal } from '@icp-sdk/core/principal';
import {
  setPendingCanister,
  getPendingCanister,
  clearPendingCanister,
  PartialCreationError,
  setStorage,
  resetStorage,
  type PendingCanisterStorage,
} from '../pendingCanister';

const TEST_CANISTER_ID = 'rrkah-fqaaa-aaaaa-aaaaq-cai';

describe('pendingCanister', () => {
  // Use mock storage for isolation
  let mockStorage: Map<string, string>;
  let mockStorageImpl: PendingCanisterStorage;

  beforeEach(() => {
    mockStorage = new Map();
    mockStorageImpl = {
      get: (key: string) => mockStorage.get(key) ?? null,
      set: (key: string, value: string) => mockStorage.set(key, value),
      remove: (key: string) => mockStorage.delete(key),
    };
    setStorage(mockStorageImpl);
  });

  afterEach(() => {
    resetStorage();
  });

  describe('setPendingCanister', () => {
    it('stores canister ID in storage', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      setPendingCanister(principal);

      const stored = mockStorage.get('pending_canister_creation');
      expect(stored).toBe(TEST_CANISTER_ID);
    });

    it('converts Principal to text', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      setPendingCanister(principal);

      const stored = mockStorage.get('pending_canister_creation');
      expect(stored).toBe(TEST_CANISTER_ID);
    });

    it('overwrites existing pending canister', () => {
      const principal1 = Principal.fromText(TEST_CANISTER_ID);
      const principal2 = Principal.fromText('aaaaa-aa');

      setPendingCanister(principal1);
      setPendingCanister(principal2);

      const stored = mockStorage.get('pending_canister_creation');
      expect(stored).toBe('aaaaa-aa');
    });
  });

  describe('getPendingCanister', () => {
    it('returns null when no pending canister', () => {
      expect(getPendingCanister()).toBeNull();
    });

    it('returns Principal when valid pending exists', () => {
      mockStorage.set('pending_canister_creation', TEST_CANISTER_ID);

      const result = getPendingCanister();
      expect(result).not.toBeNull();
      expect(result!.toText()).toBe(TEST_CANISTER_ID);
    });

    it('returns null and clears on invalid Principal', () => {
      mockStorage.set('pending_canister_creation', 'not-a-valid-principal-!!!');

      const result = getPendingCanister();
      expect(result).toBeNull();
      expect(mockStorage.has('pending_canister_creation')).toBe(false);
    });
  });

  describe('clearPendingCanister', () => {
    it('removes item from storage', () => {
      mockStorage.set('pending_canister_creation', TEST_CANISTER_ID);

      clearPendingCanister();
      expect(mockStorage.has('pending_canister_creation')).toBe(false);
    });

    it('does not throw when no item exists', () => {
      expect(() => clearPendingCanister()).not.toThrow();
    });
  });

  describe('PartialCreationError', () => {
    const mockOriginalError = new Error('Installation failed');

    it('has name "PartialCreationError"', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      const error = new PartialCreationError(principal, mockOriginalError);
      expect(error.name).toBe('PartialCreationError');
    });

    it('includes canister ID in message', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      const error = new PartialCreationError(principal, mockOriginalError);
      expect(error.message).toContain(TEST_CANISTER_ID);
    });

    it('includes original error message', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      const error = new PartialCreationError(principal, mockOriginalError);
      expect(error.message).toContain('Installation failed');
    });

    it('exposes canisterId property', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      const error = new PartialCreationError(principal, mockOriginalError);
      expect(error.canisterId.toText()).toBe(TEST_CANISTER_ID);
    });

    it('exposes originalError property', () => {
      const principal = Principal.fromText(TEST_CANISTER_ID);
      const error = new PartialCreationError(principal, mockOriginalError);
      expect(error.originalError).toBe(mockOriginalError);
    });
  });
});
