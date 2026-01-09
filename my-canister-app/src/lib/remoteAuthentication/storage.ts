import type { AuthClientStorage } from '@icp-sdk/auth/client';

type StoredKey = string | CryptoKeyPair;

const STORAGE_KEY_PREFIX = 'ii_remote_auth_';

export class RemoteCanisterAuthStorage implements AuthClientStorage {
  async get(key: string): Promise<StoredKey | null> {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (item == null) return null;

    try {
      const parsed = JSON.parse(item) as StoredKey;
      return parsed;
    } catch {
      return null;
    }
  }

  async set(key: string, value: StoredKey): Promise<void> {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(STORAGE_KEY_PREFIX + key);
  }
}
