import prisma from "../config/db";
import { AppError } from "../utils/AppError";

let isTableVerified = false;

export async function ensurePartnerBrandsTable() {
  if (isTableVerified) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS partner_brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        logo_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isTableVerified = true;
  } catch (err) {
    console.error("Auto table creation check failed for partner_brands:", err);
  }
}

export class PartnerBrandService {
  /**
   * Get all partner brands from PostgreSQL database
   */
  static async getPartnerBrands() {
    await ensurePartnerBrandsTable();
    const db = (prisma as any).partnerBrand;
    try {
      const brands = await db.findMany({
        orderBy: [
          { sortOrder: "asc" },
          { id: "asc" },
        ],
      });
      return brands;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isTableVerified = false;
        await ensurePartnerBrandsTable();
        return await db.findMany({
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        });
      }
      throw err;
    }
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

    await ensurePartnerBrandsTable();
    const db = (prisma as any).partnerBrand;

    try {
      const count = await db.count();

      const newBrand = await db.create({
        data: {
          name: data.name.trim(),
          logoUrl: data.logoUrl.trim(),
          sortOrder: count + 1,
        },
      });

      return newBrand;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isTableVerified = false;
        await ensurePartnerBrandsTable();
        const count = await db.count();
        return await db.create({
          data: {
            name: data.name.trim(),
            logoUrl: data.logoUrl.trim(),
            sortOrder: count + 1,
          },
        });
      }
      throw err;
    }
  }

  /**
   * Update partner brand by ID in database
   */
  static async updatePartnerBrand(id: number, data: { name?: string; logoUrl?: string }) {
    await ensurePartnerBrandsTable();
    const db = (prisma as any).partnerBrand;

    try {
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
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isTableVerified = false;
        await ensurePartnerBrandsTable();
        const existing = await db.findUnique({ where: { id } });
        if (!existing) throw new AppError("Không tìm thấy thương hiệu đối tác", 404);
        return await db.update({
          where: { id },
          data: {
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(data.logoUrl ? { logoUrl: data.logoUrl.trim() } : {}),
          },
        });
      }
      throw err;
    }
  }

  /**
   * Delete partner brand permanently from database
   */
  static async deletePartnerBrand(id: number) {
    await ensurePartnerBrandsTable();
    const db = (prisma as any).partnerBrand;

    try {
      const existing = await db.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Không tìm thấy thương hiệu đối tác", 404);
      }

      await db.delete({ where: { id } });
      return { success: true, message: "Đã xóa thương hiệu đối tác thành công khỏi hệ thống." };
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isTableVerified = false;
        await ensurePartnerBrandsTable();
        const existing = await db.findUnique({ where: { id } });
        if (!existing) throw new AppError("Không tìm thấy thương hiệu đối tác", 404);
        await db.delete({ where: { id } });
        return { success: true, message: "Đã xóa thương hiệu đối tác thành công khỏi hệ thống." };
      }
      throw err;
    }
  }
}
