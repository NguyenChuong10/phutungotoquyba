import prisma from "../config/db";
import { AppError } from "../utils/AppError";

export class HeroSlideService {
  static async getAllSlidesAdmin() {
    return await prisma.heroSlide.findMany({
      orderBy: { sortOrder: "asc" },
    });
  }

  static async getActiveSlides() {
    return await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  static async createSlide(data: {
    title: string;
    imageUrl: string;
    altText?: string;
    linkUrl?: string;
    sortOrder?: number;
  }) {
    if (!data.title || !data.title.trim()) {
      throw new AppError("Tên tiêu đề slide không được để trống", 400);
    }
    if (!data.imageUrl || !data.imageUrl.trim()) {
      throw new AppError("Vui lòng tải ảnh banner slide lên máy chủ", 400);
    }

    return await prisma.heroSlide.create({
      data: {
        title: data.title.trim().toUpperCase(),
        imageUrl: data.imageUrl.trim(),
        altText: data.altText ? data.altText.trim() : `Phụ tùng ${data.title.trim()}`,
        linkUrl: data.linkUrl ? data.linkUrl.trim() : "/products",
        sortOrder: Number(data.sortOrder) || 0,
      },
    });
  }

  static async updateSlide(
    id: number,
    data: {
      title?: string;
      imageUrl?: string;
      altText?: string;
      linkUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy slide banner để cập nhật", 404);
    }

    const updateData: Record<string, any> = {};
    if (data.title !== undefined) updateData.title = data.title.trim().toUpperCase();
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl.trim();
    if (data.altText !== undefined) updateData.altText = data.altText.trim();
    if (data.linkUrl !== undefined) updateData.linkUrl = data.linkUrl.trim();
    if (data.sortOrder !== undefined) updateData.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

    return await prisma.heroSlide.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteSlide(id: number) {
    const existing = await prisma.heroSlide.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy slide banner để xóa", 404);
    }

    await prisma.heroSlide.delete({ where: { id } });
    return { success: true, message: "Đã xóa slide banner thành công" };
  }
}
