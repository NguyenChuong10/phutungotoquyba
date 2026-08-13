# SPRINT 03: BACKEND, DATABASE, APIS & ADVANCED FEATURES
**Mục tiêu:** Khởi tạo Backend Node.js/Express, kết nối PostgreSQL Database, xây dựng hệ thống RESTful API Controllers, Báo giá Real-Time, Quản lý Tồn kho, Bảo mật Anti-Spam & Multi-Image Gallery.
**Trạng thái:** HOÀN THÀNH 100% (Completed & Verified)

---

## 🎯 Danh Sách Task Trong Sprint 03:

- `[x]` **Task-020:** Khởi tạo dự án Backend Node.js/Express + Prisma ORM + Kết nối PostgreSQL Database (`quyba_autoparts`).
- `[x]` **Task-023:** API Auth Controller & Auth Security System (Login/Logout, JWT Middleware `verifyAdmin`, OWASP Rate Limiting, Encrypted Storage).
- `[x]` **Task-025:** API Products & Admin Catalog Management (Lấy danh sách, Bộ lọc phân trang, Thêm/Sửa/Xóa sản phẩm Real-Time).
- `[x]` **Task-026:** API Product Detail & Interactive Multi-Image Gallery (Chi tiết sản phẩm, Upload Album 5 ảnh SEO, Chuyển đổi góc chụp mượt mà).
- `[x]` **Task-027:** API Categories & Brands (Cây danh mục phân cấp 2 cấp, Thương hiệu nhà sản xuất Weichai, HOWO, Fast Gear...).
- `[x]` **Task-028:** API Fast Quotation Submission & Real-Time Notification System:
  - Chuông báo âm thanh **C5-E5-G5** (AudioContext Unlocker) + Toast Notification.
  - Theo dõi đơn mới 100% không bỏ sót bằng `maxId` tracking.
  - Đồng bộ đa Tab tức thì dưới 0.1s bằng `BroadcastChannel` & Storage Ping.
  - Full CRUD Quản lý đơn báo giá + Custom Red Danger Delete Confirmation Modal.
- `[x]` **Task-029:** Hệ Thống Bảo Vệ Anti-Spam & Bảo Mật Doanh Nghiệp 5 Lớp:
  - Chống Spam IP (`quotationRateLimiter` 3 đơn / 15 phút).
  - Chuẩn hóa SĐT di động Việt Nam Regex (`03|05|07|08|09` + 8 số).
  - Khóa thời gian chờ 2 phút theo SĐT (2-Min Phone Cooldown).
  - Bẫy Bot tự động (Honeypot Trap).
  - Kháng tấn công XSS Script Injection (`sanitizeText`).
- `[x]` **Task-030:** Hệ Thống Quản Lý Tồn Kho & Điều Chỉnh Giá Phụ Tùng (Stock & Price Inventory):
  - Ràng buộc thủ vệ 3 Lớp **KHÔNG ÂM (< 0)** cho Số lượng tồn kho, Giá bán công khai và Giá vốn nhập kho.
  - Modal cập nhật tồn kho siêu tốc `StockAdjustmentModal` (+1, -1, +5 Kho, Giá bán, Giá vốn, Ghi chú nhập kho).
  - Tự động gắn Badge phân loại tồn kho: 🔴 HẾT HÀNG (0), 🟡 SẮP HẾT HÀNG (1-5), 🟢 CÒN HÀNG (>5).
- `[x]` **Task-031:** Cấu hình SEO toàn trang, format hình ảnh chuẩn hóa SEO Google & Xử lý Hydration Error.

---

## 🛠️ Kết Quả Kiểm Thử (Debug Test Summary):
- **Backend API**: Pass 100% (Auth, Quotation, Inventory, Uploads).
- **Frontend Build**: Pass 100% (`npx tsc --noEmit` 0 errors).
- **Database Integrity**: PostgreSQL 100% synchronized via Prisma ORM.
