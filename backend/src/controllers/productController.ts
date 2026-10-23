import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/productService";
import { AppError } from "../utils/AppError";
import { OdooIntegrationService } from "../services/odooIntegrationService";
import { createProductSchema, updateProductSchema, stockAdjustmentSchema } from "../validators/productValidator";

export class ProductController {
  /**
   * GET /api/v1/products - Public Product Query (Privacy Masking Enforcement)
   */
  static async getPublicProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const categorySlug = req.query.categorySlug as string | undefined;
      const subCategorySlug = req.query.subCategorySlug as string | undefined;
      const brandName = req.query.brandName as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 12;

      const result = await ProductService.getPublicProducts({
        search,
        categorySlug,
        subCategorySlug,
        brandName,
        page,
        limit,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/products/:identifier - Public Get Single Product Detail
   */
  static async getPublicProductByIdOrSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.params.identifier;
      const product = await ProductService.getPublicProductByIdOrSlug(identifier);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/admin/products - Admin Full Product Inventory Catalog
   */
  static async getAdminProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
      const brandId = req.query.brandId ? Number(req.query.brandId) : undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder === "asc" ? "asc" : req.query.sortOrder === "desc" ? "desc" : undefined;
      let isOdooLinked: boolean | undefined = undefined;
      if (req.query.isOdooLinked === "true") {
        isOdooLinked = true;
      } else if (req.query.isOdooLinked === "false") {
        isOdooLinked = false;
      }

      const result = await ProductService.getAdminProducts({
        search,
        categoryId,
        brandId,
        page,
        limit,
        sortBy,
        sortOrder,
        isOdooLinked,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/admin/products - Admin Create Product
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createProductSchema.parse(req.body);
      const newProduct = await ProductService.createProduct(validatedInput);
      return res.status(201).json({
        success: true,
        message: "Tạo phụ tùng sản phẩm mới thành công",
        data: newProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/admin/products/:id - Admin Update Product
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const validatedInput = updateProductSchema.parse(req.body);
      const updatedProduct = await ProductService.updateProduct(id, validatedInput);
      return res.status(200).json({
        success: true,
        message: "Cập nhật phụ tùng thành công",
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/admin/products/:id - Admin Delete Product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await ProductService.deleteProduct(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/admin/products/:id/stock - Admin Adjust Stock & Prices
   */
  static async adjustProductStockAndPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const validatedInput = stockAdjustmentSchema.parse(req.body);
      const updatedProduct = await ProductService.adjustProductStockAndPrice(id, validatedInput);
      return res.status(200).json({
        success: true,
        message: "Cập nhật tồn kho & giá phụ tùng thành công",
        data: updatedProduct,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/products/:id/link-odoo - Link or Unlink Product with Odoo ERP
   */
  static async linkOdooProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const odooProductId = req.body && req.body.odooProductId ? Number(req.body.odooProductId) : null;
      const updated = await ProductService.linkOdooProduct(id, odooProductId);
      return res.status(200).json({
        success: true,
        message: odooProductId ? "Đã liên kết sản phẩm với Odoo ERP thành công" : "Đã hủy liên kết sản phẩm với Odoo ERP",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/products/sync-by-sku - Batch Sync Products with Odoo ERP by SKU
   */
  static async syncOdooBySku(req: Request, res: Response, next: NextFunction) {
    try {
      const isSyncEnabled = await OdooIntegrationService.isSyncEnabled();
      if (!isSyncEnabled) {
        throw new AppError(
          "Tích hợp Odoo ERP hiện đang bị tạm ngắt kết nối bởi Quản trị viên trong Cài đặt Hệ thống.",
          403
        );
      }

      const items = req.body && Array.isArray(req.body.items) ? req.body.items : [];
      const publicBaseUrl = req.body && typeof req.body.publicBaseUrl === "string" ? req.body.publicBaseUrl : undefined;
      const result = await ProductService.syncOdooBySku(items, publicBaseUrl);
      return res.status(200).json({
        success: true,
        message: `Đồng bộ hoàn tất: Ghép nối ${result.totalMatched} sản phẩm, chưa khớp ${result.totalUnmatched} sản phẩm`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/products/batch-unlink-odoo - Batch Unlink Products from Odoo ERP
   */
  static async batchUnlinkOdooProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const isSyncEnabled = await OdooIntegrationService.isSyncEnabled();
      if (!isSyncEnabled) {
        throw new AppError(
          "Tích hợp Odoo ERP hiện đang bị tạm ngắt kết nối bởi Quản trị viên trong Cài đặt Hệ thống.",
          403
        );
      }

      const odooProductIds = req.body && Array.isArray(req.body.odooProductIds) ? req.body.odooProductIds : [];
      const webProductIds = req.body && Array.isArray(req.body.webProductIds) ? req.body.webProductIds : [];
      const result = await ProductService.batchUnlinkOdooProducts({ odooProductIds, webProductIds });
      return res.status(200).json({
        success: true,
        message: `Đã hủy liên kết Odoo ERP cho ${result.count} sản phẩm`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/products/:id/link-odoo - Explicit Unlink Product from Odoo ERP
   */
  static async unlinkOdooProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const updated = await ProductService.linkOdooProduct(id, null);
      return res.status(200).json({
        success: true,
        message: "Đã hủy liên kết sản phẩm với Odoo ERP",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
