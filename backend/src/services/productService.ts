import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { CreateProductInput, UpdateProductInput } from "../validators/productValidator";

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
    const limit = Math.min(query.limit || 12, 50);
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};

    // Category Filter
    if (query.subCategorySlug) {
      whereCondition.category = { slug: query.subCategorySlug };
    } else if (query.categorySlug && query.categorySlug !== "all") {
      whereCondition.OR = [
        { category: { slug: query.categorySlug } },
        { category: { parent: { slug: query.categorySlug } } },
      ];
    }

    // Brand Filter
    if (query.brandName && query.brandName !== "Tất cả thương hiệu") {
      whereCondition.brand = { name: query.brandName };
    }

    // Search Query (Searches in public name, partNumber, description)
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      whereCondition.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { partNumber: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
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
    const isId = !isNaN(Number(identifier));

    const product = await prisma.product.findUnique({
      where: isId ? { id: Number(identifier) } : { slug: identifier },
      select: {
        id: true,
        name: true,
        slug: true,
        partNumber: true,
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
        // PRIVACY ENFORCEMENT
      },
    });

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
  }) {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};

    if (query.categoryId) {
      whereCondition.categoryId = query.categoryId;
    }

    if (query.brandId) {
      whereCondition.brandId = query.brandId;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      whereCondition.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { partNumber: { contains: q, mode: "insensitive" } },
        { internalCode: { contains: q, mode: "insensitive" } },
        { internalName: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where: whereCondition }),
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
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
    const [categoryExists, brandExists] = await Promise.all([
      prisma.category.findUnique({ where: { id: input.categoryId } }),
      prisma.brand.findUnique({ where: { id: input.brandId } }),
    ]);

    if (!categoryExists) {
      throw new AppError(`Danh mục phụ tùng đã chọn (ID: ${input.categoryId}) không tồn tại trong hệ thống`, 400);
    }

    if (!brandExists) {
      throw new AppError(`Thương hiệu đã chọn (ID: ${input.brandId}) không tồn tại trong hệ thống`, 400);
    }

    const product = await prisma.product.create({
      data: {
        name: input.name.trim(),
        slug,
        partNumber: input.partNumber.trim(),
        internalCode: input.internalCode.trim(),
        internalName: input.internalName.trim(),
        categoryId: input.categoryId,
        brandId: input.brandId,
        price: input.price,
        costPrice: input.costPrice,
        stockQuantity: input.stockQuantity,
        inStock: input.stockQuantity > 0,
        qualityStandard: input.qualityStandard,
        description: input.description,
        specifications: input.specifications,
        compatibility: input.compatibility,
        images: input.images && input.images.length > 0 ? { createMany: { data: input.images } } : undefined,
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

    if (input.brandId) {
      const brandExists = await prisma.brand.findUnique({ where: { id: input.brandId } });
      if (!brandExists) {
        throw new AppError(`Thương hiệu đã chọn (ID: ${input.brandId}) không tồn tại trong hệ thống`, 400);
      }
    }

    if (input.internalCode && input.internalCode !== product.internalCode) {
      const existingCode = await prisma.product.findUnique({
        where: { internalCode: input.internalCode },
      });
      if (existingCode && existingCode.id !== id) {
        throw new AppError(`Mã quản lý nội bộ Q.BA [${input.internalCode}] bị trùng với sản phẩm khác`, 400);
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
        partNumber: input.partNumber ? input.partNumber.trim() : undefined,
        internalCode: input.internalCode ? input.internalCode.trim() : undefined,
        internalName: input.internalName ? input.internalName.trim() : undefined,
        categoryId: input.categoryId,
        brandId: input.brandId,
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

    await prisma.product.delete({ where: { id } });
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
}
