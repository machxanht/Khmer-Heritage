# KHMER HERITAGE — WORKLOG / HANDOFF

> 🎯 **Mục đích của file này:** model hoặc developer tiếp theo có thể nhặt công việc
> ngay tại chỗ dừng mà không cần đọc lại toàn bộ repo. Cập nhật file này ở CUỐI MỖI
> phiên làm việc, kèm commit id đã push.
>
> Tài liệu quản trị chi tiết nằm ở: `docs/PROJECT_SPEC.md`, `docs/CONTENT_SCHEMA.md`,
> `docs/CONTENT_SOURCES.md`, `docs/LICENSING.md`, `docs/AI_BRIDGE.md`.
> Master plan: `KHMER_HERITAGE_MASTER_PLAN_AND_PROMPTS_e9028413-1 (1).txt`.

## WEB TEST ĐANG MỞ (cập nhật 2026-08-27)

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
2. 🔶 **Smoke test end-to-end trên Android/iOS — ĐANG DIỄN RA:** hạ tầng test đã sẵn sàng
   (seed server :8787 xác minh 200 trên mọi endpoint; Expo Metro :8081 running, bundle
   1327 modules OK). Hướng dẫn chi tiết từng kịch bản + bảng checklist nằm ở
   `docs/TESTING_GUIDE.md`. Cần người thật cầm máy để điền kết quả (codespace không có thiết bị).
3. Polish Entry detail: gallery/media block, related rails đẹp hơn.
4. Chuẩn bị build EAS Android APK để chủ repo cài thử.
5. Phase 2 media pipeline khi B2 xong (upload ảnh thật theo asset-ledger,
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
