# ARCHITECTURE DECISION LOG (ADR)
Tài liệu này ghi lại các quyết định thiết kế kiến trúc quan trọng, không được phép thay đổi nếu không có sự đồng ý của Chủ dự án.

---

## ADR-001: Lựa chọn Tech Stack Frontend (10/07/2026)
- **Quyết định:** Sử dụng **Next.js (App Router)** kết hợp **React.js**, **TypeScript** và **Tailwind CSS** cho giao diện người dùng (Frontend). Không sử dụng HTML/CSS tĩnh thuần túy.
- **Lý do (Rationale):**
  - Next.js hỗ trợ SSR/SSG (Server-Side Rendering / Static Site Generation) cực kỳ tốt cho mục tiêu **SEO Top Sale Google** (Requirement số 1).
  - TypeScript đảm bảo mã nguồn chặt chẽ, dễ bảo trì, đáp ứng "Điều 16. Không để Warning/Type Error".
  - Tailwind CSS cho phép clone giao diện An Thái (UI/UX) một cách nhanh chóng và đồng bộ biến màu (Màu Cam).
- **Trạng thái (Status):** Đề xuất (Chờ Approved cùng Kế hoạch Triển khai).
