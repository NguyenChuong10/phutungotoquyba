# SYSTEM ARCHITECTURE - PHỤ TÙNG Ô TÔ Q.BA

## 🏗️ 1. ARCHITECTURE OVERVIEW

Hệ thống được thiết kế theo mô hình **Clean Layered Architecture** trên nền tảng **Next.js 16 App Router** + **Tailwind CSS v4** + **TypeScript**.

```text
src/
├── app/                  # App Router (Pages, Layouts, API Routes)
│   ├── page.tsx          # Homepage
│   ├── about/            # Page About (/about)
│   ├── contact/          # Page Contact (/contact)
│   ├── products/         # Page E-Catalogue (/products)
│   └── layout.tsx        # Root Layout with Navbar & Footer
├── components/           # UI Components (Atomic Design Structure)
│   ├── Navbar.tsx        # Navigation Bar
│   ├── Footer.tsx        # Footer 12-col Grid
│   ├── HeroSection.tsx   # Fullsize Slide Hero
│   ├── IntroSection.tsx  # Brand Introduction 2-col
│   ├── VehicleCategory.tsx # Product Categories Slider & Modal
│   ├── BrandSlider.tsx   # Partner Brand Marquee
│   ├── NewsSection.tsx   # News & Technical Guides
│   └── FloatingContact.tsx # Zalo & Green Hotline Call Button
└── data/                 # Static Mock Datasets & Types
    └── productsData.ts   # Product Schema & Mock Data
```

---

## ⚡ 2. PERFORMANCE & RENDERING STRATEGY
- **Static Site Generation (SSG)**: Hầu hết các trang tĩnh (`/`, `/about`, `/contact`) được prerender tĩnh 100% khi build.
- **Image Optimization**: Sử dụng `next/image` với responsive `sizes`, `priority` cho hình ảnh quan trọng và Lazy loading cho gallery.
- **CSS Architecture**: Tailwind CSS v4 tối ưu hóa bundle size, không có CSS thừa.
