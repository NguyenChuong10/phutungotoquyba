# TÀI LIỆU PHÂN TÍCH NGHIỆP VỤ (BUSINESS FLOW)
**Dự án:** Quy Ba Auto Parts
**Giai đoạn:** 2 - Business Analysis
**Trạng thái:** DRAFT (Chờ Review)

---

## 1. Định nghĩa các tác nhân (Business Actors)
- **Khách hàng (Customer):** Người tìm kiếm, xem và mua phụ tùng ô tô trên website.
- **Khách hàng Đại lý (B2B Customer - Tuỳ chọn):** Mua sỉ, xem được giá chiết khấu.
- **Quản lý đơn hàng (Sales/Order Manager):** Nhân viên tiếp nhận, kiểm tra và xác nhận đơn hàng.
- **Nhân viên kho (Inventory Staff):** Người chuẩn bị hàng và bàn giao cho đơn vị vận chuyển.
- **Quản trị viên (Admin):** Toàn quyền cấu hình hệ thống, quản lý tài khoản, sản phẩm và nội dung trang web.

---

## 2. Luồng nghiệp vụ chính (Core Business Flows)

### 2.1. Luồng Mua Hàng của Khách Hàng (Customer Purchasing Flow)
Đây là quy trình xương sống (end-to-end) của trải nghiệm khách hàng trên website E-commerce.

`Customer`
&darr;
`Search Product` (Tìm kiếm bằng thanh công cụ hoặc Lọc qua Sidebar Bộ lọc Đa cấp: Dòng xe, Thương hiệu, Hệ thống)
&darr;
`View Product` (Xem thông tin chi tiết: hình ảnh, thông số kỹ thuật, giá, tình trạng tồn kho)
&darr;
`Add to Cart` (Thêm số lượng mong muốn vào giỏ hàng)
&darr;
`Checkout` (Nhập thông tin giao hàng: Tên, Số điện thoại, Địa chỉ, Email)
&darr;
`Payment` (Chọn phương thức thanh toán: COD, Chuyển khoản ngân hàng, hoặc Cổng thanh toán trực tuyến)
&darr;
`Order Created` (Hệ thống tạo đơn, gửi Email/SMS xác nhận cho khách hàng)
&darr;
`Shipping & Tracking` (Nhận hàng và thanh toán - nếu COD).

---

### 2.2. Luồng Xử Lý Đơn Hàng (Order Management Flow)
Quy trình từ góc độ vận hành của hệ thống Quy Ba Auto Parts.

`Hệ thống nhận Order mới`
&darr;
`Order Manager` (Tiếp nhận thông báo, kiểm tra đơn hàng trên Dashboard)
&darr;
`Verify Order` (Gọi điện xác nhận thông tin với khách hàng nếu cần, đổi trạng thái thành "Đã xác nhận")
&darr;
`Inventory Staff` (Nhận phiếu xuất kho, lấy phụ tùng, đóng gói)
&darr;
`Shipping` (Bàn giao cho đối tác vận chuyển - Viettel Post, GHTK..., cập nhật mã Tracking)
&darr;
`Order Completed` (Khách hàng nhận thành công, trạng thái đơn thành "Hoàn thành", cập nhật doanh thu).

---

### 2.3. Luồng Quản Lý Sản Phẩm và Kho (Product & Inventory Flow)
`Admin / Store Manager`
&darr;
`Create/Update Product` (Nhập thông tin phụ tùng: Tên, SKU, Danh mục, Hình ảnh, Giá bán, Giá sỉ)
&darr;
`Stock Management` (Nhập số lượng tồn kho đầu vào)
&darr;
`Auto Deduction` (Hệ thống tự động trừ kho khi có đơn hàng `Order Created`)
&darr;
`Low Stock Alert` (Cảnh báo khi phụ tùng chạm ngưỡng tồn kho thấp để nhập thêm hàng).

---

## 3. Quy trình Ngoại lệ (Edge Cases)
- **Hết hàng (Out of stock):** Nút `Add to Cart` tự động đổi thành `Liên hệ đặt hàng (Pre-order)`.
- **Huỷ đơn hàng (Order Cancellation):** Khách hàng hoặc Admin huỷ đơn trước khi giao hàng &rarr; Hoàn lại số lượng tồn kho (Restock) &rarr; Tiến hành hoàn tiền (Refund) nếu đã thanh toán.
