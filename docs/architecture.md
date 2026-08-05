# SYSTEM ARCHITECTURE - PHỤ TÙNG Ô TÔ Q.BA

## 🏗️ 1. ARCHITECTURE OVERVIEW

Hệ thống được thiết kế theo mô hình **Enterprise Clean Layered Architecture** với sự phân định rõ ràng giữa Root Workspace, Frontend Platform (`web/`), và Backend Platform (`server/`).

```text
PhuTungOtoQuyBa/                          # ROOT WORKSPACE
├── .agents/                              # AIOS Rule Engine & Workflows (10 Virtual Roles)
├── .mcp.json                             # Model Context Protocol Configuration
├── README.md                             # Enterprise Architecture Master Guide
├── docs/                                 # Business & Technical Architecture Specs
├── memory/                               # AIOS Memory-First Repository Brain
├── tasks/                                # Agile Sprint Planning
├── web/                                  # FRONTEND PLATFORM (Next.js 15 App Router)
│   └── src/
│       ├── app/                          # App Router (Pages, Layouts, SSG Routes)
│       ├── components/                   # UI Components (admin/ & public/)
│       ├── config/                       # Brand Metadata & Navigation Items
│       ├── data/                         # Static Datasets & Seeds
│       ├── hooks/                        # Custom React State Hooks
│       ├── lib/                          # Formatters, Validators & Utilities
│       ├── services/                     # Business Logic Services & Data Access
│       └── types/                        # Enterprise TypeScript Definitions
└── server/                               # BACKEND PLATFORM (Node.js/Express + Prisma ORM)
    └── src/
        ├── controllers/                  # RESTful API Controllers
        ├── services/                     # Business Logic Services
        ├── repositories/                 # Database Query Layer
        └── routes/                       # Express Endpoints
```

---

## ⚡ 2. PERFORMANCE & RENDERING STRATEGY
- **Static Site Generation (SSG)**: Hầu hết các trang tĩnh (`/`, `/about`, `/contact`) được prerender tĩnh 100% khi build.
- **Image Optimization**: Sử dụng `next/image` với responsive `sizes`, `priority` cho hình ảnh quan trọng và Lazy loading cho gallery.
- **CSS Architecture**: Tailwind CSS v4 tối ưu hóa bundle size, không có CSS thừa.
