# DATABASE SPECIFICATION: TABLE PRODUCTS (6-DIMENSIONAL MAPPING)

## 📌 1. Purpose (Mục đích)
Lưu trữ thông tin catalogue phụ tùng xe tải nặng, xe đầu kéo, xe ben, động cơ và hộp số.

## 🗄️ 2. Columns & Data Types (Cấu trúc cột)
- `id` (VARCHAR(50), PRIMARY KEY): Mã định danh sản phẩm (vd: `p1`).
- `name` (VARCHAR(255), NOT NULL): Tên sản phẩm hiển thị công khai.
- `internal_name` (VARCHAR(255), NOT NULL): Tên quản trị nội bộ.
- `internal_code` (VARCHAR(50), UNIQUE, NOT NULL): Mã quản lý kho nội bộ Q.BA (vd: `QB-DC-0012`).
- `part_number` (VARCHAR(100), INDEX): Mã phụ tùng dập nhà máy / OEM Part No.
- `category_slug` (VARCHAR(100), FK ➔ categories.slug): Danh mục sản phẩm.
- `brand` (VARCHAR(100), INDEX): Thương hiệu sản xuất (Weichai, Fast Gear, Sinotruk).
- `compatibility` (TEXT[]): Mảng danh sách dòng xe tương thích.
- `image_src` (TEXT): Đường dẫn ảnh chính.
- `gallery` (TEXT[]): Mảng tập hợp ảnh chi tiết.
- `description` (TEXT): Mô tả sản phẩm.
- `specifications` (JSONB): Bảng thông số kỹ thuật rút gọn 2 mục (Part No., Chất liệu).
- `quality_standard` (VARCHAR(100)): Tiêu chuẩn ("Chính Hãng", "Loại 1 Cao Cấp").
- `in_stock` (BOOLEAN, DEFAULT true): Trạng thái sẵn kho Đà Nẵng.
- `created_at` (TIMESTAMP, DEFAULT NOW()): Thời gian khởi tạo.

## ⚙️ 3. Business Rules (Quy tắc Nghiệp vụ)
- `internal_code` không bao giờ được trả ra các API công khai của người dùng bán hàng.
- Chỉ hiển thị badge "Sẵn Kho Đà Nẵng" khi `in_stock = true`.

## 🔌 4. API Sử Dụng
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `POST /api/v1/admin/products` (Admin Only)
- `PUT /api/v1/admin/products/:id` (Admin Only)

## 💻 5. Frontend Component Sử Dụng
- `frontend/src/app/products/page.tsx`
- `frontend/src/app/products/[id]/page.tsx`
- `frontend/src/components/public/VehicleCategory.tsx`
- `frontend/src/app/admin/products/page.tsx`

## 🧪 6. Unit Test Requirements
- Test lọc theo Part No dập nhà máy.
- Test ẩn `internal_code` khi gọi API công khai.
