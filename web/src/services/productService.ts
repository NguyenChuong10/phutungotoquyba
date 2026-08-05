import { productsData, categoriesList, brandsList } from "@/data/productsData";
import { Product, ProductCategory, ProductBrand } from "@/types/product";
import { ProductFilterParams } from "@/types/common";

export const productService = {
  getAllProducts(): Product[] {
    return productsData;
  },

  getProductById(id: string): Product | undefined {
    return productsData.find((p) => p.id === id);
  },

  getCategories(): ProductCategory[] {
    return categoriesList;
  },

  getBrands(): ProductBrand[] {
    return brandsList;
  },

  filterProducts(params: ProductFilterParams): Product[] {
    const { searchQuery, categorySlug, brand, inStockOnly } = params;
    return productsData.filter((p) => {
      if (categorySlug && categorySlug !== "all" && p.categorySlug !== categorySlug) {
        return false;
      }
      if (brand && brand !== "Tất cả thương hiệu" && p.brand !== brand) {
        return false;
      }
      if (inStockOnly && !p.inStock) {
        return false;
      }
      if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchPartNo = p.partNumber.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchCompat = p.compatibility.some((c) => c.toLowerCase().includes(q));
        return matchName || matchPartNo || matchBrand || matchCompat;
      }
      return true;
    });
  }
};
