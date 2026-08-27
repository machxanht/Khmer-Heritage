# KHMER HERITAGE — Project Specification

- **Version:** 1.0 · **Date:** 2026-08-26 · **Status:** ACTIVE
- **Governing document:** `KHMER_HERITAGE_MASTER_PLAN_AND_PROMPTS_e9028413-1 (1).txt` (repo root). This spec operationalizes it; on any conflict, the master plan wins.

## 1. Purpose

KHMER HERITAGE is a digital encyclopedia/ecosystem of Khmer heritage and culture. Priority order: **Android → iOS → Website**, all frontends reading **one shared content source**. CMS updates must reach app and website without app releases and without duplicated content stores.

## 2. Product & Core Experiences

MVP focus: **Khmer Heritage Encyclopedia** — temples/architecture, history, arts & sculpture, music & instruments, festivals & rituals, script & language, clothing, cuisine, crafts, places, people, mythology.

Core screens: Home/Featured, Categories, Category detail, Search, Entry detail (cover, summary, key facts, structured sections, gallery, audio/video, sources, related), Timeline/Map where appropriate, Recently updated.

## 3. Languages

1. Khmer (`km`) 2. English (`en`) 3. Extensible (`vi`, others). No UI strings or content hardcoded in components. Fallback chain for any localized value: requested language → `km` → `en`.

## 4. Architecture

Three strictly separated layers:

```
┌─────────────────────────── UI Layer ───────────────────────────┐
│ Mobile app (Android/iOS) now · Website later · CMS (admin)      │
└──────────────▲───────────────────────────────▲──────────────────┘
               │ typed client                  │ write path (auth only)
┌──────────────┴──────────────┐   ┌────────────┴──────────────────┐
│ Content Service             │   │ CMS publisher                 │
│ getCategories() getEntry()  │   │ validates schema; writes JSON │
│ searchEntries() getFeatured │   │ + uploads media to R2         │
│ getRelated() resolveAsset() │   └────────────┬──────────────────┘
└──────────────▲──────────────┘                ▼
┌──────────────┴──────────────────────────────────────────────────┐
│ CLOUDFLARE R2 — single source of truth                          │
│ /content/** (JSON) · /media/** · /licenses/asset-ledger.json    │
└─────────────────────────────────────────────────────────────────┘
```

- **R2 is object storage, not a DB** → schema-validated JSON files in MVP. No Supabase/D1/database without an approved proposal.
- **No R2 URLs hardcoded in UI** — base URL lives once in config; access only via the content service.
- **Cache/versioning:** clients poll tiny `/content/manifest.json`; monotonic `revision` numbers drive invalidation. Cache: category metadata, featured entries, recently viewed entries, thumbnails, small assets.
- **Search MVP:** client-side index over manifest metadata (title, slug, category, tags); full-text/Khmer-aware search deferred.
- **Security:** authenticated admin write path; secrets never committed/shipped; uploads validated (type/size/filename/path/authz); only public assets public.

## 5. Stack Decision — ✅ APPROVED (A-002, 2026-08-26)

Decision: **Expo (React Native) + TypeScript** (was the proposal; alternatives below kept for record):

| Option | Verdict |
|---|---|
| **A. Expo (React Native) + TypeScript** ✅ **APPROVED** | 1 codebase → Android+iOS (+Expo Web later). TS types + zod = one schema definition shared by app/web/CMS tooling. EAS free tier, OTA fixes; fits §21 cost goal. |
| B. Flutter (Dart) | Excellent perf/UI parity, but Dart types can't be shared with future web/CMS tooling. |
| C. Native Kotlin + Swift | Max fidelity, 2× maintenance; contradicts lean-MVP principle (§28). |

Phase 1 scaffolding starts only after B1 is answered in `AI_BRIDGE.md`.

## 6. Repository Layout

```
/app/                    mobile app (Expo RN + TS) — Android+iOS, web-ready
/packages/content-schema/ types + zod validation for docs/CONTENT_SCHEMA.md
/packages/content-client/ fetch/cache service (getCategories, getEntry, …)
/content-seed/           pilot sample JSON — mirrors R2 bucket layout for local dev
/docs/                   the five governing documents
/scripts/dev-server.mjs  zero-dep static server emulating R2 for development
/cms/                    Phase 3
```

## 7. Phase Status (master §19)

| Phase | Scope | Status |
|---|---|---|
| 0 Foundation | repo audit · 5 docs · architecture | ✅ **COMPLETE** |
| 1 Content Model | schema impl · categories · sample entries | ✅ **COMPLETE** (`@kh/content-schema` + `@kh/content-client` + seed; 24 tests green) |
| 2 R2 Pipeline | bucket layout · loader · caching · versioning | blocked by B2 → local seed mode meanwhile |
| 3 CMS MVP | auth · CRUD · upload · publish flow | after Phase 1–2 |
| 4 Mobile | home/category/search/detail/gallery/related/cache/states | **IN PROGRESS** — Expo shell + core screens done, web export verified; cache persistence + polish remaining |
| 5 Website | shared data · SEO · direct entry URLs | after Phase 4 |
| 6 Content | 10–20 pilot entries (§20 list) | parallel from Phase 1 |
| 7 QA | platforms · slow network · cache · licensing audit | last |

## 8. Acceptance Criteria (condensed from §23)

- **DATA:** app+web read same source · no duplicate content · CMS update propagates · centralized media · documented schema.
- **CMS:** auth · create/edit · upload · source/license fields · preview · publish/unpublish.
- **APP:** Android & iOS stable · home/categories/search/detail/related · loading/error/empty states · cache.
- **WEB:** responsive · SEO · direct entry URLs · shared data · search.
- **CONTENT:** sourced pilot · no unknown-license assets · license metadata · attributions.
- **PERFORMANCE:** lazy loading · optimized images · caching · slow-network tolerance.

## 9. Binding Hard Requirements (§24, abridged)

1. No encyclopedia content hardcoded in UI. 2. App+web share one content source. 3. R2 = preferred storage/source of truth. 4. No Supabase/D1/DB without approved proposal. 5. Schema before CMS. 6–12. Every item has sources; every media asset has license/attribution metadata; unknown-license assets forbidden; no CC BY-NC commercially; Facebook/YouTube/free-download ≠ public domain; personal recordings need commercial permission when applicable. 13. Premium/modern/Khmer UI, respectful, readable, mobile-first, no ornament overload. 14. Mobile-first. 15. No over-engineering. Deviations require written justification + owner sign-off via `docs/AI_BRIDGE.md`.

## 10. Open Questions / Blockers

- **B1 — Mobile framework:** ✅ RESOLVED 2026-08-26 → Expo (React Native) + TypeScript (A-002).
- **B2 — R2 access:** owner provides bucket + public custom domain (or approves r2.dev for dev). Credentials stay OUT of git. Until then, `content-seed/` + `scripts/dev-server.mjs` emulate the contract exactly.
- **B3 — CMS auth mechanism:** deferred to Phase 3; options will be proposed, not silently chosen.

