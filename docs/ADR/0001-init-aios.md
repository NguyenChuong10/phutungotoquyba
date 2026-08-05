# ADR 0001: KHỞI TẠO AI OPERATING SYSTEM (AIOS) DỰ ÁN PHỤ TÙNG Ô TÔ Q.BA

- **Ngày ghi nhận**: 23/07/2026
- **Trạng thái**: Accepted (Đã chấp thuận)
- **Quyết định bởi**: Chủ dự án & Software Architecture Team

---

## 🎯 BỐI CẢNH (CONTEXT)
Để phát triển hệ thống website Phụ Tùng Ô Tô Q.BA đạt cấp độ doanh nghiệp chuyên nghiệp, duy trì tính nhất quán 100% trên toàn bộ codebase và ngăn chặn tình trạng AI "vừa code vừa khám phá yêu cầu", dự án cần một bộ quy chuẩn điều hành AI Operating System (AIOS) có cấu trúc.

---

## 💡 QUYẾT ĐỊNH (DECISION)
Khởi tạo cấu trúc `.agents/` và `docs/` chứa:
1. `.agents/rules/`: 6 bộ quy chuẩn bất biến (`01-Constitution.md`, `02-Architecture.md`, `03-Coding-Standards.md`, `04-UI-Design.md`, `05-Testing.md`, `06-Git.md`).
2. `.agents/workflows/`: 3 quy trình tự động hóa (`build-feature.md`, `review-feature.md`, `deploy.md`).
3. `docs/`: Bộ tài liệu kỹ thuật chuẩn doanh nghiệp (`PRD.md`, `Architecture.md`, `Database.md`, `API.md`, `DesignSystem.md`, `ADR/`).

---

## 📈 KẾT QUẢ (CONSEQUENCES)
- Mọi thao tác lập trình trong tương lai bắt buộc phải tuân theo luồng Pipeline 11 bước và các quy chuẩn Clean Code trong AIOS.
- Đảm bảo dự án phát triển nhất quán, bền vững và dễ bảo trì.
