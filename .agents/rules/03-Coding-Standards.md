# RULE 03: CODING STANDARDS & CLEAN CODE

> **TIÊU CHUẨN MÃ NGUỒN CHUẨN DOANH NGHIỆP**: Mã nguồn dự án Phụ Tùng Ô Tô Q.BA phải luôn sạch sẽ, minh bạch, có thể bảo trì và kiểm thử dễ dàng.

---

## 🚫 CÁC ĐIỀU NGHỊCH LÝ (CẤM TUYỆT ĐỐI KHÔNG ĐƯỢC PHẠM PHẢI)

- ❌ **KHÔNG Duplicate (Lặp mã)**: Thấy mã nguồn lặp lại 2 lần ➔ Bắt buộc tách thành Component / Helper / Custom Hook reusable.
- ❌ **KHÔNG dùng `any`**: TypeScript phải có Type/Interface rõ ràng. Cấm dùng `any` hoặc `@ts-ignore` bừa bãi.
- ❌ **KHÔNG Hardcode**: Các biến cấu hình, địa chỉ, hotline, URL API phải đưa vào config/constants.
- ❌ **KHÔNG Magic Numbers**: Các con số ẩn danh trong logic phải được khai báo thành hằng số có tên nghĩa rõ ràng.
- ❌ **KHÔNG Component > 300 dòng**: Nếu tệp component vượt quá 300 dòng code ➔ Bắt buộc phải chia nhỏ thành các sub-components.

---

## 🌟 CÁC NGUYÊN TẮC BẮT BUỘC NÊN ÁP DỤNG

- ✅ **SOLID Principles**:
  - *Single Responsibility*: Mỗi component/hàm chỉ làm đúng 1 nhiệm vụ duy nhất.
  - *Open/Closed*: Dễ mở rộng, hạn chế chỉnh sửa trực tiếp logic cũ.
- ✅ **DRY (Don't Repeat Yourself)**: Độc lập hóa tài nguyên tái sử dụng.
- ✅ **KISS (Keep It Simple, Stupid)**: Giữ giải pháp đơn giản nhất có thể, tránh Over-engineering.
- ✅ **Feature-first & Atomic Design**:
  - Tổ chức code theo từng tính năng chuyên biệt.
  - Áp dụng cấu trúc Atomic (Atoms ➔ Molecules ➔ Organisms ➔ Templates).
- ✅ **Composition over Inheritance**: Ưu tiên ghép nối các component nhỏ linh hoạt thay vì kế thừa phức tạp.
