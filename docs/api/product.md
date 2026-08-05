# API SPECIFICATION: FEATURE PRODUCT

## 1. GET /api/v1/products
- **Mục đích:** Truy vấn danh sách phụ tùng xe tải có hỗ trợ bộ lọc và phân trang.
- **Permission:** Public (Công khai)
- **Query Parameters:**
  - `searchQuery` (string): Tìm theo tên, Part No, dòng xe.
  - `categorySlug` (string): Slug danh mục.
  - `brand` (string): Thương hiệu sản xuất.
  - `page` (number): Trang hiện tại (Default: 1).
  - `pageSize` (number): Số lượng / trang (Default: 12).

- **Response Payload (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "p1",
      "name": "Bộ Lọc Dầu Động Cơ Weichai WP12 / WP10",
      "partNumber": "VG1560080012",
      "categorySlug": "dong-co",
      "categoryName": "Động Cơ & Máy Phát",
      "brand": "Weichai Power",
      "compatibility": ["HOWO 371", "HOWO V7G", "Shacman X3000"],
      "imageSrc": "/images/vehicle-category/dongco.png",
      "specifications": {
        "Mã phụ tùng (Part No.)": "VG1560080012",
        "Chất liệu": "Giấy tổng hợp Micro-glass chịu nhiệt 150°C"
      },
      "qualityStandard": "Loại 1 Cao Cấp",
      "inStock": true
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 12
}
```

## 2. GET /api/v1/products/:id
- **Mục đích:** Lấy thông tin chi tiết 1 sản phẩm phụ tùng.
- **Permission:** Public (Ẩn `internalCode` đối với Public API).
