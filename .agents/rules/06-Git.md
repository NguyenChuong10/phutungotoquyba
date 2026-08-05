# RULE 06: DEFINITION OF DONE & GIT CONVENTION

> **ĐỊNH NGHĨA HOÀN THÀNH (DEFINITION OF DONE)**: Một Task chỉ được công nhận là `DONE` (Hoàn thành) khi và chỉ khi đạt đủ **12 TIÊU CHÍ BẤT BIẾN**.

---

## ✅ 12 TIÊU CHÍ DEFINITION OF DONE

- `[x]` **1. Requirement**: Yêu cầu tính năng được làm rõ 100%.
- `[x]` **2. Analysis**: Đã phân tích luồng nghiệp vụ & ảnh hưởng.
- `[x]` **3. Architecture**: Đã xác định vị trí trong kiến trúc hệ thống.
- `[x]` **4. Database**: Đã cập nhật Schema / Model dữ liệu (nếu có).
- `[x]` **5. API**: Đã xác định API Contract (nếu có).
- `[x]` **6. UI**: Đã đáp ứng chuẩn Design System & Responsive.
- `[x]` **7. Code**: Lập trình mã nguồn Clean Code, SOLID, DRY.
- `[x]` **8. Test**: Chạy `npm run build` biên dịch thành công **0 Error, 0 Warning**.
- `[x]` **9. Documentation**: Cập nhật tệp `ai-journal.md`, `current-state.md` và `changelog.md`.
- `[x]` **10. MCP Protocol**: Xác nhận tính toàn vẹn của ngữ cảnh MCP & bộ nhớ hệ thống.
- `[x]` **11. Git Commit**: Commit message chuẩn Conventional Commits.
- `[x]` **12. Self Review**: Tự rà soát 12 tiêu chuẩn chất lượng mã nguồn.

---

## 📌 QUY CHUẨN COMMIT MESSAGE (CONVENTIONAL COMMITS)

Mọi commit message phải tuân theo cú pháp:
`type(scope): description`

- `feat`: Thêm tính năng mới (vd: `feat(about): create about page UI with warehouse photos`).
- `fix`: Sửa lỗi (vd: `fix(navbar): ensure transparent navbar applies only on homepage`).
- `docs`: Cập nhật tài liệu (vd: `docs(aios): initialize .agents/rules and docs architecture`).
- `style`: Chỉnh sửa giao diện CSS/Tailwind (vd: `style(footer): redesign 12-col grid layout`).
- `refactor`: Tối ưu mã nguồn không đổi hành vi (vd: `refactor(assets): rename image folders to kebab-case`).
