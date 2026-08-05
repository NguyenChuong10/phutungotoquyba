# AI JOURNAL (NHẬT KÝ PHIÊN LÀM VIỆC)

## Phiên làm việc: 05/08/2026

**1. Mục tiêu phiên:**
- Đọc lại toàn bộ quy định AI Constitution (31 Điều luật) & Memory hệ thống theo quy trình **Memory First**.
- Tinh chỉnh giao diện Slide HeroSection Trang chủ (`/`): Căn lề trái, bỏ phông trắng, chữ **"PHỤ TÙNG |"** màu đen font nghiêng đậm, chữ loại xe màu đỏ tươi nhấp nháy, chấm pagination căn giữa.
- Phân nhóm toàn bộ Component vào 2 thư mục `src/components/admin/` và `src/components/public/`.
- Mở rộng phạm vi địa lý *"trên khắp Miền Trung, Tây Nguyên và toàn quốc"*.
- Xóa bỏ 100% các cam kết "80% OEM" trên toàn dự án.
- Bỏ phần Tầm nhìn & Sứ mệnh trên trang Giới thiệu (`/about`).
- Tinh chỉnh trang Chi tiết Phụ tùng (`/products/[id]`): Tiêu đề sản phẩm lên đầu, nút `Sẵn Kho Đà Nẵng` ở trên cùng, `Part No` ở dưới tiêu đề, bảng thông số chỉ còn 2 mục (Mã phụ tùng, Chất liệu), bổ sung cấp Danh mục vào Breadcrumb, xóa tiêu đề trùng lặp trên banner tối.
- Ẩn toàn bộ `Mã Nội Bộ` khỏi trang bán hàng công khai.
- Tối ưu Form báo giá: Bắt buộc SĐT, Tên không bắt buộc, gõ bỏ chữ `(KHÔNG BẮT BUỘC)` rườm rà.
- Kiểm tra toàn bộ mã nguồn với `npm run build` đạt 0 Error, 0 Warning.

**2. Đã làm gì?**
- **Refactor Component Folder Structure**: Tách `src/components/` thành `admin/` và `public/`, cập nhật toàn bộ import `@/components/public/...`.
- **Refactor HeroSection (`HeroSection.tsx`)**: Căn trái theo ảnh slider, phông chữ **"PHỤ TÙNG |"** màu đen font nghiêng đậm, danh mục nhảy màu đỏ tươi `#FF0000`, chấm pagination căn giữa dưới cùng.
- **Cập nhật phạm vi địa lý**: Thay nội dung tại `/about` và `/careers` thành *"trên khắp Miền Trung, Tây Nguyên và toàn quốc"*.
- **Xóa bỏ 80% OEM**: Đã thay toàn bộ các câu từ/badge "80% OEM" bằng *"CAM KẾT CHẤT LƯỢNG"* / *"HÀNG CHUẨN LOẠI 1 CAO CẤP"*.
- **Tinh chỉnh About Page**: Bỏ section Tầm nhìn & Sứ mệnh.
- **Tinh chỉnh Product Detail Page**:
  - Đưa Tiêu đề lên đầu cột chi tiết.
  - Nút `Sẵn Kho Đà Nẵng` nằm trên cùng.
  - Nút `Part No` nằm dưới Tiêu đề.
  - Rút gọn Bảng Thông Số Kỹ Thuật chỉ còn 2 mục: **Mã phụ tùng (Part No.)** & **Chất liệu**.
  - Breadcrumb: `TRANG CHỦ > DANH MỤC PHỤ TÙNG > [TÊN DANH MỤC] > [TÊN SẢN PHẨM]`.
  - Xóa tiêu đề tên sản phẩm trùng ở banner tối.
- **Bảo mật dữ liệu nội bộ**: Ẩn `Mã Nội Bộ` khỏi `/products`, `/products/[id]`, `QuotationModal.tsx`. Chỉ giữ lại trên `/admin/*`.
- **Tối ưu Form báo giá**: SĐT là trường `required` duy nhất, Họ tên không bắt buộc, gõ bỏ chữ `(KHÔNG BẮT BUỘC)` rườm rà.
- **Áp dụng Mô hình Git + MCP**:
  - Khởi tạo Git repository tại gốc dự án `/Users/mac/Documents/PhuTungOtoQuyBa/`.
  - Tạo tệp `.gitignore` chuẩn hóa loại trừ `node_modules`, `.next`, `dist`, `.env`, `.DS_Store`.
  - Tạo tệp `.mcp.json` định nghĩa các MCP context server (Git context, Memory context, Filesystem context, Database context).
  - Bổ sung quy định `07-MCP-Protocol.md` thuộc hệ thống quy tắc `.agents/rules/`.
  - Cập nhật 12 tiêu chí Definition of Done trong `06-Git.md` và đồng bộ `AI_RULES.md` & `current-state.md`.
- **Tái Thiết Kế Cấu Trúc Thư Mục Chuẩn Doanh Nghiệp (Enterprise Architecture)**:
  - Bổ sung `README.md` tại thư mục gốc tổng quan toàn bộ hệ thống.
  - Tổ chức `web/src/` theo Clean Layered Architecture: `types/` (product, news, quotation, admin, common), `config/` (siteConfig, navigation), `lib/` (utils, formatters, validators), `services/` (productService, newsService, quotationService), `hooks/` (useProductFilter).
  - Dựng sẵn khung Backend `server/` (Node.js/Express + Prisma ORM + PostgreSQL) cho Sprint 03.
- **Kiểm thử**: Chạy `npm run build` thành công 100% (**0 Error, 0 Warning**, 27 Static Routes SSG).
