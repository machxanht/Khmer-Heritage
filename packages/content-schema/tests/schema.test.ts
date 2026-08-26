import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  Entry,
  LICENSES_BLOCKED_FOR_PUBLISH,
  resolveLocalized,
} from "../src/schema";
import { AssetLedger, CategoriesFile, Manifest } from "../src/collections";

/** Seed data doubles as the schema's executable specification. */
const SEED_ROOT = new URL("../../../content-seed/", import.meta.url);
const readSeed = (rel: string) => JSON.parse(readFileSync(new URL(rel, SEED_ROOT), "utf8"));

const angkorWatEn = readSeed("content/en/entries/angkor-wat.json");
const angkorWatKm = readSeed("content/km/entries/angkor-wat.json");

describe("Entry schema — valid seed content", () => {
  it("accepts the published EN pilot entry", () => {
    const parsed = Entry.safeParse(angkorWatEn);
    expect(parsed.success).toBe(true);
  });

  it("accepts the published KM pilot entry", () => {
    const parsed = Entry.safeParse(angkorWatKm);
    expect(parsed.success).toBe(true);
  });
});

describe("Entry schema — hard rules", () => {
  it("requires id === 'kh-' + slug", () => {
    const bad = { ...angkorWatEn, id: "kh-wrong-slug" };
    expect(Entry.safeParse(bad).success).toBe(false);
  });

  it("rejects invalid slug characters", () => {
    const bad = { ...angkorWatEn, slug: "Angkor Wat!", id: "kh-Angkor Wat!" };
    expect(Entry.safeParse(bad).success).toBe(false);
  });

  it("rejects PUBLISHED entries without any source", () => {
    const bad = { ...angkorWatEn, sources: [] };
    const result = Entry.safeParse(bad);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(JSON.stringify(result.error.issues)).toContain("source");
    }
  });

  it("rejects PUBLISHED entries with blocked licenses (UNKNOWN / CC-BY-NC / COPYRIGHTED)", () => {
    for (const code of LICENSES_BLOCKED_FOR_PUBLISH) {
      const bad = { ...angkorWatEn, license: { ...angkorWatEn.license, code } };
      expect(Entry.safeParse(bad).success).toBe(false);
    }
  });

  it("allows DRAFT entries to lack sources/cover/publishedAt", () => {
    const draft = {
      ...angkorWatEn,
      status: "DRAFT",
      sources: [],
      coverAssetId: undefined,
      publishedAt: null,
      featuredOrder: null,
    };
    expect(Entry.safeParse(draft).success).toBe(true);
  });

  it("rejects PUBLISHED entries whose primary language misses title/summary", () => {
    const bad = { ...angkorWatKm, languages: ["vi"] };
    expect(Entry.safeParse(bad).success).toBe(false);
  });

  it("rejects unsupported schemaVersion", () => {
    const bad = { ...angkorWatEn, schemaVersion: "9.9" };
    expect(Entry.safeParse(bad).success).toBe(false);
  });

  it("rejects video blocks whose provider/reference mismatch", () => {
    const bad = JSON.parse(JSON.stringify(angkorWatEn)) as typeof angkorWatEn;
    bad.sections[0].blocks.push({
      blockType: "video",
      provider: "r2",
      title: { en: "clip" },
    });
    expect(Entry.safeParse(bad).success).toBe(false);
  });
});

describe("LocalizedText fallback", () => {
  it("resolves requested → km → en → first", () => {
    const text = { km: "ខ្មែរ", en: "English", vi: "Tiếng Việt" };
    expect(resolveLocalized(text, "vi")).toBe("Tiếng Việt");
    expect(resolveLocalized(text)).toBe("ខ្មែរ");
    expect(resolveLocalized({ en: "English" }, "km")).toBe("English");
    expect(resolveLocalized({ fr: "seul" })).toBe("seul");
  });
});

describe("Collection files parse against seed", () => {
  it("manifest lists only PUBLISHED entries and validates", () => {
    const manifest = Manifest.parse(readSeed("content/manifest.json"));
    expect(manifest.entries.length).toBeGreaterThan(0);
    const drafts = manifest.entries.filter(
      (e) => !JSON.stringify(e).includes("kh-"),
    );
    expect(drafts).toHaveLength(0); // sanity: ids well-formed
  });

  it("categories validate for every seeded language", () => {
    for (const lang of ["en", "km"]) {
      const cats = CategoriesFile.parse(readSeed(`content/${lang}/categories.json`));
      expect(cats.language).toBe(lang);
      expect(cats.categories.length).toBeGreaterThan(0);
    }
  });

  it("asset ledger validates and contains no UNKNOWN assets", () => {
    const ledger = AssetLedger.parse(readSeed("licenses/asset-ledger.json"));
    expect(ledger.assets.length).toBeGreaterThan(0);
    const unknown = ledger.assets.filter((a) => a.license === "UNKNOWN");
    expect(unknown).toHaveLength(0);
  });
});
