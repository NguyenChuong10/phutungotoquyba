# WORKFLOW: BUILD FEATURE (`/build-feature`)

> **QUY TRÌNH 14 BƯỚC PHÁT TRIỂN TÍNH NĂNG MỚI**: Được gọi trực tiếp khi thực hiện một tính năng mới trong hệ thống Phụ Tùng Ô Tô Q.BA.

---

## 🚀 CÁC BƯỚC THỰC THI TỰ ĐỘNG HÓA

1. **Đọc PRD**: Đọc `docs/PRD.md` để nắm rõ mục tiêu nghiệp vụ.
2. **Đọc Architecture**: Đọc `docs/Architecture.md` xác định tầng kiến trúc.
3. **Đọc Database**: Đọc `docs/Database.md` nắm cấu trúc bảng và mô hình dữ liệu.
4. **Đọc API**: Đọc `docs/API.md` kiểm tra hợp đồng RESTful API.
5. **Đọc Design System**: Đọc `docs/DesignSystem.md` để nạp màu sắc, font chữ và tokens.
6. **Phân tích Đa chiều**: Đóng cùng lúc 10 vai trò (PO, BA, Architect, Frontend, Backend, UI, UX, QA, DevOps, Security) để phân tích rủi ro.
7. **Chia Task**: Phân tách công việc thành các task nhỏ (<= 300 dòng code).
8. **Xin Xác Nhận**: Trình bày Implementation Plan và xin ý kiến phê duyệt (`Approved`) từ Chủ dự án nếu có quyết định lớn.
9. **Implementation (Code)**: Lập trình mã nguồn Clean Code, SOLID, DRY.
10. **Testing (Kiểm thử)**: Chạy `npm run build` kiểm tra Type-check và Responsive.
11. **Review**: Tự rà soát 12 tiêu chí Self-Review trong `05-Testing.md`.
12. **Update Docs**: Cập nhật tệp `ai-journal.md`, `current-state.md` và `changelog.md`.
13. **Commit Message**: Soạn message commit chuẩn `type(scope): description`.
14. **Hoàn Thành**: Báo cáo tổng kết theo chuẩn Definition of Done.
