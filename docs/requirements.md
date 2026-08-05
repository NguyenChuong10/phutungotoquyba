# SOFTWARE REQUIREMENT SPECIFICATION (SRS)
**Dự án:** Quy Ba Auto Parts
**Trạng thái:** DRAFT (Chờ Approved)

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- **Mục tiêu cốt lõi:** Tăng nhận diện thương hiệu, trở thành kênh E-Catalogue online để khách hàng tra cứu phụ tùng. Nhấn mạnh thông điệp "Giá tốt nhất".
- **Định hướng Marketing:** Đạt Top Sale Google thông qua chiến lược SEO mạnh mẽ.
- **Đối tượng khách hàng (Target Audience):** Tập trung vào khách lẻ (B2C).

## 2. YÊU CẦU GIAO DIỆN & THIẾT KẾ (UI/UX REQUIREMENTS)
- **Bố cục (Layout):** Triển khai giao diện dựa trên các thiết kế (UI Design) riêng của dự án, không clone từ trang web khác.
- **Nhận diện thương hiệu (Branding):** 
  - **Màu chủ đạo (Primary Color):** Màu **CAM (Orange)** thay vì màu đỏ của An Thái (tránh bản quyền và tạo nét riêng).
  - **Hình ảnh:** Sử dụng 100% hình ảnh thực tế/đồ họa riêng của Quy Ba, không dùng lại ảnh của An Thái.

## 3. TÍNH NĂNG CỐT LÕI (CORE FEATURES)

### 3.1. E-Catalogue (Tra cứu phụ tùng)
- Hệ thống danh mục sản phẩm đa cấp (Category Tree).
- Tính năng tìm kiếm (Search) mạnh mẽ để khách hàng dễ dàng tìm phụ tùng.
- Trang chi tiết sản phẩm: Hiển thị hình ảnh rõ nét, thông số kỹ thuật chi tiết, và thông điệp "Giá tốt nhất".
- *(Lưu ý: Không tích hợp tính năng Thêm vào giỏ hàng/Thanh toán online phức tạp vì đây là trang Catalogue).*

### 3.2. Blog / Tin tức / Tư vấn kỹ thuật (SEO Engine)
- Đây là module trọng điểm để kéo Traffic và SEO Top Google.
- Phân loại bài viết: Tin tức công ty, Tư vấn kỹ thuật sửa chữa, Cẩm nang chọn phụ tùng.
- Tối ưu hóa SEO On-page: Thẻ Meta, URL thân thiện, Heading tags chuẩn SEO.

### 3.3. Các trang vệ tinh (Static Pages)
- Trang Chủ (Homepage): Show sản phẩm nổi bật, tin tức mới nhất.
- Trang Giới thiệu (About Us): Nâng tầm nhận diện thương hiệu.
- Trang Giới thiệu Sản phẩm bán chạy (Landing Page): Mô tả chung các dòng sản phẩm thế mạnh (bao gồm 13 danh mục phụ tùng và 7 phân loại xe/máy: tải, ben, khách, đầu kéo, rơ-mooc, động cơ máy phát/máy thủy, xúc lật). Nhấn mạnh thông điệp: 80% phụ tùng nhập từ Trung Quốc, ngoài ra còn các thương hiệu uy tín khác.
- Trang Liên hệ (Contact).

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)
- **Performance:** Tốc độ tải trang cực nhanh (Core Web Vitals tốt) để phục vụ mục tiêu SEO.
- **Responsive:** Hoạt động hoàn hảo trên thiết bị Di động (Mobile-first) vì khách hàng B2C tra cứu trên điện thoại rất nhiều.

---
> [!IMPORTANT]
> **Câu hỏi chờ User xác nhận trước khi Approved:**
> Vì đây là trang E-Catalogue B2C hướng tới "Giá tốt nhất", trên trang chi tiết sản phẩm chúng ta sẽ để nút **"Gọi điện nhận báo giá"** (Call to action liên kết tới Zalo/Hotline) thay vì nút **"Mua ngay"**, đúng không thưa bạn?
