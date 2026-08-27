# AI Bridge Protocol

Purpose (master §18): reduce copy/paste between AIs and preserve task history. This file is an **append-only relay log**.

- **Section A** — latest task issued *to* Codex (normally authored by ChatGPT/owner).
- **Section B** — latest result reported *by* Codex.

Rules: newest entry goes on TOP of its section. Never delete or rewrite previous entries; supersede with a new numbered one. If two AIs would touch the same code area, the newest A-entry wins as source of truth.

## Template — A (task)

```
### A-<n> · <date> · from: <who> · status: OPEN|SUPERSEDED|DONE
Task: <one-paragraph directive>
Constraints: <explicit constraints>
Priority: P0..P3
Depends-on: <B-ids / blockers>
```

## Template — B (report)

```
### B-<n> · <date> · by: Codex · answers: A-<n>
Files changed: <paths>
Changes: <bullets>
Tests: <what ran, results>
Build: <result>
Issues/Risks: <bullets>
Blockers needing owner decision: <B1..>
Remaining work: <bullets>
```

---

## Section A — Tasks for Codex

### A-002 · 2026-08-26 · from: Owner · status: OPEN
Task: Blocker B1 RESOLVED — Stack Option A approved: **Expo (React Native) + TypeScript**. Proceed to Phase 1 (Content Model): implement `packages/content-schema` (types + zod validation exactly per docs/CONTENT_SCHEMA.md v1.0), `packages/content-client` (content service API per master §13), and `content-seed/` sample data proving the schema end-to-end with tests. Then scaffold the Expo app foundation consuming the same packages.
Constraints: master §24 hard requirements unchanged; no database; schema-first; no hardcoded content in UI.
Priority: P0
Depends-on: B-001

### A-001 · 2026-08-26 · from: Owner · status: DONE
Task: Act as lead AI developer for KHMER HERITAGE. Treat the master plan txt as the binding specification. Audit the current repo, then implement the appropriate next phase, prioritizing foundation/data architecture over UI. Build Android+iOS from one codebase. Report files changed/changes/tests/build/issues per task. Do not guess unclear points — raise blockers instead.
Constraints: obey HARD REQUIREMENTS §24 (shared content source, R2 storage, schema-first, no hardcoded content, clean licensing, no added databases).
Priority: P0
Depends-on: —

## Section B — Results from Codex

### B-006 · 2026-08-27 · by: Codex · answers: A-001 (Phase 5 foundation + CI gate)
Files changed: .github/workflows/ci.yml (new) · scripts/generate-sitemap.mjs (new) · app/src/components/seo-head.tsx (new) · app/src/app/entry/[slug].tsx (+generateStaticParams, SeoHead) · app/src/app/category/[id].tsx (+generateStaticParams, null-guard) · app/tsconfig.json (resolveJsonModule) · app/package.json (+typecheck script) · package.json (+sitemap script) · docs/WORKLOG.md
Changes: CI quality gate on push/PR to main (npm ci → tests → typecheck → expo web export smoke check); web SEO foundation — generateStaticParams in entry/category routes reads content-seed JSON directly (Metro watchFolders resolves paths outside projectRoot), SeoHead component (expo-router/head, web-only no-op on native), sitemap.xml (12 URLs w/ lastmod from manifest updatedAt) + robots.txt generated into app/public/ via `npm run sitemap`.
Tests: sitemap generator exit 0 output verified; typecheck/tests/export run — see WORKLOG.
Build: n/a beyond export smoke check in CI.
Issues/Risks: prerendered HTML lacks runtime-fetched entry body (client-side fetch from R2/seed server); full SSR deferred as future Phase 5 work. Default SITE_URL is a placeholder until hosting decision (suggest Cloudflare Pages w/ B2).
Blockers needing owner decision: B2 (R2), B3 (CMS auth) unchanged.

### B-005 · 2026-08-27 · by: Codex · answers: A-002 (smoke-test infrastructure)
Files changed: docs/TESTING_GUIDE.md (new) · docs/WORKLOG.md
Changes: stood up test infrastructure — seed server :8787 verified serving all endpoints HTTP 200 (manifest, km/en categories+entries, asset ledger); Expo Metro dev server running on :8081, iOS/web bundle succeeded with 1327 modules incl. new async-storage; wrote detailed Vietnamese smoke-test guide `docs/TESTING_GUIDE.md` (7 scenarios incl. offline-cache validation of B-004, revision refresh, Khmer font rendering checklist).
Tests: curl checks all 200 · Metro bundle OK. Actual on-device pass requires owner's phone/emulator — codespace has no device.
Build: n/a (servers verified live).
Issues/Risks: DevTools GUI lib error in codespace is cosmetic only; phone cannot reach codespace localhost — must use public forwarded port or EXPO_PUBLIC_CONTENT_BASE_URL (instructions in guide §A).
Blockers needing owner decision: B2 (R2), B3 (CMS auth) unchanged.

### B-004 · 2026-08-27 · by: Codex · answers: A-002 (offline persistence)
Files changed: app/src/lib/async-storage-cache.ts (new) · app/src/lib/content-context.tsx · app/package.json (+@react-native-async-storage/async-storage@^3.1.1) · docs/WORKLOG.md (new handoff/work-history doc)
Changes: replaced memory-only cache with persistent AsyncStorageCacheAdapter (keys prefixed `kh.content.`, storage failures swallowed → degrade to cache-miss, never crash boot) wired into the single ContentClient provider; wrote docs/WORKLOG.md as a session-handoff record so future models/devs can resume without re-auditing the repo.
Tests: app `tsc --noEmit` → exit 0; package typecheck OK; peer deps verified (react */react-native *).
Build: `npx expo export --platform web` re-run after change → **success**, 12 static routes + entry-*.js (2.2MB) incl. async-storage module resolved by Metro.
Issues/Risks: device smoke test still outstanding; AsyncStorage on web maps to localStorage automatically.
Blockers needing owner decision: B2 (R2 provisioning), B3 (CMS auth choice) unchanged.

### B-003 · 2026-08-26 · by: Codex · answers: A-002 (mobile scaffold)
Files changed: app/** (Expo SDK 57 scaffold; metro.config.js monorepo config; src/lib/{config,content-context,i18n,language-context,use-resource}; src/components/{states,entry-card,content-blocks,app-tabs,app-tabs.web}; src/types/css-modules.d.ts; src/app/(tabs)/{_layout,index,categories,search,settings}.tsx; src/app/category/[id].tsx; src/app/entry/[slug].tsx; app.json branding/scheme) · .env.example (root)
Changes: full navigation shell (NativeTabs on iOS/Android, custom tab bar on web) · Home (featured hero rail, recently updated, category chips) · Categories tab + category detail · manifest-driven Search · Settings (km/en/vi UI language, content-source URL, revision display, manual refresh) · Entry detail rendering every schema v1.0 block type incl. sources, license attribution and related rails · consistent Loading/Error/Empty states on every screen · staleOk offline fallback throughout · Android-emulator host mapping (10.0.2.2).
Tests: root `npm test` → 24/24 pass; `npm run typecheck` across all three workspaces → exit 0; `npx expo export --platform web` → **exit 0**, all 12 routes statically bundled (proves Metro resolves @kh/* workspace packages).
Build: web bundle ✅. Android/iOS native builds require a device/EAS — not runnable in this environment.
Issues/Risks: cache persistence still memory-only (AsyncStorage adapter = next step); Khmer copy needs native-speaker review; media files arrive with Phase 2 (placeholders degrade gracefully today).
Blockers needing owner decision: B2 (R2 provisioning) unchanged.
Remaining work: AsyncStorage-backed CacheAdapter · entry detail visual polish · Phase 2 media pipeline · Phase 3 CMS.

### B-002 · 2026-08-26 · by: Codex · answers: A-002
Files changed: package.json · tsconfig.base.json · .gitignore · packages/content-schema/** (src/schema.ts, src/collections.ts, src/index.ts, tests/) · packages/content-client/** (src/cache.ts, src/client.ts, src/index.ts, tests/) · content-seed/** (content/manifest.json, en+km categories, en+km entries angkor-wat & bayon, licenses/asset-ledger.json) · scripts/dev-server.mjs
Changes: npm-workspaces monorepo; zod implementation of Content Schema v1.0 with publish gates (sources ≥1, cover required, license ∉ {UNKNOWN, CC-BY-NC-4.0, COPYRIGHTED}, primary-language completeness, id=kh-slug, video r2/external rule); ContentClient implementing master §13 API + revision-based refresh() + staleOk offline fallback via pluggable CacheAdapter; seed pilot data proving schema end-to-end in km+en; asset ledger with CC0 placeholders explicitly flagged for replacement before release.
Tests: `npm test` → 24/24 pass (schema 14, client 10). `npm run typecheck` → clean (both packages). Seed JSON doubles as executable spec (tests parse the real files).
Build: n/a — no app yet.
Issues/Risks: Khmer copy needs native-speaker editorial review (flagged in entry license.notes) · media files themselves arrive in Phase 2 (ledger entries are declared placeholders).
Blockers needing owner decision: B2 (R2 bucket/domain) still open — dev proceeds against scripts/dev-server.mjs on :8787.
Remaining work: scaffold Expo app `/app` consuming @kh/* packages (Phase 4 foundation: navigation shell, home/category/detail wiring, i18n layer, loading/error/empty states).

### B-001 · 2026-08-26 · by: Codex · answers: A-001
Files changed: docs/PROJECT_SPEC.md, docs/CONTENT_SCHEMA.md, docs/CONTENT_SOURCES.md, docs/LICENSING.md, docs/AI_BRIDGE.md (created).
Changes: Phase-0 audit (repo empty except README + master plan) → produced the five governing docs; architecture proposal (R2 + content/media/UI layers, manifest-revision caching); JSON content schema v1.0; sources registry + tiers; licensing policy + release gate; bridge protocol with templates.
Tests: none runnable yet (no code). Docs self-reviewed against master §1–§28.
Build: n/a.
Issues/Risks: none in docs; stack undecided.
Blockers needing owner decision: **B1** mobile framework (proposal: Expo React Native + TypeScript; alternatives: Flutter, native) · **B2** R2 bucket/public domain provisioning · **B3** CMS auth choice (Phase 3).
Remaining work: after B1 → Phase 1 (implement schema package + seed content), Phase 2 prep (loader/caching contract with local seed server).
