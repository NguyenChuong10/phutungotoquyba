# RULE 04: UI DESIGN SYSTEM & UX STANDARDS

> **QUY CHUẨN GIAO DIỆN & TRẢI NGHIỆM NGUỜI DÙNG**: Tuyệt đối KHÔNG TỰ SÁNG TẠO UI tùy tiện ngẫu hứng. Mọi component phải tuân thủ nghiêm ngặt hệ thống Design System thương hiệu Phụ Tùng Ô Tô Q.BA.

---

## 🎨 HỆ THỐNG DESIGN SYSTEM Q.BA

1. **Bảng màu chuẩn (Color Palette)**:
   - 🔴 **Brand Red (Màu đỏ chủ đạo Q.BA)**: `#D90429` / `#FF0000` (dùng cho điểm nhấn, CTA, tên danh mục, Hotline).
   - 🌑 **Dark Carbon (Nền tối sang trọng)**: `#111317` / `#0B0F19` / `#000000` (dùng cho Header, Footer, Modal, Card).
   - ⚪ **Pure White & Slate**: `#FFFFFF` / `bg-slate-50` / `border-slate-200` (dùng cho nền bài viết, thẻ sản phẩm).

2. **Font chữ & Typography**:
   - **Heading Font**: `Montserrat` / `Outfit` font chữ in hoa đậm nét, mạnh mẽ, chuẩn ngành cơ khí vận tải.
   - **Body Font**: `Inter` hỗ trợ tiếng Việt mượt mà, dễ đọc trên mọi thiết bị.

3. **Khoảng cách & Spacing (Design Tokens)**:
   - Tuân thủ hệ quy chuẩn Tailwind Spacing (8px / 16px / 24px / 32px / 48px / 64px).

4. **Animations & Micro-interactions**:
   - Hiệu ứng chuyển động mượt mà (`transition-all duration-300`).
   - Tích hợp `motion-reduce:animate-none` tôn trọng cài đặt hệ thống của người dùng.

5. **Responsive & Mobile First**:
   - Tối ưu hoàn hảo 100% trên cả 3 loại màn hình: **Mobile (<640px)**, **Tablet (640px-1024px)** và **Desktop (>1024px)**.

6. **SEO Best Practices & Accessibility (a11y)**:
   - Chỉ dùng đúng 1 thẻ `<h1>` duy nhất mỗi trang.
   - Đảm bảo thẻ `<Image>` luôn có `alt` mô tả chuẩn SEO.
   - Interactive elements có `aria-label` hỗ trợ trình đọc màn hình.
