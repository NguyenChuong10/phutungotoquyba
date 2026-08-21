export interface Product {
  id: string;
  name: string;             // Tên sản phẩm hiển thị công khai
  internalName?: string;    // Tên sản phẩm nội bộ (Admin xem - Tuỳ chọn)
  internalCode?: string;    // Mã nội bộ Q.BA (Admin xem - Tuỳ chọn)
  partNumber: string;       // Mã phụ tùng nhà máy (Part No.)
  categorySlug: string;     // Slug danh mục chính
  categoryName: string;     // Tên hiển thị danh mục chính
  subCategorySlug?: string; // Slug danh mục phụ con
  brand: string;            // Thương hiệu sản xuất
  compatibility: string[];  // Các dòng xe tương thích
  imageSrc: string;         // Ảnh đại diện sản phẩm
  gallery: string[];        // Bộ sưu tập ảnh
  description: string;      // Mô tả chi tiết sản phẩm
  specifications: Record<string, string>; // Thông số kỹ thuật
  qualityStandard: string;  // Tiêu chuẩn chất lượng (vd: "Chính Hãng", "Loại 1 Cao Cấp")
  price?: string;           // Giá sản phẩm hoặc "Liên hệ Báo Giá"
  inStock: boolean;         // Trạng thái sẵn kho
}

export interface ProductCategory {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
}

export type ProductBrand = string;
