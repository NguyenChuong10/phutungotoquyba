# 🚚 DỰ ÁN PHỤ TÙNG Ô TÔ Q.BA (QUY BA AUTO PARTS)
> **Hệ Thống Phân Phối Phụ Tùng Xe Tải Nặng, Xe Đầu Kéo & Động Cơ Máy Công Trình Hàng Đầu Tại Đà Nẵng, Miền Trung, Tây Nguyên & Toàn Quốc.**

---

## 🏛️ 1. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT STRUCTURE)

Dự án **Phụ Tùng Ô Tô Q.BA** là nền tảng thương mại điện tử chuyên nghiệp và hệ thống quản trị danh mục phụ tùng xe tải nặng, xe đầu kéo, xe ben và máy công trình (Sinotruk Howo, Shacman, Dongfeng, Faw, Hyundai, Isuzu, Weichai, Yuchai...).

Hệ thống được phát triển theo **Mô hình Kiến trúc Doanh nghiệp (Enterprise Clean Layered Architecture)** với Next.js 15 App Router Frontend và Express + Prisma ORM + PostgreSQL Backend.

```text
PhuTungOtoQuyBa/
├── frontend/                             # FRONTEND PLATFORM (Next.js 15 App Router + Tailwind)
│   ├── package.json                      # Dependencies & NPM Scripts
│   ├── public/                           # Static Assets (Images, Logos, Icons)
│   └── src/                              # Clean Layered Frontend Source Code
│       ├── app/                          # App Router Pages & SSG Routes
│       ├── components/                   # UI Component Library (admin/ & public/)
│       ├── config/                       # Enterprise Site Metadata & Navigation Menus
│       ├── services/                     # Business Logic Services & API Clients
│       └── types/                        # Enterprise TypeScript Type Specifications
│
└── backend/                              # BACKEND PLATFORM (Node.js/Express + Prisma ORM + PostgreSQL)
    ├── package.json                      # Backend Dependencies & NPM Scripts
    ├── prisma/                           # Database Schema & Migrations
    └── src/                              # Clean Controller-Service-Repository Backend Code
        ├── config/                       # DB & Environment Configurations
        ├── controllers/                  # RESTful API Controllers
        ├── middlewares/                  # Auth JWT & Validation Middlewares
        ├── routes/                       # Express Router Handlers
        └── services/                     # Backend Business Logic Services
```

---

## 🛠️ 2. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

- **Frontend Core:** Next.js 15 (App Router), React 19, TypeScript 5.
- **Styling:** Tailwind CSS, Lucide Icons, Glassmorphism, Responsive Breakpoints.
- **Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL (Port 5430).

---

## 🚀 3. HƯỚNG DẪN KHỞI CHẠY (QUICK START)

### 1. Khởi chạy Frontend Platform:
```bash
cd frontend
npm install
npm run dev
npm run build
```

### 2. Khởi chạy Backend Platform:
```bash
cd backend
npm install
npm run dev
npx tsc --noEmit
```

---

## 📞 4. THÔNG TIN THƯƠNG HIỆU PHỤ TÙNG Ô TÔ Q.BA
- **Thương hiệu:** Phụ Tùng Ô Tô Q.BA (Quy Ba Auto Parts)
- **Tổng kho:** 351 Điện Biên Phủ, Phường Hòa Khê, Quận Thanh Khê, TP. Đà Nẵng
- **Hotline Zalo Báo Giá 24/7:** 0903.588.167

