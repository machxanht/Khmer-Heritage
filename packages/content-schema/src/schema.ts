/**
 * KHMER HERITAGE content schema v1.0 — zod definitions.
 * Single source of truth implemented from docs/CONTENT_SCHEMA.md.
 * Any change here MUST be reflected in that doc within the same change.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export const SUPPORTED_SCHEMA_VERSIONS = ["1.0"] as const;
export const LANGUAGES = ["km", "en", "vi"] as const;
export type LanguageCode = (typeof LANGUAGES)[number];

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** Licenses that can never appear on a PUBLISHED entry (docs/LICENSING.md §1). */
export const LICENSES_BLOCKED_FOR_PUBLISH = [
  "UNKNOWN",
  "CC-BY-NC-4.0",
  "COPYRIGHTED",
] as const;

export const SchemaVersion = z
  .string()
  .refine((v) => (SUPPORTED_SCHEMA_VERSIONS as readonly string[]).includes(v), {
    message: `schemaVersion must be one of ${SUPPORTED_SCHEMA_VERSIONS.join(", ")}`,
  });

/** LocalizedText: object keyed by BCP-47 subtag; requires at least 'km' or 'en'. */
export const LocalizedText = z
  .record(z.string().trim().min(1))
  .refine((t) => "km" in t || "en" in t, {
    message: "LocalizedText requires at least a 'km' or 'en' value",
  });

export type LocalizedTextValue = z.infer<typeof LocalizedText>;

/** Resolve localized value with the mandated fallback chain: requested → km → en → any. */
export function resolveLocalized(
  text: LocalizedTextValue,
  preferred?: string,
): string | undefined {
  if (preferred && typeof text[preferred] === "string" && text[preferred]) return text[preferred];
  if (typeof text.km === "string" && text.km) return text.km;
  if (typeof text.en === "string" && text.en) return text.en;
  const first = Object.values(text)[0];
  return first || undefined;
}

export const EntryStatus = z.enum([
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
]);
export type EntryStatusValue = z.infer<typeof EntryStatus>;

export const LicenseCode = z.enum([
  "PD",
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-SA-4.0",
  "CC-BY-NC-4.0",
  "PERMISSION-REQUIRED",
  "COPYRIGHTED",
  "UNKNOWN",
]);
export type LicenseCodeValue = z.infer<typeof LicenseCode>;

export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");
export const IsoDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, "must be ISO-8601 UTC (…Z)");

/* ------------------------------------------------------------------ */
/* Content blocks                                                      */
/* ------------------------------------------------------------------ */

const ParagraphBlock = z.object({ blockType: z.literal("paragraph"), text: LocalizedText });
const HeadingBlock = z.object({ blockType: z.literal("heading"), text: LocalizedText });
const ListBlock = z.object({
  blockType: z.literal("list"),
  ordered: z.boolean(),
  items: z.array(z.object({ text: LocalizedText })).min(1),
});
const QuoteBlock = z.object({
  blockType: z.literal("quote"),
  text: LocalizedText,
  attribution: LocalizedText.optional(),
});
const ImageBlock = z.object({
  blockType: z.literal("image"),
  assetId: z.string().min(1),
  alt: LocalizedText,
  caption: LocalizedText.optional(),
});
const GalleryBlock = z.object({
  blockType: z.literal("gallery"),
  assetIds: z.array(z.string().min(1)).min(1),
  caption: LocalizedText.optional(),
});
const AudioBlock = z.object({
  blockType: z.literal("audio"),
  assetId: z.string().min(1),
  title: LocalizedText,
  transcript: LocalizedText.optional(),
});
const VideoBlock = z.object({
  blockType: z.literal("video"),
  provider: z.enum(["r2", "external"]),
  assetId: z.string().min(1).optional(),
  url: z.string().url().optional(),
  title: LocalizedText,
});
const KeyFact = z.object({ id: z.string(), label: LocalizedText, value: LocalizedText });
const KeyFactsBlock = z.object({
  blockType: z.literal("keyFacts"),
  facts: z.array(KeyFact).min(1),
});
const TimelineEvent = z.object({ period: z.string().min(1), text: LocalizedText });
const TimelineBlock = z.object({
  blockType: z.literal("timeline"),
  events: z.array(TimelineEvent).min(1),
});
const MapPointBlock = z.object({
  blockType: z.literal("mapPoint"),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  zoom: z.number().int().min(1).max(20).optional(),
  label: LocalizedText,
});
const CalloutBlock = z.object({
  blockType: z.literal("callout"),
  variant: z.enum(["info", "warning"]),
  text: LocalizedText,
});

export const Block = z.discriminatedUnion("blockType", [
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  QuoteBlock,
  ImageBlock,
  GalleryBlock,
  AudioBlock,
  VideoBlock,
  KeyFactsBlock,
  TimelineBlock,
  MapPointBlock,
  CalloutBlock,
]);

/* ------------------------------------------------------------------ */
/* References                                                          */
/* ------------------------------------------------------------------ */

export const SourceRef = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z.string().url().optional(),
  datePublished: IsoDate.optional(),
  /** Mandatory per docs/CONTENT_SOURCES.md §3. */
  dateAccessed: IsoDate,
  note: z.string().optional(),
});
export type SourceRefValue = z.infer<typeof SourceRef>;

export const LicenseInfo = z.object({
  code: LicenseCode,
  licenseUrl: z.string().url().optional(),
  attribution: LocalizedText.optional(),
  notes: z.string().optional(),
});

export const RelatedRef = z.object({
  entryId: z.string().min(1),
  relation: z.enum(["see-also", "parent", "child"]),
});

export const CreditRole = z.enum(["research", "author", "translator", "reviewer", "editor"]);
export const CreditPerson = z.object({
  name: z.string().min(1),
  role: CreditRole,
});

/* ------------------------------------------------------------------ */
/* Entry                                                               */
/* ------------------------------------------------------------------ */

const Section = z
  .object({
    id: z.string().min(1),
    title: LocalizedText.optional(),
    blocks: z.array(Block).min(1),
  })
  .superRefine((section, ctx) => {
    // Video rule lives here so Block can stay a pure discriminated union.
    section.blocks.forEach((block, i) => {
      if (block.blockType === "video") {
        const ok =
          block.provider === "r2" ? Boolean(block.assetId) : Boolean(block.url);
        if (!ok) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["blocks", i],
            message: "provider 'r2' requires assetId; provider 'external' requires url",
          });
        }
      }
    });
  });

export const EntrySchema = z
  .object({
    schemaVersion: SchemaVersion,
    id: z.string().min(1),
    slug: z.string().regex(SLUG_REGEX),
    type: z.string().min(2),
    categoryId: z.string().min(1),
    languages: z.array(z.enum(LANGUAGES)).min(1),
    title: LocalizedText,
    summary: LocalizedText,
    tags: z.array(z.string()).default([]),
    coverAssetId: z.string().min(1).optional(),
    sections: z.array(Section).min(1),
    sources: z.array(SourceRef).default([]),
    license: LicenseInfo,
    related: z.array(RelatedRef).default([]),
    credits: z.array(CreditPerson).default([]),
    status: EntryStatus,
    featuredOrder: z.number().int().positive().nullable().optional(),
    publishedAt: IsoDateTime.nullable().optional(),
    updatedAt: IsoDateTime,
    revision: z.number().int().positive(),
  })
  .superRefine((entry, ctx) => {
    if (entry.id !== `kh-${entry.slug}`) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["id"], message: `id must equal "kh-${entry.slug}"` });
    }
    if (entry.status === "PUBLISHED") {
      if (!entry.publishedAt) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["publishedAt"], message: "PUBLISHED entries require publishedAt" });
      }
      if (entry.sources.length < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sources"], message: "PUBLISHED entries require at least one source" });
      }
      if (!entry.coverAssetId) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coverAssetId"], message: "PUBLISHED entries require a coverAssetId" });
      }
      if ((LICENSES_BLOCKED_FOR_PUBLISH as readonly string[]).includes(entry.license.code)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["license"], message: `license ${entry.license.code} cannot be used on a PUBLISHED entry` });
      }
      const primary = entry.languages[0];
      if (!(primary in entry.title) || !(primary in entry.summary)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["languages"], message: `primary language "${primary}" missing from title/summary` });
      }
    }
  });

/** Convenience alias matching doc naming. */
export const Entry = EntrySchema;
export type EntryValue = z.infer<typeof EntrySchema>;
export type SectionValue = z.infer<typeof Section>;
export type BlockValue = z.infer<typeof Block>;
export type RelatedRefValue = z.infer<typeof RelatedRef>;
export type CreditPersonValue = z.infer<typeof CreditPerson>;

/** All asset ids referenced anywhere inside an entry (for ledger linting). */
export function collectAssetIds(entry: EntryValue): string[] {
  const ids: string[] = [];
  if (entry.coverAssetId) ids.push(entry.coverAssetId);
  for (const section of entry.sections) {
    for (const block of section.blocks) {
      if ("assetId" in block && block.assetId) ids.push(block.assetId);
      if ("assetIds" in block && Array.isArray(block.assetIds)) ids.push(...block.assetIds);
    }
  }
  return [...new Set(ids)];
}

