# Content Schema v1.0

Status: DRAFT (Phase 1 sign-off required). Storage target: Cloudflare R2 (object storage — JSON files, **no database**).

## 1. R2 bucket layout

```
/content/
  manifest.json                  # global index + revisions (tiny; polled by clients)
  km/categories.json
  km/entries/<slug>.json         # one file per entry, per language
  en/categories.json
  en/entries/<slug>.json
/media/
  images/original/<slug>/*  images/optimized/<slug>/*  images/thumbs/<slug>/*
  audio/  video/
/licenses/asset-ledger.json      # mandatory license metadata for every asset (see LICENSING.md)
```

One content ID; web and app read the exact same files. Never duplicate content between frontends.

## 2. Global conventions

- **IDs:** `kh-<slug>`; immutable forever, even if slug/title change. Slug: `^[a-z0-9]+(-[a-z0-9]+)*$`.
- **LocalizedText:** object keyed by BCP‑47 subtag: `{ "km": string, "en"?: string, "vi"?: string }`. Resolution: requested → `km` → `en`. At least one of `km`/`en` required.
- Timestamps ISO‑8601 UTC. Every file carries `"schemaVersion": "1.0"`.

## 3. Enums

- **Status:** `DRAFT → REVIEW → APPROVED → PUBLISHED → ARCHIVED` (linear; CMS enforces transitions).
- **LicenseCode:** `PD` · `CC0-1.0` · `CC-BY-4.0` · `CC-BY-SA-4.0` · `CC-BY-NC-4.0` *(non-commercial only)* · `COPYRIGHTED` · `PERMISSION-REQUIRED` *(granted — evidence linked)* · `UNKNOWN` *(release blocker — see LICENSING.md)*.
- **Relation:** `see-also | parent | child`.
- **CreditRole:** `research | author | translator | reviewer | editor`.
- **VideoProvider:** `r2 | external`.

## 4. Block types (structured content — never one giant textarea)

| blockType | Fields |
|---|---|
| `paragraph` | text: LocalizedText |
| `heading` | text: LocalizedText |
| `list` | ordered: bool; items: [{text}] |
| `quote` | text, attribution?: LocalizedText |
| `image` | assetId, alt: LocalizedText, caption? |
| `gallery` | assetIds: string[], caption? |
| `audio` | assetId, title, transcript?: LocalizedText |
| `video` | provider, assetId? \| url?, title |
| `keyFacts` | facts: [{id, label, value: LocalizedText}] |
| `timeline` | events: [{period: string, text: LocalizedText}] |
| `mapPoint` | lat, lng, label, zoom? |
| `callout` | variant: `info\|warning`, text |

## 5. Entry file — `content/en/entries/angkor-wat.json`

### 5.1 Entry example

```json
{
  "schemaVersion": "1.0",
  "id": "kh-angkor-wat",
  "slug": "angkor-wat",
  "type": "temple",
  "categoryId": "temples-monuments",
  "languages": ["en", "km"],
  "title": { "en": "Angkor Wat", "km": "អង្គរវត្ត" },
  "summary": { "en": "The largest religious monument on Earth, built in the early 12th century.", "km": "…" },
  "tags": ["unesco-world-heritage", "12th-century"],
  "coverAssetId": "img-angkor-wat-cover",
  "sections": [
    {
      "id": "overview",
      "title": { "en": "Overview", "km": "ទូទៅ" },
      "blocks": [
        { "blockType": "paragraph", "text": { "en": "…", "km": "…" } },
        { "blockType": "gallery", "assetIds": ["img-angkor-wat-g01"] },
        { "blockType": "keyFacts", "facts": [
          { "id": "built", "label": { "en": "Built" }, "value": { "en": "c. 1113–1150" } }
        ] },
        { "blockType": "timeline", "events": [
          { "period": "c. 1113–1150", "text": { "en": "Constructed under Suryavarman II." } }
        ] },
        { "blockType": "mapPoint", "lat": 13.4125, "lng": 103.867, "zoom": 14, "label": { "en": "Angkor Wat" } }
      ]
    }
  ],
  "sources": [
    { "id": "unesco-whc-angkor", "title": "Angkor", "publisher": "UNESCO World Heritage Centre",
      "url": "https://whc.unesco.org/en/list/668", "dateAccessed": "2026-08-26" }
  ],
  "license": {
    "code": "CC-BY-SA-4.0",
    "attribution": { "en": "Text adapted from UNESCO WHC documentation." },
    "notes": ""
  },
  "related": [ { "entryId": "kh-bayon", "relation": "see-also" } ],
  "credits": [ { "name": "…", "role": "author" } ],
  "status": "PUBLISHED",
  "featuredOrder": 1,
  "publishedAt": "2026-08-26T00:00:00Z",
  "updatedAt": "2026-08-26T00:00:00Z",
  "revision": 1
}
```

### 5.2 `content/en/categories.json`

```json
{
  "schemaVersion": "1.0",
  "language": "en",
  "revision": 3,
  "generatedAt": "2026-08-26T00:00:00Z",
  "categories": [
    { "id": "temples-monuments", "slug": "temples-monuments", "order": 1,
      "title": { "en": "Temples & Monuments", "km": "ប្រាសាទនិងសំណង់" },
      "description": { "en": "…", "km": "…" },
      "coverAssetId": "img-cat-temples" }
  ]
}
```

### 5.3 `content/manifest.json` (cache driver — keep small)

```json
{
  "schemaVersion": "1.0",
  "generatedAt": "2026-08-26T00:00:00Z",
  "globalRevision": 42,
  "languages": ["en", "km"],
  "languagesRevision": { "en": 41, "km": 40 },
  "entries": [
    { "id": "kh-angkor-wat", "slug": "angkor-wat", "categoryId": "temples-monuments",
      "title": { "en": "Angkor Wat", "km": "អង្គរវត្ត" },
      "tags": ["unesco-world-heritage"],
      "thumbAssetId": "img-angkor-wat-thumb",
      "featuredOrder": 1,
      "updatedAt": "2026-08-26T00:00:00Z", "revision": 1 }
  ]
}
```
Manifest lists **PUBLISHED entries only**. `tags` and `featuredOrder` are mirrored here so clients can search/build Featured without fetching every entry (additive v1.x field).

## 6. Media assets

Every `assetId` referenced anywhere must exist in `/licenses/asset-ledger.json` with full license metadata (see LICENSING.md §3). Image variants served from `images/original|optimized|thumbs/<slug>/…` (WebP/AVIF preferred); audio OGG/Opus at sane bitrates; lazy loading everywhere.

## 7. Validation rules (enforced by CMS + schema package)

1. Parses as JSON; `schemaVersion` supported.
2. Required: id, slug, type, categoryId, languages, title, summary, ≥1 section, status, updatedAt, revision.
3. `id === "kh-" + slug`; slug matches `^[a-z0-9]+(-[a-z0-9]+)*$`.
4. `PUBLISHED` ⇒ publishedAt set · sources.length ≥ 1 · coverAssetId present · license.code ∉ {UNKNOWN, CC-BY-NC-4.0} · all referenced assetIds exist in ledger with allowed licenses · at least one of km/en complete.
5. Every `related.entryId` resolves to an existing entry.
6. Status transitions follow DRAFT→REVIEW→APPROVED→PUBLISHED→ARCHIVED.

## 8. Evolution policy

v1.x = additive-only (new optional fields/blockTypes OK). Breaking changes ⇒ v2.0 with migration note in manifest and dual-publish period. Schema package is the single implementation of this doc; docs updated in the same change.

