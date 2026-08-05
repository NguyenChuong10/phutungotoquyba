# DANH SÁCH CÂU HỎI KHẢO SÁT NGHIỆP VỤ (BA QUESTIONNAIRE)
**Dự án:** Quy Ba Auto Parts
**Mục đích:** Dành cho buổi thảo luận (Kick-off / Requirement Gathering) với Khách hàng.

---

## 1. MÔ HÌNH KINH DOANH & MỤC TIÊU (BUSINESS MODEL)
1. Mục tiêu cốt lõi của website này là gì? (Ví dụ: Tăng nhận diện thương hiệu, là kênh Catalogue online để khách tra cứu, hay là một trang E-commerce bán hàng trực tiếp?)
2. Tỷ trọng khách hàng mục tiêu của Quy Ba: B2B (Đại lý, Garage, Trạm đăng kiểm) hay B2C (Tài xế cá nhân) chiếm ưu thế?
3. Nếu bán cho Đại lý (B2B), có yêu cầu hiển thị mức giá chiết khấu riêng cho từng cấp bậc đại lý khi họ đăng nhập không?
4. Định vị thương hiệu Quy Ba so với đối thủ (như An Thái) là gì? Điểm mạnh cốt lõi cần làm nổi bật trên web là gì? (Ví dụ: Chất lượng chuẩn OEM, Giá tốt nhất, hay Dịch vụ bảo hành nhanh?)

## 2. QUẢN LÝ SẢN PHẨM & TÌM KIẾM (PRODUCT & SEARCH)
5. Phụ tùng ô tô có tính tương thích rất phức tạp. Hệ thống có cần chức năng "Lọc phụ tùng theo Hãng xe -> Dòng xe -> Đời xe (Năm sản xuất)" không?
6. Mỗi sản phẩm có những mã định danh nào? (Mã nội bộ Quy Ba, Mã OEM của nhà sản xuất, Mã Barcode)? Khách hàng thường tìm kiếm bằng loại mã nào?
7. Một sản phẩm thường có bao nhiêu hình ảnh/video? Có yêu cầu hình ảnh 360 độ hoặc file PDF hướng dẫn lắp đặt đi kèm không?
8. Các sản phẩm có biến thể (Variants) không? (Ví dụ: Cùng một loại tăm bua nhưng có các kích thước/chất liệu khác nhau?)
9. Quy định về giá: Có hiển thị công khai giá bán không, hay để "Liên hệ nhận báo giá"? Có cho phép ẩn giá với khách chưa đăng nhập không?

## 3. QUY TRÌNH MUA HÀNG & THANH TOÁN (ORDER & PAYMENT FLOW)
10. Hệ thống có cho phép đặt hàng online (Add to Cart -> Checkout) không?
11. Quy trình thanh toán:
    - Khách hàng tự thanh toán qua Cổng thanh toán (VNPay, Momo, Credit Card)?
    - Thanh toán khi nhận hàng (COD)?
    - Thanh toán công nợ (dành cho Đại lý B2B)?
    - Hay chỉ đơn thuần là Gửi Yêu Cầu Báo Giá (Request for Quote - RFQ)?
12. Phí vận chuyển (Shipping) được tính như thế nào? (Miễn phí toàn quốc, tính theo API của Giao Hàng Nhanh/Viettel Post, hay tự thỏa thuận qua điện thoại?)

## 4. QUẢN LÝ KHO & TÍCH HỢP HỆ THỐNG (INVENTORY & INTEGRATION)
13. Việc quản lý số lượng tồn kho có thực hiện trực tiếp trên website này không? Khi có người mua, web có tự trừ kho không?
14. Nếu hết hàng, website hiển thị "Hết hàng" (không cho mua) hay cho phép "Pre-order" (Đặt trước)?
15. Khách hàng hiện đang dùng phần mềm kế toán / quản lý nội bộ nào (MISA, KiotViet, SAP...)? Có cần website kết nối (API) để tự động đồng bộ dữ liệu Tồn kho/Đơn hàng không?

## 5. QUẢN TRỊ & PHÂN QUYỀN (ADMINISTRATION & ROLES)
16. Hệ thống cần bao nhiêu cấp độ phân quyền? (Ví dụ: Super Admin toàn quyền, Nhân viên Sale chỉ xem đơn hàng, Nhân viên Kho chỉ cập nhật sản phẩm, Người viết bài tin tức).
17. Việc cập nhật sản phẩm lên web sẽ được thực hiện thủ công từng món hay cần tính năng Import hàng loạt từ file Excel?

## 6. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL & FUTURE)
18. Mức độ ưu tiên về SEO (Tối ưu hóa tìm kiếm Google)? Có cần Blog/Tin tức/Tư vấn kỹ thuật để kéo traffic không?
19. Ngôn ngữ trên website: Chỉ Tiếng Việt hay đa ngôn ngữ (Tiếng Anh, Tiếng Trung)?
20. Kế hoạch trong tương lai (Phase 2, Phase 3): Có dự định phát triển App Mobile riêng, hay tích hợp hệ thống Affiliate (Tiếp thị liên kết) không? (Để đội ngũ Tech thiết kế Kiến trúc mở từ bây giờ).

## 7. KỲ VỌNG & RÀNG BUỘC DỰ ÁN (EXPECTATIONS & CONSTRAINTS)
*(Lưu ý: Đây là những câu hỏi "mở băng" rất quan trọng để chốt sale và quản lý kỳ vọng)*
21. **Pain Point (Nỗi đau):** Hiện tại doanh nghiệp đang gặp khó khăn gì nhất trong việc bán hàng/quản lý mà trang web này buộc phải giải quyết được?
22. **Deadline:** Khách hàng kỳ vọng khi nào hệ thống có thể Go-live (Chạy chính thức)? Có cần một bản MVP (Tối giản) chạy trước trong 1 tháng tới không?
23. **Ngân sách / Nguồn lực:** Phía khách hàng có đội ngũ nhân sự riêng để nhập liệu hàng ngàn mã phụ tùng lên web, hay yêu cầu bên mình hỗ trợ làm tool crawl/nhập liệu tự động?
