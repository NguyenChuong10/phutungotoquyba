import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { CreateProductInput, UpdateProductInput } from "../validators/productValidator";
import { OdooIntegrationService } from "./odooIntegrationService";

export class ProductService {
  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  /**
   * Public Product Query (Data Privacy Masking: Strips internalCode, internalName, costPrice, stockQuantity)
   */
  static async getPublicProducts(query: {
    search?: string;
    categorySlug?: string;
    subCategorySlug?: string;
    brandName?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 12, 5000);
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    const andConditions: any[] = [];

    // Category Filter
    if (query.subCategorySlug) {
      andConditions.push({ category: { slug: query.subCategorySlug } });
    } else if (query.categorySlug && query.categorySlug !== "all") {
      andConditions.push({
        OR: [
          { category: { slug: query.categorySlug } },
          { category: { parent: { slug: query.categorySlug } } },
        ],
      });
    }

    // Brand Filter
    if (query.brandName && query.brandName !== "Tất cả thương hiệu") {
      if (query.brandName === "Không") {
        andConditions.push({
          OR: [
            { brandId: null },
            { brand: { name: { in: ["Chưa Phân Loại", "Chưa phân loại", "Không", "Không có thương hiệu"] } } },
          ],
        });
      } else {
        andConditions.push({ brand: { name: query.brandName } });
      }
    }

    // Search Query (Searches in public name, partNumber, internalCode, internalName, description, brand)
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { partNumber: { contains: q, mode: "insensitive" } },
          { internalCode: { contains: q, mode: "insensitive" } },
          { internalName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    if (andConditions.length > 0) {
      whereCondition.AND = andConditions;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereCondition }),
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          partNumber: true,
          internalCode: true,
          internalName: true,
          price: true,
          inStock: true,
          qualityStandard: true,
          description: true,
          specifications: true,
          compatibility: true,
          category: {
            select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { isPrimary: "desc" },
            select: { id: true, imageUrl: true, isPrimary: true },
          },
          isOdooLinked: true,
          odooProductId: true,
          // CRITICAL SECURITY PRIVACY CONTRACT: internalCode, internalName, costPrice, stockQuantity are NOT selected
        },
      }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Public Get Product Detail by ID or Slug (Data Privacy Masking)
   */
  static async getPublicProductByIdOrSlug(identifier: string) {
    const cleanIdentifier = String(identifier || "").trim();
    const MAX_PG_INT = 2147483647;
    let numericId: number | null = null;

    if (/^\d+$/.test(cleanIdentifier)) {
      const parsed = Number(cleanIdentifier);
      if (!isNaN(parsed) && parsed > 0 && parsed <= MAX_PG_INT) {
        numericId = parsed;
      }
    } else {
      const match = cleanIdentifier.match(/-(\d+)$/);
      if (match && match[1]) {
        const parsed = Number(match[1]);
        if (!isNaN(parsed) && parsed > 0 && parsed <= MAX_PG_INT) {
          numericId = parsed;
        }
      }
    }

    const selectFields = {
      id: true,
      name: true,
      slug: true,
      partNumber: true,
      internalCode: true,
      internalName: true,
      price: true,
      inStock: true,
      qualityStandard: true,
      description: true,
      specifications: true,
      compatibility: true,
      category: {
        select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } },
      },
      brand: {
        select: { id: true, name: true, slug: true },
      },
      images: {
        orderBy: { isPrimary: "desc" as const },
        select: { id: true, imageUrl: true, isPrimary: true },
      },
      isOdooLinked: true,
      odooProductId: true,
    };

    let product = null;
    if (numericId !== null) {
      product = await prisma.product.findUnique({
        where: { id: numericId },
        select: selectFields,
      });
    }

    if (!product && cleanIdentifier) {
      product = await prisma.product.findUnique({
        where: { slug: cleanIdentifier },
        select: selectFields,
      });
    }

    if (!product && cleanIdentifier) {
      product = await prisma.product.findFirst({
        where: { slug: { equals: cleanIdentifier, mode: "insensitive" } },
        select: selectFields,
      });
    }

    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm phụ tùng yêu cầu", 404);
    }

    return product;
  }

  /**
   * Admin Full Product Catalog (Includes all internal fields: internalCode, internalName, costPrice, stockQuantity)
   */
  static async getAdminProducts(query: {
    search?: string;
    categoryId?: number;
    brandId?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    isOdooLinked?: boolean;
  }) {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 5000);
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    const andConditions: any[] = [];

    if (typeof query.isOdooLinked === "boolean") {
      andConditions.push({ isOdooLinked: query.isOdooLinked });
    }

    if (query.categoryId) {
      andConditions.push({
        OR: [
          { categoryId: query.categoryId },
          { category: { parentId: query.categoryId } },
        ],
      });
    }

    if (query.brandId) {
      andConditions.push({ brandId: query.brandId });
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { partNumber: { contains: q, mode: "insensitive" } },
          { internalCode: { contains: q, mode: "insensitive" } },
          { internalName: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    if (andConditions.length > 0) {
      whereCondition.AND = andConditions;
    }

    // Dynamic Server-Side Sorting Order
    let orderByCondition: any = { createdAt: "desc" };
    if (query.sortBy) {
      const order = query.sortOrder === "asc" ? "asc" : "desc";
      switch (query.sortBy) {
        case "internalCode":
          orderByCondition = { internalCode: order };
          break;
        case "partNumber":
          orderByCondition = { partNumber: order };
          break;
        case "name":
          orderByCondition = { name: order };
          break;
        case "brand":
          orderByCondition = [
            { brand: { name: order } },
            { name: "asc" },
          ];
          break;
        case "stock":
          orderByCondition = { stockQuantity: order };
          break;
        case "price":
          orderByCondition = { price: order };
          break;
        case "status":
          orderByCondition = { stockQuantity: order };
          break;
        case "isOdooLinked":
          orderByCondition = { isOdooLinked: order };
          break;
        case "createdAt":
          orderByCondition = { createdAt: order };
          break;
        default:
          orderByCondition = { createdAt: "desc" };
      }
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereCondition }),
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: orderByCondition,
        include: {
          category: {
            select: { id: true, name: true, slug: true, parent: { select: { id: true, name: true, slug: true } } },
          },
          brand: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { isPrimary: "desc" } },
        },
      }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin Create New Product
   */
  static async createProduct(input: CreateProductInput) {
    if (input.stockQuantity !== undefined && input.stockQuantity < 0) {
      throw new AppError("Số lượng tồn kho không được âm (< 0)", 400);
    }
    if (input.price !== undefined && input.price < 0) {
      throw new AppError("Giá bán sản phẩm không được âm (< 0)", 400);
    }
    if (input.costPrice !== undefined && input.costPrice < 0) {
      throw new AppError("Giá vốn nhập kho không được âm (< 0)", 400);
    }

    const baseSlug = this.slugify(input.name);
    const slug = `${baseSlug}-${Date.now()}`;

    // Verify Category & Brand Existence
    const categoryExists = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!categoryExists) {
      throw new AppError(`Danh mục phụ tùng đã chọn (ID: ${input.categoryId}) không tồn tại trong hệ thống`, 400);
    }

    let finalBrandId: number | null = input.brandId && Number(input.brandId) > 0 ? Number(input.brandId) : null;
    if (finalBrandId) {
      let brandExists = await prisma.brand.findUnique({ where: { id: finalBrandId } });
      if (!brandExists) {
        finalBrandId = null;
      }
    }

    const partNoVal = input.partNumber && input.partNumber.trim() ? input.partNumber.trim() : "";
    const trimmedName = input.name.trim();
    const trimmedInternalCode = input.internalCode.trim();
    const trimmedInternalName = input.internalName ? input.internalName.trim() : '';

    // Verify Duplicate Product Name / Internal Code / Internal Name / Part Number
    const duplicateOrConditions: any[] = [
      { name: { equals: trimmedName, mode: 'insensitive' } },
      { internalCode: { equals: trimmedInternalCode, mode: 'insensitive' } },
    ];
    if (partNoVal) {
      duplicateOrConditions.push({ partNumber: { equals: partNoVal, mode: 'insensitive' } });
    }
    if (trimmedInternalName) {
      duplicateOrConditions.push({ internalName: { equals: trimmedInternalName, mode: 'insensitive' } });
    }

    const existingDuplicate = await prisma.product.findFirst({
      where: {
        OR: duplicateOrConditions,
      },
    });

    if (existingDuplicate) {
      if (existingDuplicate.name.toLowerCase() === trimmedName.toLowerCase()) {
        throw new AppError(`Sản phẩm công khai "${trimmedName}" đã tồn tại trong kho hàng. Không được tạo lại!`, 400);
      }
      if (existingDuplicate.internalCode.toLowerCase() === trimmedInternalCode.toLowerCase()) {
        throw new AppError(`Mã sản phẩm nội bộ [${trimmedInternalCode}] đã tồn tại trong kho hàng. Không được tạo trùng mã nội bộ!`, 400);
      }
      if (existingDuplicate.internalName && trimmedInternalName && existingDuplicate.internalName.toLowerCase() === trimmedInternalName.toLowerCase()) {
        throw new AppError(`Tên/mã phụ tùng nội bộ kho "${trimmedInternalName}" đã tồn tại cho sản phẩm khác. Không được tạo trùng mã nội bộ!`, 400);
      }
      if (partNoVal && existingDuplicate.partNumber && existingDuplicate.partNumber.toLowerCase() === partNoVal.toLowerCase()) {
        throw new AppError(`Mã Part No. "${partNoVal}" đã tồn tại trong kho hàng!`, 400);
      }
      throw new AppError(`Sản phẩm phụ tùng này đã tồn tại trong kho hàng và không được tạo trùng!`, 400);
    }

    const product = await prisma.product.create({
      data: {
        name: input.name.trim(),
        slug,
        partNumber: partNoVal,
        internalCode: input.internalCode.trim(),
        internalName: input.internalName.trim(),
        categoryId: input.categoryId,
        brandId: finalBrandId,
        price: input.price,
        costPrice: input.costPrice,
        stockQuantity: input.stockQuantity,
        inStock: input.stockQuantity > 0,
        qualityStandard: input.qualityStandard,
        description: input.description,
        specifications: input.specifications,
        compatibility: input.compatibility,
        images: {
          createMany: {
            data: input.images && input.images.length > 0
              ? input.images
              : [{ imageUrl: "/images/logo/logonen.png", isPrimary: true, sortOrder: 0 }],
          },
        },
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });

    return product;
  }

  /**
   * Admin Update Product
   */
  static async updateProduct(id: number, input: UpdateProductInput) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm phụ tùng để cập nhật", 404);
    }

    if (input.categoryId) {
      const categoryExists = await prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!categoryExists) {
        throw new AppError(`Danh mục phụ tùng đã chọn (ID: ${input.categoryId}) không tồn tại trong hệ thống`, 400);
      }
    }

    let targetBrandId: number | null | undefined = undefined;
    if (input.brandId !== undefined) {
      targetBrandId = input.brandId && Number(input.brandId) > 0 ? Number(input.brandId) : null;
      if (targetBrandId) {
        const brandExists = await prisma.brand.findUnique({ where: { id: targetBrandId } });
        if (!brandExists) {
          targetBrandId = null;
        }
      }
    }

    if (input.name && input.name.trim().toLowerCase() !== product.name.toLowerCase()) {
      const trimmedName = input.name.trim();
      const existingName = await prisma.product.findFirst({
        where: { name: { equals: trimmedName, mode: 'insensitive' }, id: { not: id } },
      });
      if (existingName) {
        throw new AppError(`Sản phẩm "${trimmedName}" đã tồn tại trong kho hàng. Không được đổi trùng tên!`, 400);
      }
    }

    if (input.internalName && input.internalName.trim().toLowerCase() !== (product.internalName || '').toLowerCase()) {
      const trimmedIntName = input.internalName.trim();
      const existingIntName = await prisma.product.findFirst({
        where: { internalName: { equals: trimmedIntName, mode: 'insensitive' }, id: { not: id } },
      });
      if (existingIntName) {
        throw new AppError(`Tên/mã phụ tùng nội bộ kho "${trimmedIntName}" đã bị trùng với sản phẩm khác. Không được tạo trùng mã nội bộ!`, 400);
      }
    }

    if (input.internalCode && input.internalCode.trim().toLowerCase() !== product.internalCode.toLowerCase()) {
      const trimmedIntCode = input.internalCode.trim();
      const existingIntCode = await prisma.product.findFirst({
        where: { internalCode: { equals: trimmedIntCode, mode: 'insensitive' }, id: { not: id } },
      });
      if (existingIntCode) {
        throw new AppError(`Mã quản lý nội bộ Q.BA [${trimmedIntCode}] bị trùng với sản phẩm khác. Không được tạo trùng mã nội bộ!`, 400);
      }
    }

    if (input.images && input.images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: input.images.map((img) => ({
          productId: id,
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary ?? true,
          sortOrder: img.sortOrder ?? 0,
        })),
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: input.name ? input.name.trim() : undefined,
        partNumber: input.partNumber !== undefined ? input.partNumber.trim() : undefined,
        internalCode: input.internalCode ? input.internalCode.trim() : undefined,
        internalName: input.internalName ? input.internalName.trim() : undefined,
        categoryId: input.categoryId,
        brandId: targetBrandId,
        price: input.price,
        costPrice: input.costPrice,
        stockQuantity: input.stockQuantity,
        inStock: input.inStock,
        qualityStandard: input.qualityStandard,
        description: input.description,
        specifications: input.specifications,
        compatibility: input.compatibility,
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });

    return updatedProduct;
  }

  /**
   * Admin Delete Product
   */
  static async deleteProduct(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm phụ tùng để xóa", 404);
    }

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return { success: true, message: "Đã xóa sản phẩm thành công" };
  }

  /**
   * Admin Adjust Product Inventory Stock & Prices (Guarantees non-negative values)
   */
  static async adjustProductStockAndPrice(
    id: number,
    input: { stockQuantity: number; price: number; costPrice: number; adjustmentNote?: string }
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError("Không tìm thấy sản phẩm phụ tùng để điều chỉnh kho", 404);
    }

    if (input.stockQuantity < 0) {
      throw new AppError("Số lượng tồn kho không được âm (không được nhỏ hơn 0)!", 400);
    }

    if (input.price < 0) {
      throw new AppError("Giá bán sản phẩm không được âm (không được nhỏ hơn 0)!", 400);
    }

    if (input.costPrice < 0) {
      throw new AppError("Giá vốn nhập kho không được âm (không được nhỏ hơn 0)!", 400);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stockQuantity: input.stockQuantity,
        price: input.price,
        costPrice: input.costPrice,
        inStock: input.stockQuantity > 0,
      },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });

    return updated;
  }

  /**
   * Link or Unlink Product with Odoo ERP
   */
  static async linkOdooProduct(productId: number, odooProductId: number | null) {
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      throw new AppError("Không tìm thấy sản phẩm trên website", 404);
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        odooProductId: odooProductId ? Number(odooProductId) : null,
        isOdooLinked: Boolean(odooProductId),
        odooLinkedAt: odooProductId ? new Date() : null,
      },
    });

    return updated;
  }

  /**
   * Batch sync products with Odoo ERP by matching SKU (internalCode <-> default_code)
   */
  static async syncOdooBySku(
    items: Array<{ odooId: number; sku: string }>,
    publicBaseUrl?: string
  ) {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        matched: [],
        unmatched: [],
        totalMatched: 0,
        totalUnmatched: 0,
      };
    }

    const host = (publicBaseUrl || process.env.PUBLIC_SITE_URL || "https://phutungotoquyba.com").replace(/\/+$/, "");

    // Prepare map of normalized SKU -> odooId
    const odooMap = new Map<string, number>();
    for (const item of items) {
      if (item && item.sku && typeof item.sku === "string" && item.odooId) {
        const cleanSku = item.sku.trim().toUpperCase();
        if (cleanSku) {
          odooMap.set(cleanSku, Number(item.odooId));
        }
      }
    }

    if (odooMap.size === 0) {
      return {
        matched: [],
        unmatched: items,
        totalMatched: 0,
        totalUnmatched: items.length,
      };
    }

    // Reset any existing stale links for incoming odooIds to guarantee no unique constraint clash
    const incomingOdooIds = Array.from(odooMap.values());
    if (incomingOdooIds.length > 0) {
      await prisma.product.updateMany({
        where: { odooProductId: { in: incomingOdooIds } },
        data: { odooProductId: null, isOdooLinked: false, odooLinkedAt: null },
      });
    }

    // Retrieve web products with non-empty internalCode
    const webProducts = await prisma.product.findMany({
      where: {
        internalCode: { not: "" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        internalCode: true,
        partNumber: true,
        isOdooLinked: true,
        odooProductId: true,
      },
    });

    const matched: Array<{
      odooId: number;
      webId: number;
      name: string;
      slug: string;
      sku: string;
      partNumber: string;
      webUrl: string;
    }> = [];

    const matchedOdooIds = new Set<number>();
    const updatePromises: Promise<any>[] = [];

    for (const wp of webProducts) {
      const cleanWebSku = (wp.internalCode || "").trim().toUpperCase();
      if (cleanWebSku && odooMap.has(cleanWebSku)) {
        const odooId = odooMap.get(cleanWebSku)!;
        const webUrl = `${host}/products/${wp.slug}-${wp.id}`;

        matched.push({
          odooId,
          webId: wp.id,
          name: wp.name,
          slug: wp.slug,
          sku: wp.internalCode,
          partNumber: wp.partNumber || "",
          webUrl,
        });

        matchedOdooIds.add(odooId);

        updatePromises.push(
          prisma.product.update({
            where: { id: wp.id },
            data: {
              odooProductId: odooId,
              isOdooLinked: true,
              odooLinkedAt: new Date(),
            },
          })
        );
      }
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
    }

    const unmatched = items.filter((item) => !matchedOdooIds.has(Number(item.odooId)));

    // Record last sync result to database for Admin UI
    await OdooIntegrationService.recordSyncResult({
      matchedCount: matched.length,
      unmatchedCount: unmatched.length,
      status: "success",
    });

    return {
      matched,
      unmatched,
      totalMatched: matched.length,
      totalUnmatched: unmatched.length,
    };
  }

  /**
   * Batch Unlink Products from Odoo ERP
   */
  static async batchUnlinkOdooProducts(input: {
    odooProductIds?: number[];
    webProductIds?: number[];
  }) {
    const odooIds = Array.isArray(input.odooProductIds)
      ? input.odooProductIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];
    const webIds = Array.isArray(input.webProductIds)
      ? input.webProductIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [];

    const orConditions: any[] = [];
    if (odooIds.length > 0) {
      orConditions.push({ odooProductId: { in: odooIds } });
    }
    if (webIds.length > 0) {
      orConditions.push({ id: { in: webIds } });
    }

    if (orConditions.length === 0) {
      return { count: 0 };
    }

    const result = await prisma.product.updateMany({
      where: {
        OR: orConditions,
      },
      data: {
        odooProductId: null,
        isOdooLinked: false,
        odooLinkedAt: null,
      },
    });

    return result;
  }
}
