import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ContentClient, ContentClientError } from "../src/client";
import { MemoryCacheAdapter } from "../src/cache";

/** Route fake HTTP requests onto the real seed tree — integration without a server. */
const BASE = "https://content.test";

function seedFetch(): typeof fetch {
  return (async (input: string | URL): Promise<Response> => {
    const url = String(input).replace(BASE, "");
    try {
      const body = readFileSync(new URL(`../../../content-seed${url}`, import.meta.url), "utf8");
      return new Response(body, { status: 200 });
    } catch {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
    }
  }) as typeof fetch;
}

function makeClient(storage?: MemoryCacheAdapter) {
  return new ContentClient({ baseUrl: BASE, fetchImpl: seedFetch(), storage });
}

describe("ContentClient", () => {
  it("lists categories for a language", async () => {
    const cats = await makeClient().getCategories("en");
    expect(cats.categories[0]?.id).toBe("temples-monuments");
  });

  it("returns a published entry by id or slug", async () => {
    const client = makeClient();
    const byId = await client.getEntry("kh-angkor-wat", "en");
    const bySlug = await client.getEntry("angkor-wat", "en");
    expect(byId?.title.en).toBe("Angkor Wat");
    expect(bySlug?.id).toBe("kh-angkor-wat");
  });

  it("returns null (not throw) for missing entries", async () => {
    expect(await makeClient().getEntry("angkor-thom", "en")).toBeNull();
  });

  it("builds Featured from manifest ordering", async () => {
    const featured = await makeClient().getFeatured("en");
    expect(featured[0]?.slug).toBe("angkor-wat");
  });

  it("searches only PUBLISHED entries via manifest", async () => {
    const hits = await makeClient().searchEntries("angkor", "en");
    expect(hits.map((h) => h.slug)).toContain("angkor-wat");
    expect(hits.map((h) => h.slug)).not.toContain("bayon"); // REVIEW → hidden
  });

  it("resolves related entries", async () => {
    const related = await makeClient().getRelated("angkor-wat", "en");
    expect(related.map((r) => r.slug)).toContain("bayon");
  });

  it("maps asset ids through the license ledger to URLs", async () => {
    const url = await makeClient().resolveAsset("img-angkor-wat-cover");
    expect(url).toBe(`${BASE}/media/images/optimized/angkor-wat/cover.webp`);
    expect(await makeClient().resolveAsset("img-missing")).toBeNull();
  });

  it("refresh() invalidates caches only when the revision changes", async () => {
    const client = makeClient(new MemoryCacheAdapter());
    expect(await client.refresh()).toBe(1); // first load counts as change vs empty
    expect(await client.refresh()).toBeNull(); // unchanged
  });

  it("serves stale storage copies when the network fails", async () => {
    const storage = new MemoryCacheAdapter();
    const good = makeClient(storage);
    await good.getCategories("en", { staleOk: true });

    const broken = new ContentClient({
      baseUrl: BASE,
      storage,
      fetchImpl: (async () => {
        throw new Error("offline");
      }) as typeof fetch,
    });
    const stale = await broken.getCategories("en", { staleOk: true });
    expect(stale.language).toBe("en");
  });

  it("throws typed errors carrying the HTTP status", async () => {
    const broken = new ContentClient({
      baseUrl: BASE,
      fetchImpl: (async () => new Response("{}", { status: 500 })) as typeof fetch,
    });
    const err = await broken.getCategories("en").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ContentClientError);
    expect((err as ContentClientError).status).toBe(500);
  });
});
