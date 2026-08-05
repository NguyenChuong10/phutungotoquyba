# TÀI LIỆU THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE DESIGN)
**Dự án:** Quy Ba Auto Parts
**Giai đoạn:** 3 - Database
**Trạng thái:** DRAFT (Chờ Review)

---

## 1. ERD (Entity Relationship Diagram) - Sơ đồ thực thể liên kết

- Một `Category` (Danh mục) có thể chứa nhiều `Product`. Một `Category` có thể là con của một `Category` khác (parent_id).
- Một `Brand` (Thương hiệu) có thể có nhiều `Product`.
- Một `Product` (Sản phẩm) có nhiều `Product_Image` (Hình ảnh).
- Một `User` (Khách hàng) có thể tạo nhiều `Order` (Đơn hàng).
- Một `Order` (Đơn hàng) chứa nhiều `Order_Item` (Chi tiết đơn hàng).
- Một `Order_Item` liên kết với một `Product` cụ thể.
- Một `User` (Admin/Content) có thể viết nhiều bài `News` (Tin tức).

---

## 2. Bảng và Các Cột (Tables & Columns)

### 2.1. Bảng `users` (Quản lý người dùng/khách hàng)
- **id** (UUID/INT, PK): Định danh duy nhất.
- **role** (VARCHAR): Vai trò (admin, customer, manager).
- **email** (VARCHAR, UNIQUE): Tài khoản đăng nhập.
- **password_hash** (VARCHAR): Mật khẩu đã mã hoá.
- **full_name** (VARCHAR): Họ và tên.
- **phone** (VARCHAR): Số điện thoại.
- **created_at**, **updated_at** (TIMESTAMP).

### 2.2. Bảng `categories` (Quản lý danh mục đa cấp)
- **id** (INT, PK)
- **parent_id** (INT, FK -> categories.id, Nullable): Dùng cho danh mục cha-con.
- **name** (VARCHAR)
- **slug** (VARCHAR, UNIQUE)

### 2.3. Bảng `brands` (Quản lý thương hiệu)
- **id** (INT, PK)
- **name** (VARCHAR)
- **slug** (VARCHAR, UNIQUE)
- **logo_url** (VARCHAR)

### 2.4. Bảng `products` (Quản lý Phụ tùng)
- **id** (INT, PK)
- **category_id** (INT, FK -> categories.id)
- **brand_id** (INT, FK -> brands.id)
- **name** (VARCHAR)
- **slug** (VARCHAR, UNIQUE)
- **sku** (VARCHAR, UNIQUE): Mã phụ tùng.
- **description** (TEXT)
- **price** (DECIMAL 10,2)
- **stock_quantity** (INT): Số lượng tồn kho.

### 2.5. Bảng `orders` & `order_items` (Quản lý Đơn hàng)
**orders**
- **id** (INT, PK)
- **user_id** (INT, FK -> users.id)
- **status** (VARCHAR): (pending, confirmed, shipping, completed, cancelled)
- **total_amount** (DECIMAL 10,2)
- **shipping_address** (TEXT)
- **payment_method** (VARCHAR)

**order_items**
- **id** (INT, PK)
- **order_id** (INT, FK -> orders.id)
- **product_id** (INT, FK -> products.id)
- **quantity** (INT)
- **unit_price** (DECIMAL 10,2)

---

## 3. Ràng buộc & Chỉ mục (Constraints & Indexes)

**Constraints (Ràng buộc toàn vẹn):**
- Foreign Keys (Khoá ngoại) sử dụng `ON DELETE RESTRICT` đối với `order_items` để không bao giờ xoá lịch sử đơn hàng nếu sản phẩm bị xoá.
- Khoá ngoại của `products.category_id` và `products.brand_id` có thể dùng `ON DELETE SET NULL`.
- Cột `price` và `stock_quantity` có điều kiện `CHECK (value >= 0)` để đảm bảo số liệu hợp lệ.

**Indexes (Chỉ mục tối ưu hiệu suất):**
- Đánh Index trên cột `slug` ở bảng `products`, `categories`, `brands` để tối ưu SEO URL lookup.
- Đánh Index trên `sku` của `products` để tra cứu nhanh mã phụ tùng.
- Đánh Index trên `user_id` và `status` ở bảng `orders` để query đơn hàng cho Dashboards.
