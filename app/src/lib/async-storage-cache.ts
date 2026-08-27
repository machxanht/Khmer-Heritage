/**
 * Persistent CacheAdapter for ContentClient backed by AsyncStorage.
 *
 * - Keys are namespaced (`kh.content.` prefix) so other app features can share
 *   the same AsyncStorage store safely.
 * - All storage errors are swallowed (logged in dev) rather than thrown:
 *   a full/corrupt store must degrade to "no offline cache", never crash boot.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CacheAdapter } from '@kh/content-client';

const KEY_PREFIX = 'kh.content.';

function warn(op: string, key: string, cause: unknown): void {
  if (__DEV__) {
    console.warn(`[AsyncStorageCacheAdapter] ${op} "${key}" failed:`, cause);
  }
}

export class AsyncStorageCacheAdapter implements CacheAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEY_PREFIX + key);
    } catch (cause) {
      // Corrupt entry or storage failure → treat as cache miss so the client
      // falls through to its normal staleOk/network paths.
      warn('getItem', key, cause);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_PREFIX + key, value);
    } catch (cause) {
      // Persisting is best-effort; the in-memory layer already has the value.
      warn('setItem', key, cause);
    }
  }
}
