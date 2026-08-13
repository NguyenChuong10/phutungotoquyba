# 🚚 HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ & QUẢN LÝ PHỤ TÙNG Ô TÔ Q.BA ĐÀ NẴNG

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Ant Design](https://img.shields.io/badge/Ant%20Design-5.x-1890ff?logo=antdesign)](https://ant.design/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?logo=express)](https://expressjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

> **Công ty TNHH Cơ Khí Ô Tô Q.BA Đà Nẵng** — Tổng Kho Phụ Tùng Xe Tải Nặng, Xe Ben, Xe Đầu Kéo & Động Cơ Máy Công Trình Hàng Đầu Tại Đà Nẵng, Miền Trung & Tây Nguyên (SINOTRUK HOWO, WEICHAI, FAST GEAR, SHACMAN, CHENGLONG, FAW...).

---

## 📋 MỤC LỤC

1. [Tổng Quan Hệ Thống](#-1-tổng-quan-hệ-thống)
2. [Tính Năng Nổi Bật](#-2-tính-năng-nổi-bật)
3. [Kiến Trúc & Công Nghệ](#-3-kiến-trúc--công-nghệ)
4. [Cấu Trúc Thư Mục Dự Án](#-4-cấu-trúc-thư-mục-dự-án)
5. [Cấu Hình Biến Môi Trường (Environment Variables)](#-5-cấu-hình-biến-môi-trường)
6. [Hướng Dẫn Khởi Chạy Local (Local Development)](#-6-hướng-dẫn-khởi-chạy-local)
7. [Hướng Dẫn Đóng Gói Docker & Đẩy Lên Docker Hub](#-7-hướng-dẫn-đóng-gói-docker--đẩy-lên-docker-hub)
8. [Tài Liệu REST API Endpoints](#-8-tài-liệu-rest-api-endpoints)
9. [Thông Tin Thương Hiệu & Liên Hệ](#-9-thông-tin-thương-hiệu--liên-hệ)

---

## 🏛️ 1. TỔNG QUAN HỆ THỐNG

Hệ thống **Phụ Tùng Ô Tô Q.BA** được thiết kế và xây dựng theo chuẩn **Kiến Trúc Doanh Nghiệp (Enterprise Architecture)** nhằm giải quyết các bài toán:
- Tra cứu danh mục phụ tùng xe tải nặng, mã linh kiện (SKU/VIN) trực quan cho khách hàng và gara ô tô.
- Tiếp nhận yêu cầu báo giá phụ tùng tức thì qua hệ thống **Real-Time WebSocket Push Notifications**.
- Trang quản trị (Admin Dashboard) hiện đại sử dụng **Ant Design Enterprise Table** tích hợp mở rộng hàng (Expandable Rows), phân trang tự động, lọc & sắp xếp dữ liệu thông minh.
- Lưu trữ CSDL quan hệ chuẩn hóa **PostgreSQL + Prisma ORM** đáp ứng khả năng mở rộng hàng triệu phụ tùng.

---

## 🌟 2. TÍNH NĂNG NỔI BẬT

### 🛒 Dành Cho Khách Hàng (Public Portal):
- **Trang Chủ Hiện Đại & Tối Ưu SEO**: Tích hợp JSON-LD Structured Data (`AutoPartsStore`), Open Graph, sitemap động và thẻ Meta tối ưu theo chuẩn Google.
- **Thanh Cuộn Thương Hiệu Đối Tác (Brand Slider)**: Đọc dữ liệu Real-Time từ CSDL PostgreSQL (HOWO, Weichai, Fast Gear, Shacman, Chenglong...).
- **Danh Mục Chuyên Sâu**: Tra cứu xe tải ben, xe đầu kéo, hộp số Fast Gear, phụ tùng động cơ Weichai WP10, WP12.
- **Giỏ Hàng & Gửi Yêu Cầu Báo Giá Nhanh**: Khách hàng chọn nhiều phụ tùng và gửi báo giá qua Zalo/Điện thoại chỉ với 1 cú click.
- **Nút Liên Hệ Hỏa Tốc**: Nút Gọi Zalo & Điện Thoại cố định góc phải màn hình, hỗ trợ tư vấn 24/7.

### 🔐 Dành Cho Quản Trị Viên (Admin Management Portal `/admin`):
- **Bảng Dữ Liệu Ant Design Enterprise (`<Table />`)**:
  - Giao diện siêu mượt với chủ đề đỏ thương hiệu Q.BA (`#dc2626`).
  - Hỗ trợ mở rộng hàng (`Expandable Rows`) xem nhanh các phụ tùng thuộc đơn hàng/khách hàng.
  - Phân trang, lọc theo trạng thái đơn (*Pending, Confirmed, Completed, Cancelled*), tìm kiếm tên & SĐT.
- **Thông Báo Real-Time WebSocket**:
  - Tự động nhận diện đơn báo giá mới từ trình duyệt khách hàng không qua polling HTTP.
  - Phát âm thanh chuông báo + Toast Notification + nhấp nháy Badge số đơn chờ xử lý.
- **Quản Lý Thương Hiệu Đối Tác (`/admin/settings`)**:
  - Thêm, sửa, xóa logo đối tác trực tiếp lưu vào CSDL PostgreSQL.
  - Tải ảnh trực tiếp lên Server (Upload API) với xem trước ảnh tức thì.
- **Quản Lý Khách Hàng & Xếp Hạng Loyalty**:
  - Tự động gom nhóm đơn theo số điện thoại khách hàng.
  - Gán nhãn khách hàng tự động (*VIP, Khách Quen, Khách Mới*) và lưu lịch sử mua hàng.

---

## 🛠️ 3. KIẾN TRÚC & CÔNG NGHỆ

### Frontend Stack:
- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **UI Component Library:** Ant Design 5 (`antd`) + `@ant-design/nextjs-registry` (SSR Styling)
- **CSS Styling:** Tailwind CSS 3.4 + Glassmorphism + Responsive Breakpoints
- **Icons:** Lucide React Icons

### Backend Stack:
- **Runtime:** Node.js + TypeScript
- **Web Framework:** Express.js 4.x
- **Real-time Engine:** WebSocket (`ws`) server tích hợp tại `ws://localhost:5000/ws`
- **Database & ORM:** PostgreSQL 16 + Prisma ORM 6.x
- **Authentication:** JSON Web Token (JWT) + Bcrypt Password Hashing

### DevOps & Deployment:
- **Containerization:** Docker & Docker Compose
- **Web Server / Reverse Proxy:** NGINX / Docker Network

---

## 📁 4. CẤU TRÚC THƯ MỤC DỰ ÁN

```text
PhuTungOtoQuyBa/
├── frontend/                                   # FRONTEND NEXT.JS APP
│   ├── public/                                 # Banner, Logos, Static Images
│   │   ├── images/                             # Product & Pioneer Section Images
│   │   └── uploads/                            # User Uploaded Brand Logos & Images
│   └── src/
│       ├── app/                                # Next.js App Router Routes
│       │   ├── (public)/                       # Home, Products, Quotation, News, Contact
│       │   ├── admin/                          # Admin Dashboard, Orders, Settings, Products
│       │   ├── layout.tsx                      # Root Layout with AntdRegistry
│       │   └── globals.css                     # Design System & Tailwind Directives
│       ├── components/
│       │   ├── admin/                          # Admin Header, Sidebar & Modals
│       │   ├── public/                         # Navbar, Footer, BrandSlider, Category Grid
│       │   └── ui/                             # Toast Notification & Custom Badges
│       ├── config/                             # API & WebSocket Configs (`api.ts`)
│       ├── context/                            # Admin Real-Time Notification Context
│       ├── services/                           # Admin & Public API Client Services
│       └── utils/                              # Secure Storage Helpers
│
├── backend/                                    # BACKEND EXPRESS API SERVER
│   ├── prisma/
│   │   ├── schema.prisma                       # Database Schema (PartnerBrand, Order, Product...)
│   │   └── seed.ts                             # Database Initial Seeder
│   ├── uploads/                                # Upload Directory for Images
│   └── src/
│       ├── config/                             # Express & CORS Configuration
│       ├── controllers/                        # REST Controller Handlers
│       ├── middlewares/                        # JWT Auth & Error Handler Middlewares
│       ├── routes/                             # Express API Routes
│       ├── services/                           # Business Logic & Database Services
│       │   ├── websocketService.ts             # Real-time WebSocket Broadcaster
│       │   └── partnerBrandService.ts          # PostgreSQL Partner Brand CRUD
│       └── index.ts                            # Express Server & WS Listener Entrypoint
│
└── docker-compose.yml                          # Production Docker Orchestration
```

---

## ⚙️ 5. CẤU HÌNH BIẾN MÔI TRƯỜNG (ENVIRONMENT TEMPLATES)

> ⚠️ **LƯU Ý BẢO MẬT:** Không commit trực tiếp thông tin bảo mật hay mật khẩu CSDL lên Git. Hãy tạo các file `.env.local` (phía Frontend) và `.env` (phía Backend) từ các file mẫu bên dưới:

### 1. Mẫu Cấu Hình Frontend (`frontend/.env.example`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:5000/ws
INTERNAL_API_URL=http://host.docker.internal:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Mẫu Cấu Hình Backend (`backend/.env.example`):
```env
PORT=5000
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/phutungquyba?schema=public"
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"
CORS_ORIGIN="http://localhost:3000"
```

---

## 🚀 6. HƯỚNG DẪN KHỞI CHẠY LOCAL

### Bước 1: Khởi chạy CSDL PostgreSQL & Chạy Prisma Migration
```bash
cd backend

# Cài đặt thư viện backend
npm install

# Đẩy schema Prisma vào PostgreSQL database
npx prisma db push

# Chạy seed dữ liệu ban đầu
npx prisma db seed

# Khởi chạy Backend Dev Server (Port 5000)
npm run dev
```

### Bước 2: Khởi chạy Frontend App
```bash
cd frontend

# Cài đặt thư viện frontend
npm install

# Khởi chạy Frontend Next.js Dev Server (Port 3000)
npm run dev
```

Sau khi chạy xong:
- **Trang chủ Khách hàng:** `http://localhost:3000`
- **Trang Quản trị Admin:** `http://localhost:3000/admin`
- **Backend API Base:** `http://localhost:5000/api/v1`

---

## 🐳 7. HƯỚNG DẪN ĐÓNG GÓI DOCKER & ĐẨY LÊN DOCKER HUB

### 1. Khởi chạy bằng Docker Compose tại máy local:
```bash
docker-compose up -d --build
```

### 2. Đóng gói & Đẩy Image lên Docker Hub:
```bash
# Login vào Docker Hub
docker login

# Build & Tag Backend Image
docker build -t nguyenchuong10/phutungquyba-backend:latest ./backend
docker push nguyenchuong10/phutungquyba-backend:latest

# Build & Tag Frontend Image
docker build -t nguyenchuong10/phutungquyba-frontend:latest ./frontend
docker push nguyenchuong10/phutungquyba-frontend:latest
```

---

## 📡 8. TÀI LIỆU REST API ENDPOINTS

### 🏢 Partner Brands API (`/api/v1/partner-brands`):
| Method | Endpoint | Quyền | Mô Tả |
|---|---|---|---|
| `GET` | `/api/v1/partner-brands` | Public | Lấy danh sách thương hiệu đối tác |
| `POST` | `/api/v1/partner-brands/admin` | Admin JWT | Thêm thương hiệu đối tác mới |
| `PUT` | `/api/v1/partner-brands/admin/:id` | Admin JWT | Cập nhật tên/logo thương hiệu |
| `DELETE` | `/api/v1/partner-brands/admin/:id` | Admin JWT | Xóa vĩnh viễn thương hiệu khỏi CSDL |

### 📦 Orders & Quotation API (`/api/v1/orders`):
| Method | Endpoint | Quyền | Mô Tả |
|---|---|---|---|
| `POST` | `/api/v1/orders/quotation` | Public | Gửi yêu cầu báo giá phụ tùng |
| `GET` | `/api/v1/orders/admin` | Admin JWT | Lấy tất cả đơn báo giá (có phân trang) |
| `PUT` | `/api/v1/orders/admin/:id/status` | Admin JWT | Cập nhật trạng thái đơn báo giá |
| `DELETE` | `/api/v1/orders/admin/:id` | Admin JWT | Xóa đơn báo giá theo ID |
| `DELETE` | `/api/v1/orders/admin/customer/:phone` | Admin JWT | Xóa tất cả đơn thuộc về SĐT khách |

---

## 📞 9. THÔNG TIN THƯƠNG HIỆU & LIÊN HỆ

- **Tên công ty:** Công ty TNHH Cơ Khí Ô Tô Q.BA Đà Nẵng
- **Tên thương hiệu:** Phụ Tùng Ô Tô Q.BA (Quy Ba Auto Parts)
- **Tổng kho Đà Nẵng:** 351 Điện Biên Phủ, Phường Hòa Khê, Quận Thanh Khê, TP. Đà Nẵng
- **Hotline Zalo Báo Giá 24/7:** `0903.588.167`
- **Website chính thức:** [https://phutungotoquyba.com](https://phutungotoquyba.com)

---
*© 2026 Phụ Tùng Ô Tô Q.BA Đà Nẵng. Bản quyền đã được bảo hộ.*
