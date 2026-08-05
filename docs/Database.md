# DATABASE & DATA MODELING - PHỤ TÙNG Ô TÔ Q.BA

## 🗄️ 1. CORE DATA SCHEMAS

### A. Product Entity (`Product`)
```typescript
interface Product {
  id: string;                // Mã định danh duy nhất (vd: 'p1')
  partNumber: string;        // Mã phụ tùng chính hãng (vd: 'VG1560080012')
  name: string;              // Tên phụ tùng (vd: 'Bộ lọc dầu Weichai WP12')
  categorySlug: string;      // Slug danh mục ('dong-co', 'hop-so', 'gam'...)
  brand: string;             // Thương hiệu ('Weichai', 'Sinotruk HOWO', 'Fast Gear'...)
  compatibility: string[];   // Các dòng xe hỗ trợ ['HOWO 371', 'Shacman X3000']
  imageSrc: string;          // Đường dẫn ảnh đại diện sản phẩm
  gallery?: string[];        // Bộ sưu tập ảnh chi tiết
  description: string;       // Mô tả công năng sản phẩm
  specifications: Record<string, string>; // Thông số kỹ thuật (Kích thước, Trọng lượng)
  qualityStandard: 'OEM' | 'Chính Hãng' | 'Loại 1';
  inStock: boolean;          // Trạng thái sẵn kho
  createdAt: string;
}
```

### B. Vehicle Category Entity (`Category`)
```typescript
interface Category {
  id: string;
  slug: string;              // Slug danh mục
  name: string;              // Tên hiển thị (vd: 'Động Cơ', 'Hộp Số')
  iconName: string;          // Tên icon đại diện Lucide
  imageSrc: string;          // Ảnh background đại diện
  description: string;       // Mô tả chi tiết danh mục
}
```
