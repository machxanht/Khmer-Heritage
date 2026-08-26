/**
 * Content service implementing master plan §13 over static R2-hosted JSON.
 * UI never touches R2 URLs directly — everything goes through this client.
 */
import {
  AssetLedger,
  type AssetLedgerRecordValue,
  CategoriesFile,
  type CategoriesFileValue,
  Entry,
  type EntryValue,
  Manifest,
  type ManifestItemValue,
  type ManifestValue,
  type LanguageCode,
  resolveLocalized,
} from "@kh/content-schema";
import type { CacheAdapter } from "./cache";

export class ContentClientError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`Content request failed (${status}): ${path}`);
  }
}

export interface ContentClientConfig {
  /** Public R2 bucket base URL (or local seed server in development). */
  baseUrl: string;
  storage?: CacheAdapter;
  fetchImpl?: typeof fetch;
}

interface FetchOpts {
  force?: boolean;
  /** Serve persisted cache when network fails (slow-network tolerance). */
  staleOk?: boolean;
}

export class ContentClient {
  private mem = new Map<string, unknown>();

  constructor(private readonly cfg: ContentClientConfig) {}

  /* ------------------------- transport ---------------------------- */

  private url(path: string): string {
    return `${this.cfg.baseUrl.replace(/\/+$/, "")}${path}`;
  }

  private async requestJson(path: string): Promise<unknown> {
    const doFetch = this.cfg.fetchImpl ?? fetch;
    let res: Response;
    try {
      res = await doFetch(this.url(path));
    } catch (cause) {
      throw new ContentClientError(0, path + ` (${String(cause)})`);
    }
    if (!res.ok) throw new ContentClientError(res.status, path);
    return res.json();
  }

  private async cachedJson<T>(
    path: string,
    parse: (raw: unknown) => T,
    opts?: FetchOpts,
  ): Promise<T> {
    const key = `json:${path}`;
    if (!opts?.force && this.mem.has(key)) return this.mem.get(key) as T;
    try {
      const value = parse(await this.requestJson(path));
      this.mem.set(key, value);
      void this.cfg.storage?.setItem(key, JSON.stringify(value)).catch(() => undefined);
      return value;
    } catch (err) {
      if (opts?.staleOk && this.cfg.storage) {
        const raw = await this.cfg.storage.getItem(key).catch(() => null);
        if (raw) return parse(JSON.parse(raw) as unknown);
      }
      throw err;
    }
  }

  /* --------------------------- manifest ---------------------------- */

  getManifest(opts?: FetchOpts): Promise<ManifestValue> {
    return this.cachedJson("/content/manifest.json", Manifest.parse, opts);
  }

  /** Re-fetch manifest; returns new globalRevision and drops caches when changed. */
  async refresh(): Promise<number | null> {
    const key = "json:/content/manifest.json";
    const prev = this.mem.get(key) as ManifestValue | undefined;
    const next = await this.getManifest({ force: true });
    if (!prev || next.globalRevision !== prev.globalRevision) {
      for (const k of [...this.mem.keys()]) {
        if (k !== key) this.mem.delete(k);
      }
      return next.globalRevision;
    }
    return null;
  }

  /* ------------------------- public API ----------------------------- */

  getCategories(lang: LanguageCode, opts?: FetchOpts): Promise<CategoriesFileValue> {
    return this.cachedJson(`/content/${lang}/categories.json`, CategoriesFile.parse, opts);
  }

  /** Cheap index of PUBLISHED entries (title/slug/category/tags). */
  async getEntries(lang?: LanguageCode, opts?: FetchOpts): Promise<ManifestItemValue[]> {
    return (await this.getManifest(opts)).entries;
  }

  async getEntry(slugOrId: string, lang: LanguageCode, opts?: FetchOpts): Promise<EntryValue | null> {
    const slug = slugOrId.replace(/^kh-/, "");
    try {
      return await this.cachedJson(`/content/${lang}/entries/${slug}.json`, Entry.parse, opts);
    } catch (err) {
      if (err instanceof ContentClientError && err.status === 404) return null;
      throw err;
    }
  }

  async getFeatured(lang: LanguageCode, opts?: FetchOpts): Promise<EntryValue[]> {
    const manifest = await this.getManifest(opts);
    const items = manifest.entries
      .filter((e) => e.featuredOrder != null)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    const entries = await Promise.all(items.map((i) => this.getEntry(i.slug, lang, opts)));
    return entries.filter((e): e is EntryValue => e !== null);
  }

  async searchEntries(query: string, lang?: LanguageCode, limit = 20): Promise<ManifestItemValue[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const manifest = await this.getManifest();
    const hits: ManifestItemValue[] = [];
    for (const item of manifest.entries) {
      const hay = [
        item.id,
        item.slug,
        item.categoryId,
        resolveLocalized(item.title, lang) ?? "",
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (hay.includes(q)) {
        hits.push(item);
        if (hits.length >= limit) break;
      }
    }
    return hits;
  }

  async getRelated(slugOrId: string, lang: LanguageCode, opts?: FetchOpts): Promise<EntryValue[]> {
    const entry = await this.getEntry(slugOrId, lang, opts);
    if (!entry || entry.related.length === 0) return [];
    const resolved = await Promise.all(entry.related.map((r) => this.getEntry(r.entryId, lang, opts)));
    return resolved.filter((e): e is EntryValue => e !== null);
  }

  async resolveAsset(assetId: string, opts?: FetchOpts): Promise<string | null> {
    const ledger = await this.cachedJson("/licenses/asset-ledger.json", AssetLedger.parse, opts);
    const rec: AssetLedgerRecordValue | undefined = ledger.assets.find((a) => a.assetId === assetId);
    return rec ? this.url(`/${rec.file.replace(/^\/+/, "")}`) : null;
  }
}
