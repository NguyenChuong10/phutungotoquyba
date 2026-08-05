# REQUIREMENT SPECIFICATION: FEATURE PRODUCT (SẢN PHẨM & E-CATALOGUE)

## 📌 1. MỤC TIÊU TÍNH NĂNG
Cung cấp E-Catalogue điện tử tra cứu danh mục phụ tùng xe tải nặng, xe đầu kéo, động cơ Weichai và hộp số Fast Gear.

## 📋 2. YÊU CẦU GIAO DIỆN & TRẢI NGHIỆM (UI/UX)
- **Trang E-Catalogue (`/products`):**
  - Thanh lọc sản phẩm theo từ khóa (Tìm theo tên, Mã Part No, Dòng xe).
  - Lọc theo Danh mục phụ tùng (`dong-co`, `hop-so`, `gam-cau-phanh`, `ben-thuy-luc`, `ro-mooc`, `cabin-vo`, `seal-phot`, `vong-bi`).
  - Lọc theo Thương hiệu (Sinotruk HOWO, Weichai Power, Fast Gear, Shacman...).

- **Trang Chi tiết Sản phẩm (`/products/[id]`):**
  - **Tiêu đề sản phẩm:** Đưa lên vị trí đầu tiên của cột thông tin chi tiết.
  - **Nút "Sẵn Kho Đà Nẵng":** Đặt ở vị trí trên cùng.
  - **Nút "Part No.":** Đặt ngay bên dưới tiêu đề sản phẩm.
  - **Bảng Thông Số Kỹ Thuật:** Rút gọn chỉ còn đúng 2 mục: **Mã phụ tùng (Part No.)** và **Chất liệu**.
  - **Thanh Breadcrumb:** `TRANG CHỦ > DANH MỤC PHỤ TÙNG > [TÊN DANH MỤC] > [TÊN SẢN PHẨM]`.
  - **Bảo mật:** Ẩn hoàn toàn `Mã Nội Bộ` khỏi người dùng công khai.

## ⚙️ 3. RÀO CHẮN BẢO MẬT & BUSINESS RULES
- Chỉ có Quản trị viên (Admin) đăng nhập mới xem được `internalCode` (Mã Nội Bộ).
- Trạng thái `inStock` hiển thị nhãn xanh "Sẵn Kho Đà Nẵng".
