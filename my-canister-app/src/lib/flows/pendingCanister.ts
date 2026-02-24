import type { Principal } from '@icp-sdk/core/principal';
import { Principal as PrincipalClass } from '@icp-sdk/core/principal';

const STORAGE_KEY = 'pending_canister_creation';

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

export function setStorage(s: PendingCanisterStorage): void {
  storage = s;
}

export function resetStorage(): void {
  storage = defaultStorage;
}

export function setPendingCanister(canisterId: Principal): void {
  storage.set(STORAGE_KEY, canisterId.toText());
}

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

export function clearPendingCanister(): void {
  storage.remove(STORAGE_KEY);
}

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
