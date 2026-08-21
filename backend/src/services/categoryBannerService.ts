import prisma from "../config/db";
import { AppError } from "../utils/AppError";

export class CategoryBannerService {
  static async getCategoryBanners() {
    return await prisma.categoryBanner.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getActiveBanners() {
    return await prisma.categoryBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async createBanner(data: {
    title: string;
    imageUrl: string;
    description?: string;
    linkUrl?: string;
    sortOrder?: number;
  }) {
    if (!data.title || !data.title.trim()) {
      throw new AppError("Tên banner danh mục không được để trống", 400);
    }
    if (!data.imageUrl || !data.imageUrl.trim()) {
      throw new AppError("Vui lòng tải ảnh banner danh mục lên máy chủ", 400);
    }

    return await prisma.categoryBanner.create({
      data: {
        title: data.title.trim(),
        imageUrl: data.imageUrl.trim(),
        description: data.description ? data.description.trim() : null,
        linkUrl: data.linkUrl ? data.linkUrl.trim() : "/products",
        sortOrder: Number(data.sortOrder) || 0,
      },
    });
  }

  static async updateBanner(
    id: number,
    data: {
      title?: string;
      imageUrl?: string;
      description?: string;
      linkUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.categoryBanner.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy banner danh mục để cập nhật", 404);
    }

    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl.trim();
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl.trim();
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    return await prisma.categoryBanner.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteBanner(id: number) {
    const existing = await prisma.categoryBanner.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy banner danh mục để xóa", 404);
    }

    await prisma.categoryBanner.delete({ where: { id } });
    return { success: true, message: "Đã xóa banner danh mục thành công" };
  }
}
