/**
 * Pluggable persistence for offline-tolerant caching.
 * The Expo app injects an AsyncStorage-backed adapter; tests use memory.
 */
export interface CacheAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export class MemoryCacheAdapter implements CacheAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }
}
