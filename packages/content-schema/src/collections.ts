/**
 * Collection-level files served from R2: categories, manifest, asset ledger.
 * See docs/CONTENT_SCHEMA.md §5.2–§5.3 and docs/LICENSING.md §3.
 */
import { z } from "zod";
import {
  IsoDate,
  IsoDateTime,
  LANGUAGES,
  LicenseCode,
  LocalizedText,
  SchemaVersion,
  SLUG_REGEX,
} from "./schema";

/* ------------------------- categories.json ------------------------ */

export const Category = z.object({
  id: z.string().min(1),
  slug: z.string().regex(SLUG_REGEX),
  order: z.number().int().positive(),
  title: LocalizedText,
  description: LocalizedText.optional(),
  icon: z.string().optional(),
  coverAssetId: z.string().optional(),
});
export type CategoryValue = z.infer<typeof Category>;

export const CategoriesFile = z.object({
  schemaVersion: SchemaVersion,
  language: z.enum(LANGUAGES),
  revision: z.number().int().positive(),
  generatedAt: IsoDateTime,
  categories: z.array(Category).min(1),
});
export type CategoriesFileValue = z.infer<typeof CategoriesFile>;

/* --------------------------- manifest.json ------------------------ */

export const ManifestItem = z.object({
  id: z.string().min(1),
  slug: z.string().regex(SLUG_REGEX),
  categoryId: z.string().min(1),
  title: LocalizedText,
  tags: z.array(z.string()).default([]),
  thumbAssetId: z.string().optional(),
  /** Copied from the entry so clients can build Featured cheaply. */
  featuredOrder: z.number().int().positive().nullable().optional(),
  updatedAt: IsoDateTime,
  revision: z.number().int().positive(),
});
export type ManifestItemValue = z.infer<typeof ManifestItem>;

export const Manifest = z.object({
  schemaVersion: SchemaVersion,
  generatedAt: IsoDateTime,
  globalRevision: z.number().int().nonnegative(),
  languages: z.array(z.enum(LANGUAGES)).min(1),
  languagesRevision: z.record(z.number().int().nonnegative()),
  /** PUBLISHED entries only (docs/CONTENT_SCHEMA.md §5.3). */
  entries: z.array(ManifestItem),
});
export type ManifestValue = z.infer<typeof Manifest>;

/* ----------------------- licenses/asset-ledger -------------------- */

export const AssetLedgerRecord = z.object({
  assetId: z.string().min(1),
  file: z.string().min(1),
  /** Public source URL, or the literal marker "project-original". */
  sourceUrl: z.string().min(1),
  creator: z.string().min(1),
  license: LicenseCode,
  licenseUrl: z.string().url().optional(),
  attribution: z.string().min(1),
  dateAdded: IsoDate,
  notes: z.string().optional(),
});
export type AssetLedgerRecordValue = z.infer<typeof AssetLedgerRecord>;

export const AssetLedger = z.object({
  schemaVersion: SchemaVersion,
  generatedAt: IsoDateTime.optional(),
  assets: z.array(AssetLedgerRecord),
});
export type AssetLedgerValue = z.infer<typeof AssetLedger>;
