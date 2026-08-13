import { API_BASE_URL, fetchApi } from "@/config/api";
import { secureStorage } from "@/utils/secureStorage";

export interface CategoryTreeItem {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  description?: string;
  children?: CategoryTreeItem[];
  _count?: {
    products: number;
    children?: number;
  };
}

export interface AdminProductItem {
  id: number;
  name: string;
  slug: string;
  partNumber: string;
  internalCode: string;
  internalName: string;
  categoryId: number;
  brandId: number;
  price: number | string;
  costPrice: number | string;
  stockQuantity: number;
  inStock: boolean;
  qualityStandard: string;
  description?: string;
  specifications?: Record<string, string>;
  compatibility?: string[];
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string; slug: string };
  images?: { id: number; imageUrl: string; isPrimary: boolean }[];
}

export class AdminApiService {
  /**
   * Fetch 2-Level Category Tree
   */
  static async getCategoriesTree(): Promise<CategoryTreeItem[]> {
    const res = await fetchApi("/categories");
    if (res.ok && res.data) {
      return res.data;
    }
    return [];
  }

  /**
   * Create New Category (Main or Sub-Category)
   */
  static async createCategory(data: {
    name: string;
    parentId?: number | null;
    description?: string;
  }) {
    return await fetchApi("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update Category
   */
  static async updateCategory(
    id: number,
    data: { name?: string; parentId?: number | null; description?: string }
  ) {
    return await fetchApi(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete Category
   */
  static async deleteCategory(id: number) {
    return await fetchApi(`/admin/categories/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Fetch Brands List
   */
  static async getBrands() {
    return await fetchApi("/brands");
  }

  /**
   * Create Brand
   */
  static async createBrand(data: { name: string; logoUrl?: string }) {
    return await fetchApi("/admin/brands", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update Brand
   */
  static async updateBrand(id: number, data: { name?: string; logoUrl?: string }) {
    return await fetchApi(`/admin/brands/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete Brand
   */
  static async deleteBrand(id: number) {
    return await fetchApi(`/admin/brands/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Fetch Admin Products List
   */
  static async getAdminProducts(params?: {
    categoryId?: number;
    brandId?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append("categoryId", String(params.categoryId));
    if (params?.brandId) query.append("brandId", String(params.brandId));
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const endpoint = `/admin/products?${query.toString()}`;
    return await fetchApi(endpoint);
  }

  /**
   * Fetch Public Products List (Server-side Pagination & Filtering for 50,000+ Scale)
   */
  static async getPublicProducts(params?: {
    search?: string;
    categorySlug?: string;
    subCategorySlug?: string;
    brandName?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.categorySlug && params.categorySlug !== "all") query.append("categorySlug", params.categorySlug);
    if (params?.subCategorySlug) query.append("subCategorySlug", params.subCategorySlug);
    if (params?.brandName && params.brandName !== "Tất cả thương hiệu") query.append("brandName", params.brandName);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const endpoint = `/products?${query.toString()}`;
    return await fetchApi(endpoint);
  }

  /**
   * Create Product
   */
  static async createProduct(productData: Record<string, unknown>) {
    return await fetchApi("/admin/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  /**
   * Update Product
   */
  static async updateProduct(id: number, productData: Record<string, unknown>) {
    return await fetchApi(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  /**
   * Delete Product
   */
  static async deleteProduct(id: number) {
    return await fetchApi(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Adjust Product Stock & Price Inventory
   */
  static async adjustProductStockAndPrice(
    id: number,
    data: { stockQuantity: number; price: number; costPrice: number; adjustmentNote?: string }
  ) {
    return await fetchApi(`/admin/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * Upload Image File to Express Server
   */
  static async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);

    const token = typeof window !== "undefined" ? secureStorage.getItem("quyba_admin_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  }

  /**
   * Upload Multiple Product Images
   */
  static async uploadMultipleProductImages(files: FileList | File[]) {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    const token = typeof window !== "undefined" ? secureStorage.getItem("quyba_admin_token") : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/admin/upload/multiple`, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await res.json();
    return { ok: res.ok, status: res.status, ...data };
  }

  /**
   * Fetch Customer Order History by Phone Number
   */
  static async getCustomerHistory(phone: string) {
    return await fetchApi(`/orders/admin/customer-history/${encodeURIComponent(phone)}`);
  }

  /**
   * Admin Create Order
   */
  static async createOrder(data: Record<string, unknown>) {
    return await fetchApi("/orders/admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin Update Order Details
   */
  static async updateOrderDetails(id: number, data: Record<string, unknown>) {
    return await fetchApi(`/orders/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Admin Delete Single Order
   */
  static async deleteOrder(id: number) {
    return await fetchApi(`/orders/admin/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Admin Delete Customer Group (All orders of a phone number)
   */
  static async deleteCustomerGroup(phone: string) {
    return await fetchApi(`/orders/admin/customer/${encodeURIComponent(phone)}`, {
      method: "DELETE",
    });
  }

  /**
   * Fetch Real-Time Dashboard Analytics Data
   */
  static async getDashboardAnalytics() {
    return await fetchApi("/orders/admin/analytics");
  }

  /**
   * Fetch All Admin Customers List with VIP Tiers
   */
  static async getAdminCustomers(search?: string) {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return await fetchApi(`/customers/admin${query}`);
  }

  /**
   * Update Gara / Customer Consultation Notes
   */
  static async updateCustomerNotes(phone: string, notes: string) {
    return await fetchApi(`/customers/admin/${encodeURIComponent(phone)}/notes`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  }

  /**
   * Fetch News & Technical Articles List
   */
  static async getNewsList(params?: { categorySlug?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.categorySlug) query.append("categorySlug", params.categorySlug);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    return await fetchApi(`/news?${query.toString()}`);
  }

  /**
   * Create News Article
   */
  static async createNews(data: Record<string, unknown>) {
    return await fetchApi("/news/admin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update News Article
   */
  static async updateNews(id: number, data: Record<string, unknown>) {
    return await fetchApi(`/news/admin/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete News Article
   */
  static async deleteNews(id: number) {
    return await fetchApi(`/news/admin/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Fetch All News Categories
   */
  static async getNewsCategories() {
    return await fetchApi("/news/categories");
  }

  /**
   * Create News Category
   */
  static async createNewsCategory(name: string) {
    return await fetchApi("/news/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Update News Category
   */
  static async updateNewsCategory(id: number, name: string) {
    return await fetchApi(`/news/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Delete News Category
   */
  static async deleteNewsCategory(id: number) {
    return await fetchApi(`/news/admin/categories/${id}`, {
      method: "DELETE",
    });
  }

  /**
   * Get System Settings
   */
  static async getSettings() {
    return await fetchApi("/settings");
  }

  /**
   * Update System Settings
   */
  static async updateSettings(settings: Record<string, string>) {
    return await fetchApi("/settings/admin", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }
}
