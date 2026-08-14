import prisma from "../config/db";
import { AppError } from "../utils/AppError";

let isJobTableVerified = false;

export async function ensureJobPostingsTable() {
  if (isJobTableVerified) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(100) DEFAULT 'Toàn thời gian',
        salary VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        quantity VARCHAR(100) DEFAULT '01 Người',
        requirements JSONB DEFAULT '[]'::jsonb,
        responsibilities JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    isJobTableVerified = true;
  } catch (err) {
    console.error("Auto table creation check failed for job_postings:", err);
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") + "-" + Date.now().toString(36);
}

export interface JobPostingInput {
  title: string;
  type?: string;
  salary: string;
  location: string;
  quantity?: string;
  requirements?: string[];
  responsibilities?: string[];
  isActive?: boolean;
}

export class JobPostingService {
  /**
   * Get all active job postings for Public Careers Page
   */
  static async getPublicJobPostings() {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;
    try {
      return await db.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      });
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        return await db.findMany({
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
        });
      }
      throw err;
    }
  }

  /**
   * Get all job postings for Admin Management (active & inactive)
   */
  static async getAllJobPostings() {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;
    try {
      return await db.findMany({
        orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
      });
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        return await db.findMany({
          orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
        });
      }
      throw err;
    }
  }

  /**
   * Create new job posting in database
   */
  static async createJobPosting(data: JobPostingInput) {
    if (!data.title || !data.title.trim()) {
      throw new AppError("Tiêu đề vị trí tuyển dụng không được để trống", 400);
    }
    if (!data.salary || !data.salary.trim()) {
      throw new AppError("Mức lương dự kiến không được để trống", 400);
    }
    if (!data.location || !data.location.trim()) {
      throw new AppError("Địa điểm làm việc không được để trống", 400);
    }

    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;
    const slug = generateSlug(data.title.trim());

    try {
      const count = await db.count();
      const newJob = await db.create({
        data: {
          title: data.title.trim(),
          slug,
          type: data.type ? data.type.trim() : "Toàn thời gian",
          salary: data.salary.trim(),
          location: data.location.trim(),
          quantity: data.quantity ? data.quantity.trim() : "01 Người",
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
          isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
          sortOrder: count + 1,
        },
      });
      return newJob;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        const count = await db.count();
        return await db.create({
          data: {
            title: data.title.trim(),
            slug,
            type: data.type ? data.type.trim() : "Toàn thời gian",
            salary: data.salary.trim(),
            location: data.location.trim(),
            quantity: data.quantity ? data.quantity.trim() : "01 Người",
            requirements: Array.isArray(data.requirements) ? data.requirements : [],
            responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
            isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            sortOrder: count + 1,
          },
        });
      }
      throw err;
    }
  }

  /**
   * Update existing job posting in database
   */
  static async updateJobPosting(id: number, data: Partial<JobPostingInput>): Promise<any> {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;

    try {
      const existing = await db.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Không tìm thấy tin tuyển dụng này", 404);
      }

      const updateData: any = {};
      if (data.title && data.title.trim()) updateData.title = data.title.trim();
      if (data.type !== undefined) updateData.type = data.type.trim();
      if (data.salary !== undefined) updateData.salary = data.salary.trim();
      if (data.location !== undefined) updateData.location = data.location.trim();
      if (data.quantity !== undefined) updateData.quantity = data.quantity.trim();
      if (data.requirements !== undefined) updateData.requirements = data.requirements;
      if (data.responsibilities !== undefined) updateData.responsibilities = data.responsibilities;
      if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

      const updated = await db.update({
        where: { id },
        data: updateData,
      });

      return updated;
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        return await this.updateJobPosting(id, data);
      }
      throw err;
    }
  }

  /**
   * Delete job posting permanently from database
   */
  static async deleteJobPosting(id: number) {
    await ensureJobPostingsTable();
    const db = (prisma as any).jobPosting;

    try {
      const existing = await db.findUnique({ where: { id } });
      if (!existing) {
        throw new AppError("Không tìm thấy tin tuyển dụng này", 404);
      }

      await db.delete({ where: { id } });
      return { success: true, message: "Đã xóa tin tuyển dụng thành công khỏi CSDL." };
    } catch (err: any) {
      if (err?.code === 'P2021') {
        isJobTableVerified = false;
        await ensureJobPostingsTable();
        const existing = await db.findUnique({ where: { id } });
        if (!existing) throw new AppError("Không tìm thấy tin tuyển dụng này", 404);
        await db.delete({ where: { id } });
        return { success: true, message: "Đã xóa tin tuyển dụng thành công khỏi CSDL." };
      }
      throw err;
    }
  }
}
