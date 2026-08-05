import { useState, useMemo } from "react";
import { Product } from "@/types/product";
import { productService } from "@/services/productService";

export function useProductFilter(initialCategory = "all", initialBrand = "Tất cả thương hiệu") {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);

  const filteredProducts: Product[] = useMemo(() => {
    return productService.filterProducts({
      searchQuery,
      categorySlug: selectedCategory,
      brand: selectedBrand
    });
  }, [searchQuery, selectedCategory, selectedBrand]);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
    filteredProducts
  };
}
