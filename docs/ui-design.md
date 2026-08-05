# TÀI LIỆU MÔ TẢ GIAO DIỆN (UI DESIGN)
**Dự án:** Quy Ba Auto Parts
**Giai đoạn:** 6 - UI Design (No Code)
**Trạng thái:** DRAFT (Chờ Review)

---

## 1. Màn hình Home (Trang chủ)
- **Header:** Sticky navbar, logo đỏ QUY BA bên trái, menu ở giữa, ô tìm kiếm và chọn ngôn ngữ bên phải.
- **Hero Slider:** Ảnh nền con đường cao tốc, chữ NEW khổng lồ làm background, hiển thị sản phẩm Tăm Bua lơ lửng 3D, nút "TÌM HIỂU THÊM" đỏ.
- **Tầm nhìn:** Chia 2 cột. Trái là Text đỏ/đen giới thiệu. Phải là nhóm hình ảnh sản phẩm.
- **Lĩnh vực:** Lưới các khối (Cards) màu trắng trên nền xám nhạt, chứa icon (Nhà máy, Đăng kiểm, Đại tu).
- **Footer:** Nền xám đậm `#333`, 4 cột thông tin liên hệ, bản đồ Google, dải bản quyền màu đỏ dưới cùng.

## 2. Màn hình Category (Danh mục sản phẩm)
- **Breadcrumb:** Trang chủ > Sản phẩm > Động cơ tổng thành.
- **Sidebar (Trái):** Danh sách dạng Accordion (có thể mở rộng/thu gọn) bộ lọc Dòng xe, Thương hiệu, Hệ thống.
- **Main Content (Phải):** Thanh công cụ hiển thị (Sắp xếp theo giá, mới nhất). Bên dưới là Grid lưới sản phẩm (3 cột).
- **Pagination:** Phân trang ở dưới cùng.

## 3. Màn hình Product (Chi tiết sản phẩm)
- **Top Section:** 
  - Trái: Hình ảnh sản phẩm lớn và Gallery ảnh nhỏ bên dưới.
  - Phải: Tên sản phẩm lớn (H1), Mã SKU, Giá, Trạng thái (Còn hàng), Khối nhập số lượng (+/-) và nút `Thêm vào giỏ hàng` đỏ, nút `Mua ngay`.
- **Bottom Section:** Các Tab thông tin (Mô tả chi tiết, Thông số kỹ thuật, Đánh giá).

## 4. Màn hình Cart (Giỏ hàng)
- Bảng danh sách các sản phẩm đã chọn: Cột Hình ảnh, Tên, Đơn giá, Số lượng, Thành tiền. Có nút X (Xoá).
- Bên phải (hoặc bên dưới tuỳ thiết bị): Khối Tổng tiền tạm tính và nút `Tiến hành thanh toán` lớn.

## 5. Màn hình Checkout (Thanh toán)
- **Cột trái:** Form nhập thông tin người mua (Họ tên, SĐT, Email, Tỉnh/Thành phố, Địa chỉ chi tiết, Ghi chú).
- **Cột phải:** Khối Tóm tắt đơn hàng (Review order) và Chọn phương thức thanh toán (Radio buttons: COD, Chuyển khoản). Nút `Đặt hàng`.

## 6. Màn hình Admin (Quản trị viên)
- **Layout:** Sidebar menu bên trái (Dashboard, Products, Orders, Users, News), Top bar có avatar Admin.
- **Dashboard:** Biểu đồ doanh thu, số đơn hàng chờ xử lý, số sản phẩm sắp hết hàng.
- **Bảng dữ liệu:** Các trang quản lý đều dùng Data Table với chức năng Search, Filter, Pagination, nút Edit/Delete/Add New.
