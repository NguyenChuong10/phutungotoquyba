# TÀI LIỆU TUYÊN NGÔN DỰ ÁN (PROJECT CHARTER)
**Dự án:** Hệ thống Website Thương mại & Giới thiệu Doanh nghiệp Quy Ba Auto Parts
**Giai đoạn:** STAGE 0 - Project Charter
**Trạng thái:** DRAFT (Chờ Review & Approved)

---

## 1. Tầm nhìn (Vision)
Trở thành nền tảng số hóa hàng đầu trong lĩnh vực sản xuất, phân phối phụ tùng ô tô và cung cấp dịch vụ đại tu, đăng kiểm tại Việt Nam, mang thương hiệu Quy Ba vươn tầm quốc tế.

## 2. Sứ mệnh (Mission)
Cung cấp một kênh giao tiếp và mua sắm trực tuyến toàn diện, minh bạch và tiện lợi nhất cho các đại lý, đối tác và khách hàng cá nhân; tối ưu hóa quy trình vận hành và nâng cao trải nghiệm người dùng thông qua công nghệ hiện đại.

## 3. Mục tiêu (Goal)
- **Mục tiêu ngắn hạn (Phase 1):** Số hóa toàn bộ danh mục sản phẩm (E-Catalogue), xây dựng hình ảnh thương hiệu Quy Ba chuyên nghiệp trên Internet.
- **Mục tiêu trung hạn (Phase 2):** Triển khai hệ thống E-commerce cho phép khách hàng đặt hàng trực tuyến, tích hợp quản lý kho và quy trình xử lý đơn hàng.
- **Mục tiêu dài hạn (Phase 3):** Xây dựng hệ sinh thái CRM/ERP kết nối trực tiếp với đại lý và trạm đăng kiểm/đại tu.

## 4. Phạm vi dự án (Scope)
*Trong giới hạn của lần phát hành đầu tiên (MVP), hệ thống sẽ bao gồm:*
- Giao diện người dùng (Customer-facing Web App): Trang chủ, Giới thiệu, Danh mục Sản phẩm đa cấp, Chi tiết Sản phẩm, Tin tức, Tuyển dụng, Liên hệ.
- Trang quản trị (Admin Dashboard): Quản lý Sản phẩm, Danh mục, Đơn hàng, Tin bài và Tài khoản người dùng.
- Chức năng cốt lõi: Tìm kiếm phụ tùng, Lọc theo bộ lọc chuyên sâu (Dòng xe, Thương hiệu, Hệ thống), Giỏ hàng và Checkout cơ bản.

## 5. Ngoài phạm vi (Out Of Scope)
*Những hạng mục chưa thực hiện trong đợt triển khai này:*
- App di động (iOS/Android) native.
- Tích hợp hệ thống kế toán nội bộ (MISA, SAP...).
- Cổng thanh toán quốc tế (Stripe, PayPal) (chỉ hỗ trợ thanh toán nội địa ở giai đoạn đầu).

## 6. Đối tượng người dùng (Target Users)
- **B2B (Đại lý, Garage):** Cần tra cứu nhanh mã phụ tùng (SKU), xem thông số kỹ thuật chính xác, mua số lượng lớn.
- **B2C (Khách lẻ, Tài xế):** Cần tìm kiếm phụ tùng thay thế nhanh chóng, giao diện dễ sử dụng.
- **Internal Staff (Admin, Quản lý kho, Sales):** Cần hệ thống quản trị trực quan, tốc độ xử lý nhanh.

## 7. Công nghệ đề xuất (Tech Stack)
*(Có thể điều chỉnh dựa trên quyết định của Solution Architect)*
- **Frontend:** Next.js (React), Tailwind CSS, TypeScript.
- **Backend:** Node.js (Express / NestJS), RESTful APIs.
- **Database:** PostgreSQL (Primary DB), Redis (Caching - tuỳ chọn).
- **Hosting/Deployment:** Vercel (FE), AWS/Render (BE & DB).

## 8. Lộ trình (Timeline) - Dự kiến
- **Tuần 1:** Project Charter, Requirements & Architecture Design (Stage 0 -> 5).
- **Tuần 2:** UI/UX Design & Database Setup (Stage 6 -> 7).
- **Tuần 3-4:** Frontend & Backend Coding (Stage 8).
- **Tuần 5:** Testing & QA (Stage 12).
- **Tuần 6:** User Acceptance Testing (UAT) & Deployment (Stage 13).

## 9. Cột mốc quan trọng (Milestones)
- **M0:** Chốt tài liệu thiết kế hệ thống (Approved Docs).
- **M1:** Hoàn thiện giao diện Frontend (UI Mockups to Code).
- **M2:** Hoàn thiện Backend APIs và Database.
- **M3:** Ghép nối hoàn chỉnh (Integration).
- **M4:** Go-live chính thức.
