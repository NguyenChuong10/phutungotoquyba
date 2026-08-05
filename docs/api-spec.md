# TÀI LIỆU THIẾT KẾ REST API (API SPECIFICATION)
**Dự án:** Quy Ba Auto Parts
**Giai đoạn:** 4 - API Design
**Trạng thái:** DRAFT (Chờ Review)

---

## 1. Authentication (Xác thực)
- `POST /api/auth/register` - Đăng ký tài khoản.
- `POST /api/auth/login` - Đăng nhập (trả về JWT token).
- `GET /api/auth/me` - Lấy thông tin user hiện tại.

## 2. Products (Sản phẩm)
- `GET /api/products` - Lấy danh sách sản phẩm (hỗ trợ query `?category=...&brand=...&search=...&page=...`).
- `GET /api/products/{slug}` - Lấy chi tiết một sản phẩm.
- `POST /api/products` - Tạo sản phẩm mới (Yêu cầu Admin).
- `PUT /api/products/{id}` - Cập nhật sản phẩm (Yêu cầu Admin).
- `DELETE /api/products/{id}` - Xoá sản phẩm (Yêu cầu Admin).

## 3. Categories (Danh mục)
- `GET /api/categories` - Lấy danh sách cây danh mục (Category Tree).
- `POST /api/categories` - Tạo danh mục (Yêu cầu Admin).
- `PUT /api/categories/{id}` - Cập nhật danh mục (Yêu cầu Admin).
- `DELETE /api/categories/{id}` - Xoá danh mục (Yêu cầu Admin).

## 4. Brands (Thương hiệu)
- `GET /api/brands` - Lấy danh sách thương hiệu.
- `POST /api/brands` - Thêm thương hiệu mới (Yêu cầu Admin).
- `PUT /api/brands/{id}` - Sửa thương hiệu (Yêu cầu Admin).

## 5. Orders (Đơn hàng)
- `POST /api/orders` - Khách hàng tạo đơn hàng (Checkout).
- `GET /api/orders` - Khách hàng xem lịch sử đơn hàng của mình. Lấy tất cả đơn hàng nếu là Admin.
- `GET /api/orders/{id}` - Xem chi tiết đơn hàng.
- `PUT /api/orders/{id}/status` - Cập nhật trạng thái đơn hàng (Yêu cầu Admin/Manager).

## 6. News (Tin tức)
- `GET /api/news` - Lấy danh sách bài viết.
- `GET /api/news/{slug}` - Xem chi tiết bài viết.
- `POST /api/news` - Viết bài (Yêu cầu Admin/Content).
- `PUT /api/news/{id}` - Sửa bài.
- `DELETE /api/news/{id}` - Xoá bài.
