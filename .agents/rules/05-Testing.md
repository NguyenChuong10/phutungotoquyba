# RULE 05: TESTING & MANDATORY SELF-REVIEW

> **QUY CHUẨN TỰ KIỂM THỬ VÀ ĐÁNH GIÁ MÃ NGUỒN**: Việc viết xong mã nguồn KHÔNG ĐỒNG NGHĨA với hoàn thành task. Bắt buộc phải thực hiện tự kiểm thử và tự đánh giá (Self-Review) theo 12 tiêu chuẩn nghiêm ngặt.

---

## 📋 CHECKLIST 12 MỤC TỰ KIỂM THỬ (SELF-REVIEW CHECKLIST)

Sau khi hoàn thành việc viết code, AI bắt buộc phải đối chiếu qua 12 mục:

1. 🧠 **Logic**: Mã nguồn chạy đúng yêu cầu nghiệp vụ, không bị sót Edge cases.
2. ⚡ **Performance**: Không có re-render thừa, image được tối ưu `next/image` sizes/priority.
3. 🔍 **SEO**: Có thẻ title, meta description, H1 duy nhất, alt text đầy đủ.
4. ♿ **Accessibility (a11y)**: Thẻ tương tác có `aria-label`, độ tương phản màu sắc đạt chuẩn.
5. 🔒 **Security**: Không để lộ bí mật, API key hay thông tin nhạy cảm.
6. 📱 **Responsive**: Kiểm tra hiển thị sạch sẽ trên Mobile, Tablet và Desktop.
7. 🏷️ **Typing**: TypeScript type-check xanh mượt 100%, không bị lỗi implicit `any`.
8. 📛 **Naming**: Tên biến/component rõ nghĩa, tuân thủ `camelCase`, `PascalCase`, `kebab-case`.
9. 📂 **Folder Structure**: Đặt file đúng vị trí quy định trong kiến trúc.
10. 🧹 **Dead Code**: Đã dọn dẹp các biến, hàm, import thừa không sử dụng.
11. 📦 **Bundle Size**: Không import các thư viện quá nặng bừa bãi.
12. 🛠️ **Build Check**: Thực thi thành công lệnh `npm run build` với **0 Error, 0 Warning**.

---

> ⚠️ **NẾU CÒN BẤT KỲ LỖI NÀO ➔ TASK CHƯA ĐƯỢC PHÉP KẾT THÚC.**
