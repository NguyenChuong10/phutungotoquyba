export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ProductFilterParams {
  searchQuery?: string;
  categorySlug?: string;
  brand?: string;
  inStockOnly?: boolean;
}
