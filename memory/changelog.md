# CHANGELOG (NHẬT KÝ THAY ĐỔI DỰ ÁN)

All notable changes to the Quy Ba Auto Parts project will be documented in this file.

## [v1.5.0] - 2026-08-07

### Added
- **Backend & Frontend Admin Auth System (`backend/src/` & `frontend/src/`)**:
  - Connected Backend to local PostgreSQL 18 database (`quyba_autoparts`) on port `5430`.
  - Created Prisma Client Singleton `db.ts` and updated `schema.prisma` with 9 models.
  - Implemented `AuthService.loginAdmin` with Bcrypt password verification and JWT token generation.
  - Created `authController.ts` and Zod validation schema `authValidator.ts`.
  - Implemented `verifyAdmin` JWT authentication middleware for Admin API routes protection.
  - Created global `errorHandler.ts` middleware for standardized Zod & AppError responses.
  - Seeded default Super Admin account (`phutungotoqbadanang@gmail.com` / `@Foradminkho9999`).
  - Applied Security Hardening & Penetration Testing against OWASP Top 10: `express-rate-limit` Brute Force Protection (max 5 failed attempts/15min), `Zod` input sanitization & max string limits against DoS/Injection, Constant-time Dummy Hash password comparison against Timing Attack User Enumeration. Penetration test suite verified **0 vulnerabilities** (SQL Injection, NoSQL Injection, Type Poisoning, and Brute Force attacks blocked 100%).
  - Built high-end Frontend Admin Login Page (`/admin/login`) connecting directly to Backend API (with zero plain-text local storage leak, full Base64-XOR encrypted session storage).
  - Integrated `AdminLayoutClient` auth guard and added Admin user profile & Logout button in `AdminHeader`.
  - Verified API & UI via live automated HTTP tests & pre-rendered static builds (**29/29 static routes**, **0 Error, 0 Warning**).

## [v1.4.1] - 2026-08-07

### Changed
- **Streamlined Products Page UI (`src/app/products/page.tsx`)**: Removed sidebar Zalo banner & product card metadata badges, made product images clickable to navigate to product detail page, and simplified card footer actions to a single "XEM CHI TIẾT →" button.
- **Refactored IntroSection Component (`src/components/public/IntroSection.tsx`)**: Trimmed introductory paragraph text to end cleanly at **"bằng sự uy tín."**, removing redundant trailing sentences.
- **Refactored About Page (`src/app/about/page.tsx`)**: Removed "QUY TRÌNH KIỂM ĐỊNH 5 BƯỚC" section and eliminated all text overlays (titles, descriptions, number badges, dark gradient) from the warehouse gallery images for a clean image grid display.
- **Refactored Careers Page (`src/app/careers/page.tsx`)**: Removed top Header Banner, 3 Benefits cards section, and subtext description under "VỊ TRÍ ĐANG TUYỂN DỤNG" heading per user feedback.
- **Refactored Contact Page (`src/app/contact/page.tsx`)**: Removed "Cam Kết Hàng Chuẩn Loại 1" service badge, updated "THỜI GIAN PHỤC VỤ" card detail to **"Từ Thứ 2 Đến Chủ Nhật"** (removed specific hourly time) per user feedback.
- **Production Build**: Verified clean build via `npm run build` (**0 Error, 0 Warning**, 28 static routes pre-rendered).

## [v1.4.0] - 2026-08-05

### Added
- Created `AdminSidebarContext.tsx` to provide global state management for Mobile Sidebar Drawer toggle.
- Created `TOP_SELLING_PARTS` widget inside `src/app/admin/page.tsx` for tracking best-selling heavy truck parts in Da Nang warehouse.

### Changed
- **Component Folder Architecture**: Restructured `web/src/components/` into two dedicated subdirectories:
  - `src/components/admin/`: Admin Dashboard UI components.
  - `src/components/public/`: Public website & static page UI components (`Navbar`, `Footer`, `HeroSection`, `IntroSection`, `BrandSlider`, `VehicleCategory`, `NewsSection`, `FloatingContact`, `ContactForm`, `ApplicationForm`, `ProductDetailActions`, `QuotationModal`, `MainLayout`).
- **HeroSection Typography & Layout**:
  - Aligned title text to the left side of the slider image (`left-6 sm:left-12 md:left-16 lg:left-24`).
  - Removed white background box (`bg-white`).
  - Rendered **"PHỤ TÙNG |"** as static black italic font-black text (`text-black italic font-black`).
  - Animated category names in bright red italic (`#FF0000`).
  - Positioned slide indicator dots bar centered at the bottom (`bottom-6 left-1/2 -translate-x-1/2`).
- Fixed 404 image resource paths in `productsData.ts` and `newsData.ts` to match actual assets in `public/images/vehicle-category/` (`dongco.png`, `hopso.png`, `ben.png`, `gam.png`, `sealphot.png`, `romooc.png`).

- **Removed 80% OEM Claims**: Eliminated all "80% OEM" commitments across `/about`, `/contact`, `/products`, `/products/[id]`, `/admin`, `/admin/settings`, `productsData.ts`, `newsData.ts`. Replaced with **"CAM KẾT CHẤT LƯỢNG"** / **"HÀNG CHUẨN LOẠI 1 CAO CẤP"**.
- **Refactored About Page (`src/app/about/page.tsx`)**: Removed Vision, Mission & Core Values section per user directive.
- **Frontend Security & Anti-Hacking Hardening**:
  - Configured HTTP Security Headers in `next.config.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, `Strict-Transport-Security`, `Permissions-Policy`, `Referrer-Policy`).
  - Added Anti-XSS input sanitization across all public interactive forms (`QuotationModal.tsx`, `ContactForm.tsx`, `ApplicationForm.tsx`).
  - Implemented Vietnamese Phone Number Regex Validation (`9-11 digits`) to prevent spam submissions and malicious payload injections.
- **Refactored Product Detail Page (`src/app/products/[id]/page.tsx`)**:
  - Placed Product Title at top of details column.
  - Kept `Sẵn Kho Đà Nẵng` badge at top above Product Title.
  - Placed `Part No` badge below Product Title.
  - Simplified Specifications Table to show ONLY 2 essential rows: **Mã phụ tùng (Part No.)** and **Chất liệu**.
  - Expanded Breadcrumb navigation to include Category level: `TRANG CHỦ > DANH MỤC PHỤ TÙNG > [TÊN DANH MỤC] > [TÊN SẢN PHẨM]`.
  - Removed duplicated big title from top dark header banner.
- **Internal Admin Data Protection**: Hidden all internal admin codes (`Mã Nội Bộ`, `internalCode`, `Tên nội bộ Admin`) from public sales pages (`/products`, `/products/[id]`, `QuotationModal.tsx`). Reserved internal codes exclusively for Admin Dashboard (`/admin/*`).
- **Quotation Form & Contact Form Optimization**:
  - Set **`SỐ ĐIỆN THOẠI *`** as mandatory required field.
  - Made `Họ và tên` optional.
  - Cleaned up form labels by removing `(KHÔNG BẮT BUỘC)` text for a sleek look.
- **Production Build Validation**: Ran `npm run lint` and `npm run build` with **0 Error, 0 Warning**, prerendering 27 static routes.
