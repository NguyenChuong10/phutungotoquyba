import prisma from "../config/db";
import { AppError } from "../utils/AppError";

export class PartnerBrandService {
  /**
   * Get all partner brands from PostgreSQL database
   */
  static async getPartnerBrands() {
    const db = (prisma as any).partnerBrand;
    const brands = await db.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { id: "asc" },
      ],
    });

    return brands;
  }

  /**
   * Create new partner brand in database
   */
  static async createPartnerBrand(data: { name: string; logoUrl: string }) {
    if (!data.name || !data.name.trim()) {
      throw new AppError("Tên thương hiệu không được để trống", 400);
    }
    if (!data.logoUrl || !data.logoUrl.trim()) {
      throw new AppError("Đường dẫn ảnh logo không được để trống", 400);
    }

    const db = (prisma as any).partnerBrand;
    const count = await db.count();

    const newBrand = await db.create({
      data: {
        name: data.name.trim(),
        logoUrl: data.logoUrl.trim(),
        sortOrder: count + 1,
      },
    });

    return newBrand;
  }

  /**
   * Update partner brand by ID in database
   */
  static async updatePartnerBrand(id: number, data: { name?: string; logoUrl?: string }) {
    const db = (prisma as any).partnerBrand;
    const existing = await db.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy thương hiệu đối tác", 404);
    }

    const updated = await db.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.logoUrl ? { logoUrl: data.logoUrl.trim() } : {}),
      },
    });

    return updated;
  }

  /**
   * Delete partner brand permanently from database
   */
  static async deletePartnerBrand(id: number) {
    const db = (prisma as any).partnerBrand;
    const existing = await db.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Không tìm thấy thương hiệu đối tác", 404);
    }

    await db.delete({ where: { id } });
    return { success: true, message: "Đã xóa thương hiệu đối tác thành công khỏi CSDL." };
  }
}
