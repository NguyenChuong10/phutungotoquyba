# RESTFUL API CONTRACTS SPECIFICATION

## 🌐 API ENDPOINTS SPECIFICATION

### 1. Products API
- `GET /api/products`: Lấy danh sách sản phẩm phụ tùng (hỗ trợ Query Params: `category`, `brand`, `search`, `page`).
- `GET /api/products/:id`: Lấy thông tin chi tiết 1 mã phụ tùng theo ID hoặc Part Number.

### 2. Quotation API
- `POST /api/quotation/send-zalo`: Tạo yêu cầu báo giá danh sách phụ tùng đã chọn và chuyển hướng mở Zalo OA Q.BA (`0903.588.167`).

### 3. Response Format Standard
```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  },
  "error": null
}
```
