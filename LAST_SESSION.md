# LỊCH SỬ PHIÊN LÀM VIỆC GẦN NHẤT (LAST SESSION HANDOVER)

> **Mục đích file này**: Dành cho các AI Coding Agent hoặc Lập trình viên trong các phiên làm việc tiếp theo đọc ngay đầu phiên để nắm bắt bối cảnh 100% trong vòng 1 phút, **KHÔNG CẦN PHẢI AUDIT LẠI TOÀN BỘ CODEBASE**.

---

## 🕒 THÔNG TIN PHIÊN LÀM VIỆC
- **Thời gian hoàn tất**: 06/11/2026
- **Trạng thái hệ thống**: ✅ Build hoàn tất không lỗi, Backend & Frontend hoạt động ổn định.
- **Git Commit gần nhất**: `aa58af8` (`feat(odoo): sync product price and visibility status (showPrice) from Odoo ERP`) + Các cải tiến Anti-Slop UI & Skills.

---

## 🎯 CÁC HẠNG MỤC CÔNG VIỆC CHÍNH ĐÃ HOÀN TẤT TRONG PHIÊN NÀY

### 1. Tính năng mới: Đồng bộ Giá & Trạng thái Hiển thị Giá từ Odoo ERP
- **Bối cảnh**: Bên Odoo có cấu hình bật/tắt công tắc *"Hiển thị giá trên Web"*. 
  - Nếu Odoo bật hiển thị giá (`showPrice: true`): Đồng bộ giá tiền số sang Web.
  - Nếu Odoo tắt hiển thị giá (`showPrice: false`) hoặc Hủy liên kết: Web phải hiển thị đúng dòng chữ **"Liên hệ Báo Giá"**.
- **Cơ sở dữ liệu (PostgreSQL)**:
  - Đã thêm cột `show_price BOOLEAN DEFAULT TRUE` vào bảng `products`.
  - Cập nhật Prisma Schema (`backend/prisma/schema.prisma`) và chạy `prisma generate`.
- **Backend Express (Port 5000)**:
  - `POST /api/v1/products/:id/link-odoo` & `/api/v1/products/:webProductId/link-odoo`: Tiếp nhận payload `{ odooProductId, showPrice, price }`.
  - `POST /api/v1/products/sync-by-sku`: Tiếp nhận mảng items kèm `{ showPrice, price }` để đồng bộ hàng loạt.
  - Khi Hủy liên kết đơn lẻ hoặc hàng loạt (`odooProductId = null` / `batch-unlink-odoo`): Tự động reset `showPrice = false` và `price = 0` $\rightarrow$ Web chuyển ngay sang trạng thái *"Liên hệ Báo Giá"*.
  - Các API tra cứu (`/api/v1/products`, `/api/v1/products/:identifier`): Trả về kèm `showPrice`, `odooProductId`, `isOdooLinked`.
  - Bảo mật HMAC-SHA256 (`odooAuthMiddleware.ts`) và CORS whitelist headers (`x-odoo-timestamp`, `x-odoo-signature`, `x-odoo-api-key`, `x-api-key`) đã được cấu hình chặt chẽ.
- **Frontend Next.js (Port 3000)**:
  - Cập nhật logic hiển thị chuẩn hóa chữ **"Liên hệ Báo Giá"** khi `showPrice === false` tại:
    - `frontend/src/app/products/[id]/page.tsx` (Chi tiết sản phẩm)
    - `frontend/src/app/products/page.tsx` (Danh mục sản phẩm)
    - `frontend/src/app/admin/products/page.tsx` (Quản trị sản phẩm)
    - `frontend/src/app/admin/categories/page.tsx` (Quản trị danh mục)
    - `frontend/src/components/admin/SubCategoryProductsModal.tsx`
    - `frontend/src/components/public/SearchModal.tsx`

---

### 2. Cài đặt & Cấu hình Bộ Skills AI vào Dự án
Đã cài đặt thành công 2 bộ Agent Skill chuyên nghiệp vào `.agents/skills/`:
1. **`antislop` (Anti-Slop AI)**: Gồm 6 sub-skills (`antislop`, `antislop-ui`, `antislop-code`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`).
2. **`ui-ux-pro-max-skill`**: Gồm 7 sub-skills (`ui-ux-pro-max`, `ui-styling`, `design-system`, `design`, `brand`, `banner-design`, `slides`).

---

### 3. Audit & Refactor Giao diện theo Tiêu chuẩn Anti-Slop
- **Loại bỏ Hard Gate R-02**: Thay thế triệt để ký tự em dash `—` trong mã nguồn sang dấu gạch ngang tiêu chuẩn `-` tại các bảng quản trị (`admin/products`, `SubCategoryProductsModal`).
- **Khử hiệu ứng Neon Glow ảo**: Thay thế bóng phát sáng Web3 `shadow-[0_0_25px_rgba(...)]` bằng đổ bóng vật lý tự nhiên (`shadow-md`, `shadow-2xl shadow-black/80`) kết hợp viền sắc nét tại các form và modal.
- **Chuẩn hóa góc bo nút bấm (R-05)**: Thay đổi nút hành động chính từ dạng viên thuốc tròn `rounded-full` sang `rounded-xl` cứng cáp, mang đặc trưng cơ khí công nghiệp phụ tùng xe tải nặng.
- **Đạt chuẩn Tap Target Mobile (R-03)**: Tối ưu nút đóng modal trên mobile đạt tối thiểu 44px $\times$ 44px (`min-w-[44px] min-h-[44px]`).

---

### 4. Quy trình Phát triển Frontend đã tạo
- Đã tạo tệp **`FE-WORKFLOW.md`** ngay tại thư mục gốc dự án: Hướng dẫn chi tiết 7 bước runbook (từ đọc context, nạp quy tắc thiết kế, code clean, đối soát anti-slop, type-check `tsc`, cập nhật tài liệu đến commit Git).

---

## 📌 LƯU Ý KỸ THUẬT QUAN TRỌNG CHO PHIÊN TIẾP THEO
1. **Database**: PostgreSQL chạy trên cổng `localhost:5432` (database: `phutungotoquyba`). Cột `show_price` đã có sẵn trong bảng `products`.
2. **Backend**: Express chạy trên cổng `5000`. Khi sửa đổi file trong `backend/src/`, nhớ chạy `npm run build` (`tsc`) tại thư mục `backend`.
3. **Frontend**: Next.js App Router chạy cổng `3000`. Luôn kiểm tra type-check trước khi commit bằng lệnh `cd frontend && npx tsc --noEmit`.
4. **Quy ước giá**: Luôn tôn trọng biến `showPrice` của Odoo. `showPrice: false` đồng nghĩa với việc hiển thị chuỗi text `"Liên hệ Báo Giá"`.

