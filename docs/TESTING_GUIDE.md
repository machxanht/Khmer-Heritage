# KHMER HERITAGE — HƯỚNG DẪN SMOKE TEST (Bước 1)

> Mục tiêu: chạy app thật lần đầu trên điện thoại/emulator và xác nhận mọi luồng
> chính hoạt động. Làm theo đúng thứ tự; đánh dấu ✅ khi pass, ghi chú ❌ lỗi.

---

## A. CHUẨN BỊ

### Cách 1 — Dùng máy thật (khuyên dùng, cần cùng Wi-Fi với codespace/máy dev)
1. Cài app **Expo Go** từ Google Play / App Store.
2. Trên codespace, đảm bảo 2 server đang chạy:
   ```bash
   # Terminal 1
   npm run seed                    # nội dung giả lập R2 tại :8787
   # Terminal 2
   cd app && npx expo start        # Metro bundler tại :8081
   ```
3. Nếu codespace là remote (GitHub Codespaces): mở tab **Ports**, để public port
   `8081` và `8787`, lấy URL dạng `https://<id>-8081.<domain>` .

### Cách 2 — Android emulator (nếu có Android Studio)
```bash
cd app && npm run android
```
Config đã tự map host sang `10.0.2.2` cho emulator Android nên không cần chỉnh gì.

### ⚠️ Quan trọng trước khi mở app
Máy thật KHÔNG truy cập được `localhost` của codespace → vào màn Settings của app,
điền Content source URL = URL public của seed server (port 8787), hoặc đặt biến môi
trường trước khi start:
```bash
cd app && EXPO_PUBLIC_CONTENT_BASE_URL=https://<id>-8787.<domain> npx expo start
```
(Viết URL **không** có dấu `/` cuối.)

---

## B. KỊCH BẢN TEST THEO THỨ TỰ

### Test 1 — Boot lần đầu + tải nội dung ✅/❌
1. Mở app bằng Expo Go (quét QR từ terminal `expo start` hoặc bấm link).
2. **Kỳ vọng:** splash screen → màn Home hiện:
   - Hero rail "Featured" với thẻ Angkor Wat (ảnh cover placeholder là bình thường — media thật thuộc Phase 2)
   - Chip danh mục, mục "Recently updated"
   - Không có màn hình Error đỏ
3. Nếu thấy "Cannot connect to server" → kiểm lại URL content source ở mục A.

### Test 2 — Đa ngôn ngữ km/en/vi ✅/❌
1. Tab **Settings** → đổi UI language sang **ខ្មែរ (km)**.
2. **Kỳ vọng:** toàn bộ nhãn tab/nút đổi sang tiếng Khmer; chữ Khmer hiển thị đúng
   (KHÔNG bị ô vuông □□□ hay chữ chồng chữ).
3. Quay lại Home → tiêu đề entry Angkor Wat phải là **tiếng Khmer** (nội dung km có sẵn).
4. Lặp lại với **English** và **Tiếng Việt**. Ghi chú ngôn ngữ nào còn thiếu bản dịch.

### Test 3 — Điều hướng & Entry detail ✅/❌
1. Chạm thẻ Angkor Wat ở Home → mở `entry/[slug]`.
2. **Kỳ vọng:** tiêu đề, các block nội dung (heading/paragraph), keyFacts,
   timeline, mapPoint, section Sources/License hiện đủ; không crash.
3. Cuộn mượt, không warning vàng nghiêm trọng nào treo màn.
4. Nút back về Home hoạt động.
5. Vào **Categories** → chọn 1 danh mục → danh sách entry của danh mục hiện đúng.

### Test 4 — Tìm kiếm ✅/❌
1. Tab **Search** → gõ "angkor" → kết quả có Angkor Wat.
2. Gõ tiếng Khmer tương ứng (copy từ title km) → vẫn tìm được (search quét tags+title mọi ngôn ngữ).
3. Xóa hết text → ô trống sạch, không lỗi.

### Test 5 — Offline cache (kiểm AsyncStorage vừa thêm) ✅/❌
1. Để app đang ở Home, **tắt seed server** (Ctrl+C ở Terminal 1) hoặc ngắt Wi-Fi.
2. Pull-to-refresh ở Home **hoặc** tắt hẳn app rồi mở lại.
3. **Kỳ vọng:** app KHÔNG chết; hiện dữ liệu cũ từ cache (staleOk fallback).
   Có thể có thông báo lỗi nhẹ nhưng nội dung vẫn xem được.
4. Bật lại seed server (`npm run seed`) → refresh → dữ liệu tải lại bình thường.

### Test 6 — Refresh revision ✅/❌
1. Sửa file `content-seed/content/manifest.json`: tăng `globalRevision` lên `+1`.
2. Ở Settings app → nút **Refresh**.
3. **Kỳ vọng:** app fetch manifest mới, không lỗi (nội dung giống vì chưa sửa entries).

### Test 7 — Dark mode + nền tảng ✅/❌
1. Bật Dark mode hệ điều hành → mở lại app → màu sắc thích ứng, chữ dễ đọc.
2. Web (nếu tiện): `cd app && npx expo start --web` — tab bar custom phải thay NativeTabs.

---

## C. SAU KHI TEST
- Điền kết quả vào bảng dưới đây rồi commit cùng WORKLOG update:

| # | Kịch bản | Android/iOS | Ghi chú |
|---|---|---|---|
| 1 | Boot + Featured | ☐ | |
| 2 | i18n km/en/vi | ☐ | |
| 3 | Detail/Điều hướng | ☐ | |
| 4 | Search | ☐ | |
| 5 | Offline cache | ☐ | |
| 6 | Refresh revision | ☐ | |
| 7 | Dark/Web | ☐ | |

- Các lỗi phát sinh: chụp screenshot + console log của terminal `expo start`,
  tạo issue hoặc ghi trực tiếp vào Section A của `docs/AI_BRIDGE.md`.

## D. TRẠNG THÁI SERVER HIỆN TẠI (đã xác minh trong codespace)
- Seed server :8787 → manifest/km/en/categories/ledger đều **200** ✅
- Expo Metro :8081 → **Waiting on http://localhost:8081**, bundle iOS/web thành công
  (1327 modules) ✅ · lỗi DevTools GUI chỉ dính lib Desktop browser trong codespace,
  KHÔNG ảnh hưởng test qua Expo Go.
