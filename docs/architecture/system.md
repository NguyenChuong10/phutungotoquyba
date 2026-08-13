# TÀI LIỆU KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE SPECIFICATION)
> **Dự án:** Phụ Tùng Ô Tô Q.BA (Quy Ba Auto Parts Platform)  
> **Phiên bản:** v1.0.0 | **Ngày lập:** 07/08/2026  
> **Kiến trúc:** 3-Tier Enterprise Clean Architecture + Project Brain Engine (MCP Protocol)

---

## 🏛️ 1. TỔNG QUAN KIẾN TRÚC HỆ THỐNG (OVERVIEW)

Hệ thống Phụ Tùng Ô Tô Q.BA được thiết kế theo mô hình **3-Tier Enterprise Architecture** phân tách độc lập 100% giữa Frontend Bán hàng/Quản trị, Backend API Server và Cơ sở dữ liệu PostgreSQL.

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  +-----------------------------------+   +-------------------------------------+  |
|  |   PUBLIC WEBSITE (Bán Hàng)       |   |   ADMIN DASHBOARD (Quản Trị Kho)    |  |
|  |   Next.js 15 App Router (SSG)     |   |   Next.js 15 App Router (Dashboard) |  |
|  +-----------------------------------+   +-------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                   HTTP / RESTful APIs
                                           |
+------------------------------------------v----------------------------------------+
|                                 BACKEND LAYER                                     |
|  +-----------------------------------------------------------------------------+  |
|  |                       NODE.JS / EXPRESS API SERVER                          |  |
|  |  +------------------+  +-------------------+  +--------------------------+  |  |
|  |  |  Security & Auth |  |  Zod Validator    |  |  Global Error Handler    |  |  |
|  |  |  (Helmet/Cors/JWT|  |  Middleware       |  |  Middleware              |  |  |
|  |  +--------+---------+  +---------+---------+  +------------+-------------+  |  |
|  |           |                      |                         |                |  |
|  |  +--------v----------------------v-------------------------v-------------+  |  |
|  |  |                      CONTROLLER LAYER                                 |  |  |
|  |  +-------------------------------+---------------------------------------+  |  |
|  |                                  |                                          |  |
|  |  +-------------------------------v---------------------------------------+  |  |
|  |  |                      SERVICE LAYER (Nghiệp vụ Q.BA)                   |  |  |
|  |  +-------------------------------+---------------------------------------+  |  |
|  |                                  |                                          |  |
|  |  +-------------------------------v---------------------------------------+  |  |
|  |  |                      PRISMA ORM / REPOSITORY                          |  |  |
|  |  +-------------------------------+---------------------------------------+  |  |
|  +----------------------------------+------------------------------------------+  |
+-------------------------------------+---------------------------------------------+
                                      |
                                Prisma Engine SQL
                                      |
+-------------------------------------v---------------------------------------------+
|                                DATABASE LAYER                                     |
|  +-----------------------------------------------------------------------------+  |
|  |                  POSTGRESQL 15 DATABASE (9 Core Tables)                     |  |
|  |  users | categories | brands | products | product_images | orders           |  |
|  |  order_items | news | customers                                             |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## ⚙️ 2. CHI TIẾT CÁC TẦNG KIẾN TRÚC (LAYER DETAILS)

### 2.1. Tầng Giao Diện Người Dùng (Client Layer - `frontend/`)
* **Công nghệ:** Next.js 15 (App Router, TypeScript, Tailwind CSS v4).
* **Phân khu Component:**
  * `src/components/public/`: Các Component bán hàng công khai (`Navbar`, `Footer`, `IntroSection`, `VehicleCategory`, `QuotationModal`, `ContactForm`, `ApplicationForm`).
  * `src/components/admin/`: Các Component quản trị (`AdminSidebar`, `AdminHeader`, `MetricCard`, `OrderTable`, `TopSellingParts`).
* **Quản lý State:** React Context API (`QuotationContext`, `AdminSidebarContext`).
* **Chiến lược Render:** **28 Static Routes SSG (Static Site Generation)** được prerender sẵn cho tốc độ tải trang hỏa tốc dưới 0.5s.

### 2.2. Tầng Máy Chủ API (Backend Layer - `backend/`)
Tuân thủ nghiêm ngặt mô hình **Clean Layered Architecture 4 Lớp**:

1. **Routing & Middleware Layer (`src/routes/` & `src/middlewares/`)**:
   - `helmet` & `cors`: Cấu hình bảo mật Header & giới hạn Domain truy cập.
   - `authMiddleware.ts`: Kiểm tra và giải mã JWT token cho các Router Admin.
   - `validateMiddleware.ts`: Validate dữ liệu đầu vào bằng Zod schema trước khi tới Controller.
   - `errorHandler.ts`: Bắt toàn bộ ngoại lệ bất đồng bộ và trả về định dạng response lỗi chuẩn:
     ```json
     {
       "success": false,
       "error": {
         "code": "PRODUCT_NOT_FOUND",
         "message": "Không tìm thấy mã phụ tùng yêu cầu"
       }
     }
     ```

2. **Controller Layer (`src/controllers/`)**:
   - Chỉ chịu trách nhiệm tiếp nhận HTTP Request (`req.params`, `req.query`, `req.body`), gọi Service tương ứng và trả về HTTP Response (Status 200, 201, 400, 401, 404, 500).

3. **Service Layer (`src/services/`)**:
   - Chứa 100% Logic Nghiệp vụ của Phụ Tùng Ô Tô Q.BA (Tính toán giá trị đơn báo giá, định dạng mã đơn `QB-ORD-...`, xử lý lọc phụ tùng theo Part No nhà máy, kiểm tra tồn kho).

4. **Prisma ORM Layer (`backend/prisma/schema.prisma`)**:
   - Ánh xạ 1:1 với PostgreSQL Database. Quản lý kết nối Singleton qua `db.ts` tránh tràn Connection Pool.

---

## 🛡️ 3. NGUYÊN TẮC BẢO MẬT DỮ LIỆU NỘI BỘ (DATA SEGREGATION POLICY)

Để bảo vệ bí mật kinh doanh thương mại phụ tùng của Q.BA, kiến trúc hệ thống áp dụng chính sách **Phân Tách Dữ Liệu 2 Chiều Bắt Buộc**:

```text
                               +-------------------+
                               |  DATA IN DATABASE |
                               +---------+---------+
                                         |
                     +-------------------+-------------------+
                     |                                       |
          [PUBLIC RESTFUL APIS]                    [ADMIN PROTECTED APIS]
                     |                                       |
    +----------------v-----------------+   +-----------------v------------------+
    | HIỂN THỊ CÔNG KHAI (Public UI)   |   | CHỈ HIỂN THỊ ADMIN (Admin UI)     |
    | - Part Number (Mã nhà máy)       |   | - Mã Nội Bộ (internal_code)        |
    | - Tên thương mại sản phẩm        |   | - Tên Quản Lý Nội Bộ (internal_name)|
    | - Giá bán công khai             |   | - Giá vốn nhập kho (cost_price)     |
    | - Tiêu chuẩn chất lượng          |   | - Số lượng tồn kho chi tiết        |
    | - Sẵn kho Đà Nẵng (true/false)   |   | - Thông tin Khách hàng chi tiết    |
    +----------------------------------+   +------------------------------------+
```

---

## 🗄️ 4. SƠ ĐỒ THỰC THỂ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA MAPPING)

Cơ sở dữ liệu PostgreSQL gồm 9 bảng được thiết kế ánh xạ 100% với UI/UX:

1. **`users`**: Quản lý tài khoản Nhân viên Admin & Khách hàng.
2. **`categories`**: Danh mục phụ tùng (Động cơ, Hộp số, Gầm...) & Chủng loại xe.
3. **`brands`**: Thương hiệu nhà sản xuất (HOWO, Weichai, Fast Gear, Shacman, Yuchai...).
4. **`products`**: Thông tin phụ tùng ô tô (Mã Part No., Mã nội bộ Admin, Tên nội bộ, Specs JSONB, Compatibility JSONB).
5. **`product_images`**: Bộ sưu tập ảnh sản phẩm.
6. **`orders`**: Yêu cầu báo giá & Đơn đặt hàng.
7. **`order_items`**: Chi tiết danh sách phụ tùng trong đơn báo giá.
8. **`news`**: Cẩm nang kỹ thuật & Tin tức thị trường xe tải.
9. **`customers`**: Danh bạ thống kê thông tin khách hàng thân thiết.

---

## 🚀 5. KIẾN TRÚC TRIỂN KHAI (DEPLOYMENT ARCHITECTURE)

* **Frontend Build**: Prerender Static Pages (`npm run build`) đưa lên Vercel / Static Hosting với CDN Cache toàn cầu.
* **Backend API**: Node.js Express Server chạy trên Docker Container hoặc VPS Linux Port `5000` kết nối PostgreSQL Managed Service.
* **Đồng bộ Project Brain**: Mỗi lần commit Git, script `scripts/brain-sync.js` sẽ đọc diff và đồng bộ ma trận tri thức `memory-graph.json` với giao thức MCP Protocol.

---

## ⚡ 6. TIÊU CHUẨN LAZY LOADING & TỐI ƯU HIỆU NĂNG CHO DỮ LIỆU LỚN (BIG DATA LAZY LOADING STANDARDS)

Để đáp ứng việc mở rộng kho phụ tùng Q.BA lên hàng trăm ngàn sản phẩm trong tương lai, hệ thống bắt buộc áp dụng **Chính Sách Lazy Loading 3 Cấp**:

### 6.1. Lazy Loading Tầng Frontend (Client Dynamic Load):
1. **Dynamic Import Modals (`next/dynamic`)**:
   - Tất cả các Popup Modal nặng (`SubCategoryProductsModal`, `AddProductModal`, `AddCategoryModal`, `SEOUploaderModal`) bắt buộc sử dụng `next/dynamic` với `ssr: false` và Skeleton Loader.
   - Trang web chỉ tải nhẹ vỏ ứng dụng (~30KB), Modals chỉ được tải nạp từ server khi admin thực hiện cú nhấp chuột.
2. **Next.js Image Lazy Loading (`<Image loading="lazy" ... />`)**:
   - 100% hình ảnh sản phẩm, logo nhà máy và banner bắt buộc bật `loading="lazy"` để chỉ tải ảnh khi cuộn tới góc nhìn màn hình.
3. **Phân Trang 3 Cấp (3-Level Pagination)**:
   - Phân trang độc lập ở 3 cấp: Cấp 1 Danh mục chính (5/trang), Cấp 2 Danh mục phụ con (5/trang), Cấp 3 Popup Sản phẩm (4/trang) để tránh quá tải DOM.

### 6.2. Lazy Loading Tầng Backend API (Selective & Cursor Queries):
1. **Truy vấn Chọn lọc Field (`select` thay vì `include`)**:
   - Khi lấy danh sách danh mục hoặc sản phẩm tổng quan, Backend chỉ `select` các trường cơ bản (`id`, `partNumber`, `name`, `price`, `stockQuantity`, `thumbnail`).
   - Các trường nặng như `description` dài hay mảng quan hệ chỉ được Lazy-Load khi truy vấn chi tiết 1 sản phẩm (`GET /api/v1/products/:id`).
2. **Deferred Relation Load (Tách biệt relation)**:
   - Endpoint `GET /api/v1/categories` chỉ trả về Metadata và `_count` sản phẩm, KHÔNG lồng toàn bộ mảng sản phẩm.
   - Danh sách sản phẩm của từng danh mục phụ con được Lazy-Fetch khi client nhấp nút "Xem SP" (`GET /api/v1/admin/products?subCategoryId=...&page=1&limit=10`).
3. **Chỉ Mục Database Indexing**:
   - Đánh chỉ mục B-Tree trên các cột tìm kiếm tần suất cao: `part_number`, `internal_code`, `category_id`, `brand_id`, `created_at`.
