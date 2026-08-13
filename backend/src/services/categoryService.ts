import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/categoryValidator";

export class CategoryService {
  /**
   * Helper function to generate clean URL slug from Vietnamese string
   */
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
   * Get 2-Level Hierarchical Category Tree for Public Website & Admin
   */
  static async getCategoryTree() {
    const mainCategories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: {
          orderBy: { sortOrder: "asc" },
          include: {
            _count: {
              select: { products: true },
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    return mainCategories;
  }

  /**
   * Get Category by ID with Children
   */
  static async getCategoryById(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new AppError("Không tìm thấy danh mục yêu cầu", 404);
    }

    return category;
  }

  /**
   * Create New Category (Main or Sub-Category via parentId)
   */
  static async createCategory(input: CreateCategoryInput) {
    const slug = this.slugify(input.name);

    // Check slug uniqueness
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError("Tên danh mục này đã tồn tại trong hệ thống", 400);
    }

    // If parentId provided, verify parent exists
    if (input.parentId) {
      const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
      if (!parent) {
        throw new AppError("Danh mục cha được chọn không tồn tại", 400);
      }
    }

    const category = await prisma.category.create({
      data: {
        name: input.name.trim(),
        slug,
        parentId: input.parentId || null,
        description: input.description,
        sortOrder: input.sortOrder || 0,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return category;
  }

  /**
   * Update Category
   */
  static async updateCategory(id: number, input: UpdateCategoryInput) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError("Không tìm thấy danh mục để cập nhật", 404);
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (input.name && input.name !== category.name) {
      dataToUpdate.name = input.name.trim();
      const newSlug = this.slugify(input.name);

      const existingSlug = await prisma.category.findUnique({ where: { slug: newSlug } });
      if (existingSlug && existingSlug.id !== id) {
        throw new AppError("Tên danh mục này bị trùng lặp với danh mục khác", 400);
      }

      dataToUpdate.slug = newSlug;
    }

    if (input.parentId !== undefined) {
      if (input.parentId === id) {
        throw new AppError("Danh mục không thể làm cha của chính nó", 400);
      }
      dataToUpdate.parentId = input.parentId;
    }

    if (input.description !== undefined) dataToUpdate.description = input.description;
    if (input.sortOrder !== undefined) dataToUpdate.sortOrder = input.sortOrder;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: dataToUpdate,
      include: {
        parent: true,
        children: true,
      },
    });

    return updatedCategory;
  }

  /**
   * Delete Category (Main or Sub-Category)
   */
  static async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      throw new AppError("Không tìm thấy danh mục để xóa", 404);
    }

    // Check total products linked directly to this category or via child subcategories
    const childProductCount = category.children.reduce((acc: number, sub: any) => acc + sub._count.products, 0);
    const totalProducts = category._count.products + childProductCount;

    if (totalProducts > 0) {
      throw new AppError(
        `Không thể xóa danh mục "${category.name}" vì đang chứa ${totalProducts} phụ tùng sản phẩm liên kết. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
        400
      );
    }

    // If no products linked, delete all child subcategories first, then delete main category
    await prisma.$transaction([
      prisma.category.deleteMany({ where: { parentId: id } }),
      prisma.category.delete({ where: { id } }),
    ]);

    return { success: true, message: `Đã xóa danh mục "${category.name}" thành công` };
  }
}
