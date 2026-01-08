import type { Principal } from '@dfinity/principal';
import { Principal as PrincipalClass } from '@dfinity/principal';

const STORAGE_KEY = 'pending_canister_creation';

interface PendingCanister {
  canisterId: string;
  createdAt: number;
}

/**
 * Stores a canister ID as pending (created but not fully set up).
 * Used to recover from partial creation failures.
 */
export function setPendingCanister(canisterId: Principal): void {
  const pending: PendingCanister = {
    canisterId: canisterId.toText(),
    createdAt: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
}

/**
 * Retrieves a pending canister if one exists.
 * Returns null if no pending canister or if it's older than 24 hours.
 */
export function getPendingCanister(): Principal | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const pending: PendingCanister = JSON.parse(stored);

    // Expire pending canisters after 24 hours
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - pending.createdAt > maxAge) {
      clearPendingCanister();
      return null;
    }

    return PrincipalClass.fromText(pending.canisterId);
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
  localStorage.removeItem(STORAGE_KEY);
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
