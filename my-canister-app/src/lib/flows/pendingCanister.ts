import type { Principal } from '@icp-sdk/core/principal';
import { Principal as PrincipalClass } from '@icp-sdk/core/principal';

const STORAGE_KEY = 'pending_canister_creation';

/**
 * Storage interface for pending canister state.
 * Allows injection of mock storage for testing.
 */
export interface PendingCanisterStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const defaultStorage: PendingCanisterStorage = {
  get: key => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: key => localStorage.removeItem(key),
};

let storage = defaultStorage;

/**
 * Set custom storage implementation (for testing).
 */
export function setStorage(s: PendingCanisterStorage): void {
  storage = s;
}

/**
 * Reset to default localStorage implementation.
 */
export function resetStorage(): void {
  storage = defaultStorage;
}

/**
 * Stores a canister ID as pending (created but not fully set up).
 * Used to recover from partial creation failures.
 */
export function setPendingCanister(canisterId: Principal): void {
  storage.set(STORAGE_KEY, canisterId.toText());
}

/**
 * Retrieves a pending canister if one exists.
 * Returns null if no pending canister exists or if the stored value is invalid.
 */
export function getPendingCanister(): Principal | null {
  const stored = storage.get(STORAGE_KEY);
  if (!stored) return null;

  try {
    return PrincipalClass.fromText(stored);
  } catch {
    clearPendingCanister();
    return null;
  }
}

/**
 * Clears the pending canister state.
 * Call this after successful completion or intentional abandonment.
 */
export function clearPendingCanister(): void {
  storage.remove(STORAGE_KEY);
}

/**
 * Error thrown when canister creation succeeds but install fails.
 * Contains the canister ID for recovery.
 */
export class PartialCreationError extends Error {
  constructor(
    public readonly canisterId: Principal,
    public readonly originalError: Error
  ) {
    super(
      `Canister ${canisterId.toText()} was created but code installation failed: ${originalError.message}`
    );
    this.name = 'PartialCreationError';
  }
}
