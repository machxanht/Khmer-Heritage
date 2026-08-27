# KHMER HERITAGE — WORKLOG / HANDOFF

> 🎯 **Mục đích của file này:** model hoặc developer tiếp theo có thể nhặt công việc
> ngay tại chỗ dừng mà không cần đọc lại toàn bộ repo. Cập nhật file này ở CUỐI MỖI
> phiên làm việc, kèm commit id đã push.
>
> Tài liệu quản trị chi tiết nằm ở: `docs/PROJECT_SPEC.md`, `docs/CONTENT_SCHEMA.md`,
> `docs/CONTENT_SOURCES.md`, `docs/LICENSING.md`, `docs/AI_BRIDGE.md`.
> Master plan: `KHMER_HERITAGE_MASTER_PLAN_AND_PROMPTS_e9028413-1 (1).txt`.

## WEB TEST ĐANG MỞ (cập nhật 2026-08-27)

> ⚠️ Phiên mới nhất (xem "VIỆC VỪA LÀM XONG" mục 0) đã thêm CI + SEO/prerender web.
> Dev server cũ ở port 8081 có thể đã dừng — khởi động lại theo hướng dẫn dưới.

- Expo dev server (web) đang chạy tại port 8081 với
  `EXPO_PUBLIC_CONTENT_BASE_URL=https://obscure-happiness-4qwj596g7p7vf7gvr-8787.app.github.dev`
- Ports 8081 + 8787 đã set **public** qua `gh codespace ports visibility` → truy cập
  được từ trình duyệt bất kỳ không cần login.
- **URL test cho owner:** mở `https://obscure-happiness-4qwj596g7p7vf7gvr-8081.app.github.dev`
  (app web) — seed content fetch từ `...-8787...` public URL đã xác minh HTTP 200.
- Lần sau khởi động lại: `npm run seed` và
  `cd app && EXPO_PUBLIC_CONTENT_BASE_URL=https://<codespace-name>-8787.app.github.dev npx expo start --port 8081`,
  nhớ set cả 2 port public (`gh codespace ports visibility 8081:public 8787:public -c <name>`).
- Checklist các kịch bản test vẫn dùng `docs/TESTING_GUIDE.md` (bỏ qua mục QR/Expo Go).

---

## SNAPSHOT HIỆN TẠI *(cập nhật 2026-08-27, sau commit thêm AsyncStorage cache)*

### Tổng tiến độ ước tính: ~50%

| Phase | Phạm vi | Trạng thái |
|---|---|---|
| 0 Foundation | 5 docs quản trị | ✅ DONE |
| 1 Content Model | packages/content-schema + content-client + content-seed + dev-server | ✅ DONE (24/24 tests) |
| 4 Mobile foundation | app/ Expo SDK 57: tabs, Home, Categories, Search, Settings, category/[id], entry/[slug], i18n km/en/vi, states, i18n vi | 🔶 ~80% — còn polish UI, smoke test máy thật |
| 2 Media & Licensing | pipeline ảnh/video R2 | ⛔ CHỜ B2 (chủ repo cấp bucket) — ledger có placeholder CC0 đánh dấu thay thế |
| 3 CMS | soạn nội dung | ⚪ chưa bắt đầu — CHỜ B3 (quyết định auth) |
| 5 Website | static render từ cùng manifest | ⚪ chưa bắt đầu |

### Đã kiểm chứng lần gần nhất
- `npm test` (root): **24/24 pass** · typecheck 3 workspace: **exit 0**
- `npx expo export --platform web`: **pass** (12 routes + async-storage resolved bởi
  Metro) — chứng minh offline persistence build được ở cả web và native

---

## VIỆC VỪA LÀM XONG (phiên trước + phiên này)

0. **Phiên CI + Website SEO (mới nhất, 2026-08-27):** chuyển Phase 5 từ 0% → nền móng xong:
    - **CI gate** `.github/workflows/ci.yml` (new): push/PR vào main → npm ci →
      `npm test` (24 tests) → `npm run typecheck` (đã thêm script `typecheck` cho
      app) → `expo export --platform web` làm smoke-check Metro bundle.
    - **Static prerender SEO**: `entry/[slug].tsx` export `generateStaticParams()`
      đọc trực tiếp `content-seed/content/manifest.json` (Metro resolve JSON ngoài
      projectRoot nhờ watchFolders; tsconfig thêm `resolveJsonModule`) → mỗi entry
      có URL tĩnh `/entry/<slug>` trong web export. Tương tự category/[id].tsx
      với `/category/<id>` từ categories.json.
    - **SEO meta**: component `app/src/components/seo-head.tsx` (no-op trên native,
      render `<Head><title>+meta description` trên web) — gắn vào Entry detail.
    - **Sitemap/robots**: `scripts/generate-sitemap.mjs` (new, chạy `npm run sitemap`
      ở root) sinh `app/public/sitemap.xml` (12 URLs: home + entries + categories,
      lastmod từ updatedAt) + `robots.txt`; SITE_URL env override (default
      khmerheritage.example.com). Expo copy `public/` vào web output khi export.
    - ⚠️ Prerender: HTML tĩnh chưa chứa nội dung entry fetch runtime (client-side
      fetch từ seed server/R2) — đủ cho URL riêng + title/meta; SSR đầy đủ là việc
      lớn hơn, ghi nhận làm tương lai của Phase 5.

0. **Phiên polish (mới nhất):** web test PASS (owner xác nhận Home OK). Polish Entry
   detail trong `app/src/app/entry/[slug].tsx` + `content-blocks.tsx` + `i18n.ts`:
   - FIX: Related entries giờ resolve cover thật qua `resolveAsset` (trước luôn
     `imageUri={null}` → chỉ placeholder) + thêm summary.
   - Sources có `url` → bấm được (ExternalLink, mở in-app browser); License có
     `licenseUrl` → link "View license".
   - Video block provider=external có `url` → nút "Watch video".
   - Dòng meta "Updated {date}" dưới hero (Intl.DateTimeFormat, locale km/vi/en).
   - Key i18n mới: `detail.updated/visitSource/viewLicense/watchVideo` (en+km; vi fallback en).
   - ⚠️ Quirk: typed-routes khiến string động không gán trực tiếp cho `href` — cast qua
     `Parameters<typeof ExternalLink>[0]['href']` (helper `asExternal` trong [slug].tsx).
   - EAS: tạo `app/eas.json` (preview=APK, production=AAB) + `android.package`
     `com.machxanht.khmerheritage` trong `app.json`. Chưa chạy build (cần `eas login` của owner).
   - Kiểm chứng: tsc exit 0 · npm test 24/24 · expo export web pass đủ routes.

1. Phase 0 + 1 hoàn chỉnh: zod schema v1.0 với publish gates; ContentClient §13
   (`getManifest/getCategories/getEntries/getEntry/searchEntries/getFeatured/
   getRelated/resolveAsset`, refresh() theo revision, staleOk fallback,
   CacheAdapter pluggable); seed km+en Angkor Wat (PUBLISHED) & Bayon (REVIEW).
2. App Expo SDK 57 toàn bộ màn hình chính; EntryCard; ContentBlocks renderer;
   States (loading/error/empty); custom tab bar cho web; NativeTabs native;
   config tự map 10.0.2.2 cho Android emulator; metro.config.js monorepo.
3. **Phiên này:** cài `@react-native-async-storage/async-storage@^3.1.1` (peer deps
   `react:*`, `react-native:*` — tương thích), tạo
   `app/src/lib/async-storage-cache.ts` (`AsyncStorageCacheAdapter`, prefix key
   `kh.content.`, nuốt lỗi storage để offline fallback không bao giờ crash boot),
   và thay MemoryCacheAdapter bằng adapter mới trong `app/src/lib/content-context.tsx`
   → cache nội dung giờ GIỮ ĐƯỢC qua các lần khởi động app.

## BƯỚC TIẾP THEO (đề xuất thứ tự)

1. ✅ ~~AsyncStorage CacheAdapter~~ (xong)
2. 🔶 Smoke test: **web ĐÃ TEST THÀNH CÔNG** (owner xác nhận Home render đúng: font Khmer
   OK, featured Angkor Wat, recently updated — ảnh cover là placeholder vì media thuộc
   Phase 2). Còn smoke test trên máy thật Android/iOS (hướng dẫn: `docs/TESTING_GUIDE.md`).
3. ✅ ~~Polish Entry detail~~ (xong — xem mục "VIỆC VỪA LÀM")
4. ✅ ~~CI gate + Phase 5 nền móng (prerender, sitemap, robots, SeoHead)~~ (xong — xem
   mục "VIỆC VỪA LÀM" số 0). Còn lại của Phase 5: deploy static export lên hosting
   (Cloudflare Pages khi B2 xong — cùng nhà cung cấp R2), SITE_URL thật, SSR nâng cao nếu cần.
5. 🔶 EAS build Android APK: `app/eas.json` + `android.package` đã cấu hình sẵn
   (`com.machxanht.khmerheritage`). Còn lại chỉ chạy lệnh: `cd app && npx eas login`
   (cần tài khoản Expo của owner) → `npx eas build -p android --profile preview`.
   ⚠️ Sửa `EXPO_PUBLIC_CONTENT_BASE_URL` trong `eas.json` profile `base` thành URL R2 thật
   khi B2 xong (đang là placeholder `...example.workers.dev`).
6. Phase 2 media pipeline khi B2 xong (upload ảnh thật theo asset-ledger,
   tối ưu webp, gate license trong CI).

## BLOCKER CẦN CHỦ REPO QUYẾT ĐỊNH

- **B2** — cấp Cloudflare R2 bucket + public domain (thay seed server :8787).
- **B3** — phương án auth cho CMS (gợi ý: CMS local-first ghi JSON + git PR, không cần auth server giai đoạn đầu).

## LƯU Ý KỸ THUẬT CHO MODEL/NGƯỜI TIẾP THEO

- Monorepo npm-workspaces; alias `@kh/content-schema`, `@kh/content-client`;
  alias `@/*` = `app/src/*`. Metro config: `app/metro.config.js` (guard
  `config.experiments?.tsconfigPaths` — SDK 57 không set sẵn experiments).
- UI KHÔNG được gọi URL nội dung trực tiếp — luôn qua `useContent().client`.
- Schema v1.0 là luật: PUBLISHED phải ≥1 source, có cover, không dùng license
  UNKNOWN/CC-BY-NC/COPYRIGHTED. Seed JSON trong `content-seed/` chính là spec
  thực thi của schema (tests parse file thật).
- Cache key format client lưu: `json:<path>` (vd `json:/content/km/entries/angkor-wat.json`);
  AsyncStorage adapter thêm prefix `kh.content.` → key đầy đủ `kh.content.json:/content/...`.
  Nếu đổi format nhớ giữ backward-compat hoặc bump hằng số prefix.
- Ở môi trường codespace này: terminal hay không báo completion — hãy redirect
  output ra `/tmp/*.log` rồi đọc file đó; lệnh nền dài hạn nên nohup + poll file.
- Web export dùng làm smoke test nhanh nhất để chứng minh bundle resolve được
  workspace packages (Android/iOS cần thiết bị/EAS).
