# WORKFLOW: REVIEW FEATURE (`/review-feature`)

> **QUY TRÌNH TỰ ĐÁNH GIÁ & RÀ SOÁT CHẤT LƯỢNG MÃ NGUỒN**: Được gọi để đánh giá lại toàn bộ mã nguồn của một tính năng trước khi nghiệm thu.

---

## 🔍 QUY TRÌNH 5 CỔNG KIỂM DUYỆT QUALITY GATE

1. **Cổng 1: Kiến trúc & Design Pattern**:
   - Kiểm tra xem component có bị vi phạm giới hạn 300 dòng code không.
   - Kiểm tra tính tái sử dụng, tránh duplicate code.
2. **Cổng 2: TypeScript & Typing Integrity**:
   - Xác nhận 0 lỗi `any`, 0 lỗi type-check, 0 lỗi implicit return types.
3. **Cổng 3: UI/UX & Responsive**:
   - Đối chiếu với `docs/DesignSystem.md` về màu sắc, typography và tính năng Responsive trên Mobile/Desktop.
4. **Cổng 4: Performance & SEO**:
   - Kiểm tra tối ưu ảnh `next/image`, thẻ H1 duy nhất, Alt text và Metadata.
5. **Cổng 5: Build Verification**:
   - Chạy lệnh `npm run build` và xác nhận kết quả **0 Error, 0 Warning**.
