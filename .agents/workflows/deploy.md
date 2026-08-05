# WORKFLOW: DEPLOYMENT VERIFICATION (`/deploy`)

> **QUY TRÌNH KIỂM TRA SẴN SÀNG PHÁT HÀNH HỆ THỐNG**: Sử dụng để kiểm tra tổng thể dự án trước khi đưa lên môi trường Staging / Production.

---

## 🛡️ CÁC BƯỚC XÁC NHẬN DEPLOYMENT

1. **Clean Production Build**: Thực thi `npm run build` trong môi trường sản xuất.
2. **Static Route Checking**: Xác nhận tất cả các trang tĩnh (`/`, `/about`, `/contact`...) được prerender mượt mà.
3. **Assets Integrity Check**: Xác nhận tất cả ảnh trong `public/images/` tồn tại đúng đường dẫn kebab-case.
4. **Memory Verification**: Cập nhật tệp `current-state.md` và `changelog.md` phản ánh đúng phiên bản phát hành.
5. **Release Ready Report**: Tạo báo cáo nghiệm thu hoàn tất cho Chủ dự án.
