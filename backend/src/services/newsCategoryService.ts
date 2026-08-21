import prisma from "../config/db";
import { AppError } from "../utils/AppError";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const DEFAULT_NEWS_CATEGORIES = [
  { name: "Cẩm Nang Kỹ Thuật", slug: "cam-nang-ky-thuat" },
  { name: "Bảo Dưỡng Xe Tải", slug: "bao-duong-xe-tai" },
  { name: "Mẹo Tra Mã VIN", slug: "tra-ma-vin" },
  { name: "Tin Tức Q.BA", slug: "tin-tuc-quy-ba" },
];

export class NewsCategoryService {
  /**
   * Get All News Categories (Seeds default categories if table is empty)
   */
  static async getAllCategories() {
    let categories = await prisma.newsCategory.findMany({
      orderBy: { id: "asc" },
    });

    if (categories.length === 0) {
      await prisma.newsCategory.createMany({
        data: DEFAULT_NEWS_CATEGORIES,
        skipDuplicates: true,
      });

      categories = await prisma.newsCategory.findMany({
        orderBy: { id: "asc" },
      });
    }

    return categories;
  }

  /**
   * Create New News Category
   */
  static async createCategory(name: string) {
    if (!name || !name.trim()) {
      throw new AppError("Tên danh mục bài viết không được để trống", 400);
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const existing = await prisma.newsCategory.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError("Danh mục này đã tồn tại trong hệ thống", 400);
    }

    const newCategory = await prisma.newsCategory.create({
      data: {
        name: cleanName,
        slug,
      },
    });

    return newCategory;
  }

  /**
   * Update News Category
   */
  static async updateCategory(id: number, name: string) {
    if (!name || !name.trim()) {
      throw new AppError("Tên danh mục bài viết không được để trống", 400);
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    const existing = await prisma.newsCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy danh mục để sửa", 404);
    }

    const updated = await prisma.newsCategory.update({
      where: { id },
      data: {
        name: cleanName,
        slug,
      },
    });

    return updated;
  }

  /**
   * Delete News Category
   */
  static async deleteCategory(id: number) {
    const existing = await prisma.newsCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy danh mục để xóa", 404);
    }

    await prisma.newsCategory.delete({ where: { id } });
    return { success: true, message: `Đã xóa danh mục "${existing.name}"` };
  }
}
