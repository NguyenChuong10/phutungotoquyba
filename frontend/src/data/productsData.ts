import { Product } from "@/types/product";
export type { Product };

export interface SubCategoryData {
  slug: string;
  name: string;
}

export interface CategoryData {
  slug: string;
  name: string;
  icon?: string;
  subCategories?: SubCategoryData[];
}

export const categoriesList: CategoryData[] = [
  { slug: "all", name: "Tất cả danh mục" },
];

export const brandsList: string[] = [
  "Tất cả thương hiệu",
];

export const productsData: Product[] = [];

