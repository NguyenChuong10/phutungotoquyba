import prisma from "../config/db";
import { AppError } from "../utils/AppError";

function toSlug(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/([^0-9a-z-\s])/g, "")
    .replace(/(\s+)/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function ensurePartnerBrandsTable() {
  // No-op kept for backward compatibility initialization
}

export class PartnerBrandService {
  /**
   * Get all brands from unified PostgreSQL brands table
   */
  static async getPartnerBrands() {
    return await prisma.brand.findMany({
      orderBy: { id: "asc" },
    });
  }

  /**
   * Create new brand in unified PostgreSQL brands table
   */
  static async createPartnerBrand(data: { name: string; logoUrl: string }) {
    if (!data.name || !data.name.trim()) {
      throw new AppError("Tên thương hiệu không được để trống", 400);
    }

    const trimmedName = data.name.trim();
    const slug = toSlug(trimmedName) || `brand-${Date.now()}`;

    return await prisma.brand.create({
      data: {
        name: trimmedName,
        slug,
        logoUrl: data.logoUrl ? data.logoUrl.trim() : "/images/logo/logonen.png",
      },
    });
  }

  /**
   * Update brand by ID in unified PostgreSQL brands table
   */
  static async updatePartnerBrand(id: number, data: { name?: string; logoUrl?: string }) {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy thương hiệu", 404);
    }

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name.trim();
      updateData.slug = toSlug(data.name.trim()) || `brand-${id}`;
    }
    if (data.logoUrl !== undefined) {
      updateData.logoUrl = data.logoUrl.trim();
    }

    return await prisma.brand.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete brand permanently from unified PostgreSQL brands table
   */
  static async deletePartnerBrand(id: number) {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy thương hiệu", 404);
    }

    await prisma.brand.delete({ where: { id } });
    return { success: true, message: "Đã xóa thương hiệu thành công khỏi hệ thống." };
  }
}
