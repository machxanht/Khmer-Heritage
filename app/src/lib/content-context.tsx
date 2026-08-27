/**
 * App-wide ContentClient provider (PROJECT_SPEC §4 — UI reaches content only
 * through the typed client, never through raw URLs).
 */

import { ContentClient } from '@kh/content-client';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { AsyncStorageCacheAdapter } from '@/lib/async-storage-cache';
import { CONTENT_BASE_URL } from '@/lib/config';

interface ContentContextValue {
  client: ContentClient;
  /** Boot status of the first manifest load. */
  status: 'loading' | 'ready' | 'error';
  errorMessage?: string;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

/** One client per app; content cache persists across launches via AsyncStorage. */
function createAppClient(): ContentClient {
  return new ContentClient({
    baseUrl: CONTENT_BASE_URL,
    storage: new AsyncStorageCacheAdapter(),
  });
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const client = useMemo(createAppClient, []);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    client
      .getManifest({ staleOk: true })
      .then(() => {
        if (!cancelled) setStatus('ready');
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : String(err));
          setStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client, tick]);

  const refresh = useCallback(async () => {
    try {
      await client.refresh();
    } finally {
      setTick((n) => n + 1); // re-run boot effect so screens reload data too
    }
  }, [client]);

  const value = useMemo(
    () => ({ client, status, errorMessage, refresh }),
    [client, status, errorMessage, refresh],
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be used within <ContentProvider>');
  return ctx;
}
