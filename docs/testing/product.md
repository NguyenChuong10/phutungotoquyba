# TEST SPECIFICATION: FEATURE PRODUCT

## 🧪 1. AUTOMATED TESTS (E2E & UNIT)
- **Unit Test 1 (Filter Hook):** Kiểm tra `useProductFilter` trả về đúng kết quả khi gõ từ khóa Part No (vd: `VG15`).
- **Unit Test 2 (Security Check):** Kiểm tra `productService.getAllProducts()` không làm rò rỉ `internalCode` trên public page.
- **Build Test:** Chạy `npm run build` trong `frontend/` phải đạt 100% SSG routes (0 Error, 0 Warning).

## 👁️ 2. MANUAL UI INSPECTION CHECKLIST
- `[x]` Tiêu đề sản phẩm xuất hiện ở vị trí đầu tiên cột chi tiết.
- `[x]` Nút "Sẵn Kho Đà Nẵng" nằm trên cùng.
- `[x]` Nút "Part No." nằm ngay dưới tiêu đề sản phẩm.
- `[x]` Bảng Thông Số Kỹ Thuật chỉ hiển thị đúng 2 mục (Mã phụ tùng, Chất liệu).
- `[x]` Breadcrumb hiển thị đủ 4 cấp: `TRANG CHỦ > DANH MỤC PHỤ TÙNG > [TÊN DANH MỤC] > [TÊN SẢN PHẨM]`.
